import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { getDb } from '../db/index.js';
import { durationToMs } from './duration.js';

export const ACCESS_TOKEN_ISS = 'mws-api';
export const ACCESS_TOKEN_AUD = 'mws-admin';

function sessionExpiryIso() {
  const ms = durationToMs(env.jwt.expiresIn) || 12 * 60 * 60 * 1000;
  return new Date(Date.now() + ms).toISOString();
}

/**
 * Persist a session row and issue a short-lived HS256 JWT bound to it.
 *
 * @param {{ id: string; email: string }} admin
 */
export function issueSession(admin) {
  const jti = randomUUID();
  const expiresAt = sessionExpiryIso();
  getDb()
    .prepare(
      `INSERT INTO admin_sessions (id, admin_id, expires_at) VALUES (?, ?, ?)`,
    )
    .run(jti, admin.id, expiresAt);

  return jwt.sign({ email: admin.email }, env.jwt.secret, {
    algorithm: 'HS256',
    issuer: ACCESS_TOKEN_ISS,
    audience: ACCESS_TOKEN_AUD,
    subject: admin.id,
    jwtid: jti,
    expiresIn: env.jwt.expiresIn,
  });
}

/**
 * @param {string | undefined} jti
 */
export function getSession(jti) {
  if (!jti) return null;
  return (
    getDb()
      .prepare('SELECT id, admin_id, expires_at, revoked_at FROM admin_sessions WHERE id = ?')
      .get(jti) ?? null
  );
}

/**
 * @param {string | undefined} jti
 */
export function isSessionActive(jti) {
  const session = getSession(jti);
  if (!session) return false;
  if (session.revoked_at) return false;
  const expires = Date.parse(session.expires_at);
  if (Number.isFinite(expires) && expires <= Date.now()) return false;
  return true;
}

/**
 * @param {string | undefined} jti
 */
export function revokeSession(jti) {
  if (!jti) return;
  getDb()
    .prepare(
      `UPDATE admin_sessions SET revoked_at = datetime('now') WHERE id = ? AND revoked_at IS NULL`,
    )
    .run(jti);
}

/**
 * @param {string} adminId
 */
export function revokeSessionsForAdmin(adminId) {
  getDb()
    .prepare(
      `UPDATE admin_sessions SET revoked_at = datetime('now') WHERE admin_id = ? AND revoked_at IS NULL`,
    )
    .run(adminId);
}

/**
 * Decode a bearer token even after expiry so logout can still revoke it.
 *
 * @param {string} token
 * @param {{ ignoreExpiration?: boolean }} [options]
 */
export function verifyAccessToken(token, options = {}) {
  return jwt.verify(token, env.jwt.secret, {
    algorithms: ['HS256'],
    issuer: ACCESS_TOKEN_ISS,
    audience: ACCESS_TOKEN_AUD,
    ignoreExpiration: Boolean(options.ignoreExpiration),
  });
}

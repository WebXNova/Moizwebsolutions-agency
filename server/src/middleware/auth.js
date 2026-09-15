import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { getDb } from '../db/index.js';
import { logger } from '../lib/logger.js';
import { isSessionActive, issueSession, verifyAccessToken } from '../lib/sessions.js';

export const ADMIN_ROLES = ['super_admin', 'content_manager', 'editor', 'viewer'];
export const WRITE_ROLES = ['super_admin', 'content_manager', 'editor'];
export const USER_ADMIN_ROLES = ['super_admin'];
export const INQUIRY_ROLES = ['super_admin'];

const UNAUTHORIZED = {
  ok: false,
  code: 'unauthorized',
  message: 'Authentication required.',
};

const INVALID_SESSION = {
  ok: false,
  code: 'unauthorized',
  message: 'Invalid or expired session.',
};

const FORBIDDEN = {
  ok: false,
  code: 'forbidden',
  message: 'Insufficient permissions.',
};

/**
 * @param {Record<string, unknown>} row
 */
export function formatAdmin(row) {
  return {
    id: row.id,
    email: row.email,
    name: row.name || '',
    role: row.role,
    active: Boolean(row.active),
  };
}

/**
 * Current admin record. Role and active come from the database, not the token.
 *
 * @param {string | undefined} id
 * @returns {ReturnType<typeof formatAdmin> | null}
 */
export function loadAdminById(id) {
  if (!id) return null;
  const row = getDb()
    .prepare('SELECT id, email, name, role, active FROM admin_users WHERE id = ?')
    .get(id);
  return row ? formatAdmin(row) : null;
}

/**
 * Unknown/invalid roles never inherit write access.
 *
 * @param {ReturnType<typeof formatAdmin> | null} admin
 */
export function isKnownAdminRole(admin) {
  return Boolean(admin && ADMIN_ROLES.includes(admin.role));
}

/**
 * @param {import('express').Request} req
 * @returns {string | null}
 */
export function readBearerToken(req) {
  const header = req.headers.authorization;
  return header?.startsWith('Bearer ') ? header.slice(7) : null;
}

/**
 * @param {string} token
 * @returns {ReturnType<typeof formatAdmin> | null}
 */
function resolveAdminFromToken(token) {
  const payload = verifyAccessToken(token);
  const adminId = typeof payload.sub === 'string' ? payload.sub : '';
  const jti = typeof payload.jti === 'string' ? payload.jti : '';
  if (!isSessionActive(jti)) return null;
  const session = getDb()
    .prepare('SELECT admin_id FROM admin_sessions WHERE id = ?')
    .get(jti);
  if (!session || session.admin_id !== adminId) return null;
  const admin = loadAdminById(adminId);
  if (!admin || !admin.active) return null;
  if (!isKnownAdminRole(admin)) return null;
  return admin;
}

/**
 * Establishes the current admin: verify JWT, then load a live, active account.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function requireAuth(req, res, next) {
  const token = readBearerToken(req);

  if (!token) {
    return res.status(401).json(UNAUTHORIZED);
  }

  try {
    const payload = verifyAccessToken(token);
    const admin = resolveAdminFromToken(token);
    if (!admin) {
      logger.warn('auth.invalid_session', { reason: 'inactive_unknown_or_revoked' });
      return res.status(401).json(INVALID_SESSION);
    }
    req.admin = admin;
    req.accessTokenJti = typeof payload.jti === 'string' ? payload.jti : '';
    return next();
  } catch (error) {
    const reason = error instanceof jwt.TokenExpiredError ? 'expired' : 'expired_or_malformed';
    logger.warn('auth.invalid_session', { reason });
    return res.status(401).json(INVALID_SESSION);
  }
}

/**
 * Attaches a current admin when a valid active session is present.
 * Invalid or missing tokens stay anonymous so public reads still work.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function optionalAuth(req, res, next) {
  const token = readBearerToken(req);
  if (!token) return next();

  try {
    const admin = resolveAdminFromToken(token);
    if (admin) req.admin = admin;
  } catch {
    // Treat as anonymous. Public project routes must not fail closed on a stale token.
  }

  return next();
}

/**
 * Route-level authorization. Must run after requireAuth (or optionalAuth that set req.admin).
 *
 * @param {...string} roles
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json(UNAUTHORIZED);
    }
    if (!isKnownAdminRole(req.admin) || !roles.includes(req.admin.role)) {
      logger.warn('auth.forbidden', { role: req.admin.role, path: req.path });
      return res.status(403).json(FORBIDDEN);
    }
    return next();
  };
}

export const requireWrite = requireRole(...WRITE_ROLES);
export const requireUserAdmin = requireRole(...USER_ADMIN_ROLES);
export const requireInquiryAccess = requireRole(...INQUIRY_ROLES);

/**
 * Any currently authenticated, active admin with a known role may see unpublished CMS records.
 *
 * @param {import('express').Request} req
 */
export function canViewUnpublished(req) {
  return Boolean(req.admin?.id && req.admin.active && isKnownAdminRole(req.admin));
}

/**
 * @param {{ id: string; email: string }} admin
 */
export function signToken(admin) {
  return issueSession(admin);
}

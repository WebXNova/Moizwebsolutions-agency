import { createHash, createHmac } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from '../config/env.js';
import { durationToMs } from './duration.js';
import { secretsEqual } from './secretEqual.js';

export const ADMIN_GATE_COOKIE = 'mws_ag';

const COOKIE_VERSION = '1';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(__dirname, '../../');

export const CLIENT_DIST_INDEX = path.resolve(serverRoot, '../client/dist/index.html');

const PORTAL_PLACEHOLDER_HTML =
  '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><title></title></head><body></body></html>';

const GENERIC_NOT_FOUND_HTML =
  '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Not found</title><style>html,body{margin:0;min-height:100%;background:#f7f6f2;color:#1a1a1a;font-family:Inter,ui-sans-serif,system-ui,sans-serif}main{min-height:100vh;display:flex;align-items:center;justify-content:center}p{margin:0;font-size:1rem;letter-spacing:.04em}</style></head><body><main><p>Not found.</p></main></body></html>';

function gateTtlMs() {
  return durationToMs(env.jwt.expiresIn) || 12 * 60 * 60 * 1000;
}

function pathFingerprint(secretPath) {
  return createHash('sha256').update(String(secretPath), 'utf8').digest('hex').slice(0, 16);
}

/**
 * @param {string} pathname
 */
export function pathnameWithoutQuery(pathname) {
  const raw = String(pathname || '');
  const cut = raw.indexOf('?');
  return cut === -1 ? raw : raw.slice(0, cut);
}

/**
 * @param {string} pathname
 */
export function firstPathSegment(pathname) {
  const parts = pathnameWithoutQuery(pathname).split('/').filter(Boolean);
  return parts[0] || '';
}

/**
 * @param {string} pathname
 * @param {string} secretPath
 */
export function secretPrefixMatches(pathname, secretPath) {
  if (!secretPath) return false;
  return secretsEqual(firstPathSegment(pathname), secretPath);
}

/**
 * Map /{secret}/... onto the existing /admin/... SPA routes.
 *
 * @param {string} pathname
 * @param {string} secretPath
 * @returns {string | null}
 */
export function mapSecretRequestToAdminPath(pathname, secretPath) {
  if (!secretPrefixMatches(pathname, secretPath)) return null;

  const trimmed = pathnameWithoutQuery(pathname);
  const prefix = `/${secretPath}`;
  let rest = '';
  if (trimmed === prefix || trimmed === `${prefix}/`) rest = '';
  else if (trimmed.startsWith(`${prefix}/`)) rest = trimmed.slice(prefix.length + 1);
  else return null;

  if (rest.includes('\0') || rest.includes('\\') || rest.includes('://')) return null;
  const segments = rest.split('/').filter((part) => part !== '');
  if (segments.some((part) => part === '.' || part === '..')) return null;
  if (segments.some((part) => part.includes('%2e') || part.includes('%2E') || part.includes('%2f') || part.includes('%2F'))) {
    return null;
  }

  if (segments.length === 0 || (segments.length === 1 && segments[0] === 'login')) {
    return '/admin/login';
  }

  if (segments[0] === 'admin') {
    return `/${segments.join('/')}`;
  }

  return `/admin/${segments.join('/')}`;
}

/**
 * @param {string} target
 */
export function isSafeAdminTarget(target) {
  if (typeof target !== 'string' || !target.startsWith('/admin')) return false;
  if (target.startsWith('//') || target.includes('\\') || target.includes('\0')) return false;
  if (target.includes('://')) return false;
  if (target.split('/').includes('..')) return false;
  return true;
}

export function issueGateCookieValue(now = Date.now()) {
  const secretPath = env.adminSecret.path;
  const exp = now + gateTtlMs();
  const fp = pathFingerprint(secretPath);
  const payload = `${COOKIE_VERSION}.${exp}.${fp}`;
  const sig = createHmac('sha256', env.jwt.secret).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

/**
 * @param {unknown} value
 */
export function isValidGateCookie(value) {
  if (typeof value !== 'string' || !value) return false;
  const parts = value.split('.');
  if (parts.length !== 4) return false;
  const [version, expRaw, fp, sig] = parts;
  if (version !== COOKIE_VERSION) return false;
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp <= Date.now()) return false;
  const expectedFp = pathFingerprint(env.adminSecret.path);
  if (!secretsEqual(fp, expectedFp)) return false;
  const payload = `${version}.${expRaw}.${fp}`;
  const expectedSig = createHmac('sha256', env.jwt.secret).update(payload).digest('hex');
  return secretsEqual(sig, expectedSig);
}

/**
 * @param {import('express').Request} req
 * @param {string} name
 */
export function readCookie(req, name) {
  const header = req.headers.cookie;
  if (typeof header !== 'string' || !header) return '';
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    if (key === name) return part.slice(idx + 1).trim();
  }
  return '';
}

function cookieAttributes(maxAgeSeconds) {
  const parts = ['HttpOnly', 'Path=/admin', 'SameSite=Lax', `Max-Age=${maxAgeSeconds}`];
  if (env.isProduction) parts.push('Secure');
  return parts;
}

export function serializeGateCookie() {
  return [`${ADMIN_GATE_COOKIE}=${issueGateCookieValue()}`, ...cookieAttributes(Math.floor(gateTtlMs() / 1000))].join('; ');
}

export function serializeExpiredGateCookie() {
  return [`${ADMIN_GATE_COOKIE}=`, ...cookieAttributes(0)].join('; ');
}

export function applyPortalHeaders(res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
}

/**
 * @param {import('express').Response} res
 */
export function sendPortalNotFound(res) {
  applyPortalHeaders(res);
  res.status(404).type('html').send(GENERIC_NOT_FOUND_HTML);
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export function sendAdminPortalPage(req, res) {
  applyPortalHeaders(res);
  if (fs.existsSync(CLIENT_DIST_INDEX)) {
    return res.sendFile(CLIENT_DIST_INDEX, { dotfiles: 'deny', maxAge: 0 });
  }
  if (req.method === 'HEAD') return res.status(200).end();
  return res.status(200).type('html').send(PORTAL_PLACEHOLDER_HTML);
}

/**
 * Public SPA fallback so Nginx can proxy unknown paths (including the secret
 * admin prefix) to Node without embedding ADMIN_SECRET_PATH in the vhost.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {boolean} true when a response was sent
 */
export function sendPublicSpaPage(req, res) {
  if (!fs.existsSync(CLIENT_DIST_INDEX)) return false;
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(CLIENT_DIST_INDEX, { dotfiles: 'deny', maxAge: 0 });
  return true;
}

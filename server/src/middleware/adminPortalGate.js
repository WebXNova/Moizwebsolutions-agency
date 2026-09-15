import {
  ADMIN_SECRET_MAX_LENGTH,
  ADMIN_SECRET_MIN_LENGTH,
  env,
} from '../config/env.js';
import {
  firstPathSegment,
  mapSecretRequestToAdminPath,
  secretPrefixMatches,
  sendAdminPortalPage,
  sendPortalNotFound,
} from '../lib/adminSecret.js';
import { logger } from '../lib/logger.js';

function isPortalMethod(method) {
  return method === 'GET' || method === 'HEAD';
}

/**
 * Secret-shaped first segments (including a rotated-away path) must not fall
 * through to the public SPA — that would look like a successful portal hit.
 *
 * @param {string} segment
 */
function looksLikeAdminSecretSegment(segment) {
  if (!segment) return false;
  if (segment.length < ADMIN_SECRET_MIN_LENGTH || segment.length > ADMIN_SECRET_MAX_LENGTH) {
    return false;
  }
  if (!/^[A-Za-z0-9_-]+$/.test(segment)) return false;
  if (!/[A-Za-z]/.test(segment)) return false;
  return true;
}

function handleSecretEntry(req, res) {
  if (!isPortalMethod(req.method)) {
    return sendPortalNotFound(res);
  }

  const target = mapSecretRequestToAdminPath(req.path, env.adminSecret.path);
  if (!target) {
    logger.warn('admin.gate_denied', { reason: 'invalid_entry' });
    return sendPortalNotFound(res);
  }

  return sendAdminPortalPage(req, res);
}

/**
 * HTML gate: admin UI is only served under ADMIN_SECRET_PATH.
 * /admin is never the public entry. APIs stay on JWT independently.
 *
 * @param {import('express').Express} app
 */
export function attachAdminPortalGate(app) {
  app.use((req, res, next) => {
    const pathname = req.path || '';
    if (pathname === '/api' || pathname.startsWith('/api/')) return next();
    if (pathname === '/uploads' || pathname.startsWith('/uploads/')) return next();

    const secretPath = env.adminSecret.path;
    if (!secretPath) return next();

    if (secretPrefixMatches(pathname, secretPath)) {
      return handleSecretEntry(req, res);
    }

    if (pathname === '/admin' || pathname.startsWith('/admin/')) {
      logger.warn('admin.gate_denied', { reason: 'legacy_admin_path' });
      return sendPortalNotFound(res);
    }

    if (looksLikeAdminSecretSegment(firstPathSegment(pathname))) {
      logger.warn('admin.gate_denied', { reason: 'secret_mismatch' });
      return sendPortalNotFound(res);
    }

    return next();
  });
}

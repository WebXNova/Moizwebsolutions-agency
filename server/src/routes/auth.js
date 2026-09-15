import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { getDb } from '../db/index.js';
import {
  ADMIN_ROLES,
  formatAdmin,
  isKnownAdminRole,
  readBearerToken,
  requireAuth,
  signToken,
} from '../middleware/auth.js';
import { serializeExpiredGateCookie } from '../lib/adminSecret.js';
import { MAX_PASSWORD_LENGTH } from '../lib/passwordPolicy.js';
import { createRateLimiter } from '../lib/rateLimit.js';
import { revokeSession, verifyAccessToken } from '../lib/sessions.js';
import { asString, isValidEmail, normalizeEmail } from '../lib/validators.js';
import { logger } from '../lib/logger.js';

export const authRouter = Router();

const loginIpLimiter = createRateLimiter({
  windowMs: env.rateLimit.loginWindowMs,
  maxPerKey: env.rateLimit.loginMaxPerIp,
  maxGlobal: env.rateLimit.loginMaxGlobal,
});

const loginEmailLimiter = createRateLimiter({
  windowMs: env.rateLimit.loginWindowMs,
  maxPerKey: env.rateLimit.loginMaxPerEmail,
  maxGlobal: env.rateLimit.loginMaxGlobal,
});

const logoutLimiter = createRateLimiter({
  windowMs: env.rateLimit.loginWindowMs,
  maxPerKey: 30,
  maxGlobal: 200,
});

/** Dummy bcrypt so unknown accounts take the same compare path as real ones. */
const DUMMY_PASSWORD_HASH = bcrypt.hashSync('mws-timing-dummy', 12);

function rateLimited(res, retryAfterSeconds) {
  res.set('Retry-After', String(retryAfterSeconds));
  return res.status(429).json({
    ok: false,
    code: 'rate_limited',
    message: 'Too many attempts. Please try again shortly.',
    retryAfterSeconds,
  });
}

authRouter.post('/login', (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = asString(req.body?.password);

  if (!email || !password) {
    return res.status(400).json({
      ok: false,
      code: 'validation_failed',
      message: 'Email and password are required.',
      errors: {
        email: !email ? 'Email is required.' : undefined,
        password: !password ? 'Password is required.' : undefined,
      },
    });
  }

  if (password.length > MAX_PASSWORD_LENGTH) {
    return res.status(400).json({
      ok: false,
      code: 'validation_failed',
      message: 'Email and password are required.',
    });
  }

  const ipKey = req.ip ?? 'unknown';
  const ipLimit = loginIpLimiter.check(ipKey);
  if (!ipLimit.allowed) {
    return rateLimited(res, ipLimit.retryAfterSeconds);
  }

  const emailLimit = loginEmailLimiter.check(email);
  if (!emailLimit.allowed) {
    loginIpLimiter.refund(ipKey);
    return rateLimited(res, emailLimit.retryAfterSeconds);
  }

  const db = getDb();
  const admin = isValidEmail(email)
    ? db
        .prepare(
          'SELECT id, email, name, role, active, password_hash FROM admin_users WHERE lower(email) = ?',
        )
        .get(email)
    : null;

  const passwordOk = bcrypt.compareSync(password, admin?.password_hash || DUMMY_PASSWORD_HASH) && Boolean(admin);
  const activeOk = Boolean(admin?.active);
  const roleOk = Boolean(admin) && ADMIN_ROLES.includes(admin.role);

  if (!passwordOk || !activeOk || !roleOk) {
    logger.warn('auth.login_failed', {
      reason: !admin
        ? 'unknown_account'
        : !passwordOk
          ? 'credentials'
          : !activeOk
            ? 'inactive'
            : 'invalid_role',
    });
    return res.status(401).json({
      ok: false,
      code: 'invalid_credentials',
      message: 'Invalid email or password.',
    });
  }

  loginIpLimiter.refund(ipKey);
  loginEmailLimiter.refund(email);

  const identity = formatAdmin(admin);
  if (!isKnownAdminRole(identity)) {
    return res.status(401).json({
      ok: false,
      code: 'invalid_credentials',
      message: 'Invalid email or password.',
    });
  }
  const token = signToken({ id: identity.id, email: identity.email });

  return res.json({
    ok: true,
    token,
    admin: identity,
  });
});

authRouter.get('/me', requireAuth, (req, res) => {
  return res.json({
    ok: true,
    admin: req.admin,
  });
});

authRouter.post('/logout', (req, res) => {
  const ipKey = req.ip ?? 'unknown';
  const limit = logoutLimiter.check(ipKey);
  if (!limit.allowed) {
    return rateLimited(res, limit.retryAfterSeconds);
  }

  const token = readBearerToken(req);
  if (token) {
    try {
      const payload = verifyAccessToken(token, { ignoreExpiration: true });
      if (typeof payload.jti === 'string') revokeSession(payload.jti);
    } catch {
      // Token was already unusable. Still acknowledge logout.
    }
  }
  res.setHeader('Set-Cookie', serializeExpiredGateCookie());
  return res.json({ ok: true });
});

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { getDb } from '../db/index.js';
import { formatAdmin, requireAuth, signToken } from '../middleware/auth.js';
import { createRateLimiter } from '../lib/rateLimit.js';
import { asString, normalizeEmail } from '../lib/validators.js';
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

function rateLimited(res, retryAfterSeconds) {
  res.set('Retry-After', String(retryAfterSeconds));
  return res.status(429).json({
    ok: false,
    code: 'rate_limited',
    message: 'Too many sign-in attempts. Please try again shortly.',
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
  const admin = db
    .prepare(
      'SELECT id, email, name, role, active, password_hash FROM admin_users WHERE lower(email) = ?',
    )
    .get(email);

  const passwordOk = Boolean(admin) && bcrypt.compareSync(password, admin.password_hash);
  const activeOk = Boolean(admin?.active);

  if (!passwordOk || !activeOk) {
    logger.warn('auth.login_failed', {
      reason: !admin ? 'unknown_account' : !passwordOk ? 'credentials' : 'inactive',
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

authRouter.post('/logout', (_req, res) => {
  return res.json({ ok: true });
});

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../db/index.js';
import { requireAuth, signToken } from '../middleware/auth.js';
import { asString } from '../lib/validators.js';

export const authRouter = Router();

authRouter.post('/login', (req, res) => {
  const email = asString(req.body?.email).toLowerCase();
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

  const db = getDb();
  const admin = db
    .prepare('SELECT id, email, password_hash FROM admin_users WHERE email = ?')
    .get(email);

  if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
    return res.status(401).json({
      ok: false,
      code: 'invalid_credentials',
      message: 'Invalid email or password.',
    });
  }

  const token = signToken({ id: admin.id, email: admin.email });

  return res.json({
    ok: true,
    token,
    admin: { id: admin.id, email: admin.email },
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

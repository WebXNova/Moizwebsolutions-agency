import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      ok: false,
      code: 'unauthorized',
      message: 'Authentication required.',
    });
  }

  try {
    const payload = jwt.verify(token, env.jwt.secret);
    req.admin = { id: payload.sub, email: payload.email };
    return next();
  } catch {
    return res.status(401).json({
      ok: false,
      code: 'unauthorized',
      message: 'Invalid or expired session.',
    });
  }
}

/**
 * @param {{ id: string; email: string }} admin
 */
export function signToken(admin) {
  return jwt.sign({ email: admin.email }, env.jwt.secret, {
    subject: admin.id,
    expiresIn: env.jwt.expiresIn,
  });
}

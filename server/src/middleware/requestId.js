import { randomUUID } from 'node:crypto';

/**
 * Attach a correlation id to each request. Honors a well-formed incoming
 * X-Request-Id; otherwise generates a UUID. Safe to echo to clients.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function requestId(req, res, next) {
  const incoming = req.headers['x-request-id'];
  const candidate = typeof incoming === 'string' ? incoming.trim() : '';
  const id = /^[A-Za-z0-9._-]{8,64}$/.test(candidate) ? candidate : randomUUID();
  req.requestId = id;
  res.setHeader('X-Request-Id', id);
  next();
}

import { randomUUID } from 'node:crypto';
import { getDb } from '../db/index.js';

/**
 * @param {{
 *   admin?: { id?: string; email?: string };
 *   action: string;
 *   resourceType?: string;
 *   resourceId?: string;
 *   details?: string;
 *   ip?: string;
 *   success?: boolean;
 * }} entry
 */
export function logActivity(entry) {
  const db = getDb();
  db.prepare(`
    INSERT INTO activity_logs (
      id, admin_id, admin_email, action, resource_type, resource_id, details, ip, success
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    randomUUID(),
    entry.admin?.id ?? null,
    entry.admin?.email ?? '',
    entry.action,
    entry.resourceType ?? '',
    entry.resourceId ?? null,
    entry.details ?? '',
    entry.ip ?? '',
    entry.success === false ? 0 : 1,
  );
}

/**
 * @param {import('express').Request} req
 */
export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress ?? '';
}

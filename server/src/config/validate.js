import fs from 'node:fs';
import path from 'node:path';
import { env, collectAuthConfigProblems, evaluateMysqlGuard } from './env.js';
import { durationToMs } from '../lib/duration.js';

/**
 * Browser Origin values: scheme + host + optional port, no path or slash.
 *
 * @param {string} value
 */
export function isValidOrigin(value) {
  if (typeof value !== 'string' || !value) return false;
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    if (url.username || url.password) return false;
    if (url.search || url.hash) return false;
    if (url.pathname !== '/' && url.pathname !== '') return false;
    return value === url.origin;
  } catch {
    return false;
  }
}

/**
 * True when `candidate` is the same as or nested under `root`.
 *
 * @param {string} candidate
 * @param {string} root
 */
export function isPathInside(candidate, root) {
  const resolvedCandidate = path.resolve(candidate);
  const resolvedRoot = path.resolve(root);
  const relative = path.relative(resolvedRoot, resolvedCandidate);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

/**
 * Live SQLite must not sit in a public or disposable directory.
 *
 * @param {string} dbPath
 * @param {{ uploadsDir: string; backupDir: string }} roots
 */
export function isUnsafeDbLocation(dbPath, roots = { uploadsDir: env.uploads.dir, backupDir: env.backup.dir }) {
  const resolved = path.resolve(dbPath);
  if (isPathInside(resolved, roots.uploadsDir)) return 'DB_PATH is inside the uploads directory';
  if (isPathInside(resolved, roots.backupDir)) return 'DB_PATH is inside BACKUP_DIR';
  const lower = resolved.replace(/\\/g, '/').toLowerCase();
  if (lower.includes('/client/dist/') || lower.endsWith('/client/dist')) {
    return 'DB_PATH is inside the frontend build output';
  }
  return null;
}

/**
 * Production/startup problems. Names only — never secret values.
 *
 * @returns {string[]}
 */
export function collectStartupProblems() {
  const problems = [
    ...collectAuthConfigProblems(),
    ...evaluateMysqlGuard({ isProduction: env.isProduction, dbHost: env.db.host }),
  ];

  if (env.port < 1 || env.port > 65535) problems.push('PORT is not a valid TCP port');
  if (env.trustProxy < 0 || env.trustProxy > 32) problems.push('TRUST_PROXY must be an integer from 0 to 32');

  if (env.listenHost) {
    const host = env.listenHost;
    const ok =
      host === 'localhost' ||
      host === '::' ||
      host === '::1' ||
      /^\d{1,3}(?:\.\d{1,3}){3}$/.test(host) ||
      /^[a-z0-9.-]+$/i.test(host);
    if (!ok) problems.push('LISTEN_HOST is not a valid address');
  }

  if (!env.uploads.publicPath.startsWith('/')) {
    problems.push('UPLOADS_PUBLIC_PATH must start with /');
  }

  if (env.jwt.expiresIn && durationToMs(env.jwt.expiresIn) == null) {
    problems.push('JWT_EXPIRES_IN must be a duration such as 12h, 15m, or 3600');
  }

  for (const origin of env.allowedOrigins) {
    if (!isValidOrigin(origin)) {
      problems.push('ALLOWED_ORIGINS contains an invalid origin (use scheme://host[:port], no trailing slash)');
      break;
    }
  }

  if (env.isProduction) {
    if (env.allowedOrigins.length === 0) {
      problems.push('ALLOWED_ORIGINS is required in production');
    }
    const insecure = env.allowedOrigins.filter(
      (origin) => origin.startsWith('http://') && !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin),
    );
    if (insecure.length > 0) {
      problems.push('ALLOWED_ORIGINS in production must use https except for localhost');
    }
  }

  const dbLocation = isUnsafeDbLocation(env.db.path);
  if (dbLocation) problems.push(dbLocation);

  if (isPathInside(env.backup.dir, env.uploads.dir)) {
    problems.push('BACKUP_DIR cannot be inside the uploads directory');
  }

  if (env.backup.offsiteDir) {
    if (isPathInside(env.backup.offsiteDir, env.uploads.dir)) {
      problems.push('BACKUP_OFFSITE_DIR cannot be inside the uploads directory');
    }
    if (isPathInside(env.backup.offsiteDir, path.dirname(env.db.path))) {
      problems.push('BACKUP_OFFSITE_DIR cannot sit next to the live database');
    }
    if (env.isProduction && env.backup.passphrase.length < 16) {
      problems.push('BACKUP_PASSPHRASE (16+) is required when BACKUP_OFFSITE_DIR is set in production');
    }
  }

  return problems;
}

export function ensureRuntimeDirectories() {
  fs.mkdirSync(path.dirname(env.db.path), { recursive: true });
  fs.mkdirSync(env.uploads.dir, { recursive: true });
  fs.mkdirSync(path.join(env.uploads.dir, 'media'), { recursive: true });
  fs.mkdirSync(env.backup.dir, { recursive: true });
}

import fs from 'node:fs';
import path from 'node:path';
import { env } from '../config/env.js';
import { logger } from './logger.js';

const MANAGED_FILENAME = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.[a-z0-9]+$/i;

/**
 * Public URL prefix with no trailing slash, e.g. `/uploads/projects`.
 */
function publicPrefix() {
  return env.uploads.publicPath.replace(/\/+$/, '');
}

/**
 * True when the stored URL belongs to this app's upload directory.
 * Static `/assets/...` paths and external URLs are never managed.
 *
 * @param {unknown} url
 */
export function isManagedUploadUrl(url) {
  if (typeof url !== 'string' || !url) return false;
  const trimmed = url.trim();
  if (trimmed.includes('..') || trimmed.includes('\\')) return false;
  const prefix = publicPrefix();
  return trimmed === prefix || trimmed.startsWith(`${prefix}/`);
}

/**
 * Resolve a stored public URL to an absolute filesystem path inside the
 * configured upload directory. Returns null for anything outside that boundary.
 *
 * @param {unknown} url
 * @returns {string | null}
 */
export function resolveManagedUploadPath(url) {
  if (!isManagedUploadUrl(url)) return null;

  const prefix = publicPrefix();
  const trimmed = String(url).trim();
  const relative = trimmed.slice(prefix.length).replace(/^\/+/, '');
  if (!relative) return null;

  const segments = relative.split('/').filter(Boolean);
  if (segments.length === 0 || segments.length > 2) return null;
  if (segments.some((segment) => segment === '.' || segment === '..')) return null;
  if (segments.length === 2 && segments[0] !== 'media') return null;

  const filename = segments[segments.length - 1];
  if (!MANAGED_FILENAME.test(filename)) return null;

  const uploadRoot = path.resolve(env.uploads.dir);
  const candidate = path.resolve(uploadRoot, ...segments);
  const relativeToRoot = path.relative(uploadRoot, candidate);
  if (!relativeToRoot || relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) {
    return null;
  }

  return candidate;
}

/**
 * Delete a managed upload. Missing files are treated as already cleaned up.
 * Paths outside the upload directory are ignored.
 *
 * @param {unknown} url
 * @returns {{ attempted: boolean; deleted: boolean; missing?: boolean }}
 */
export function deleteManagedUpload(url) {
  const filePath = resolveManagedUploadPath(url);
  if (!filePath) return { attempted: false, deleted: false };

  try {
    if (!fs.existsSync(filePath)) {
      return { attempted: true, deleted: false, missing: true };
    }
    fs.unlinkSync(filePath);
    return { attempted: true, deleted: true };
  } catch (error) {
    logger.warn('uploads.delete_failed', {
      message: error instanceof Error ? error.message : 'unlink failed',
    });
    return { attempted: true, deleted: false };
  }
}

/**
 * Delete a managed file only when no other project still references the URL.
 *
 * @param {import('better-sqlite3').Database} db
 * @param {unknown} url
 * @param {string} [exceptProjectId]
 */
export function deleteUnreferencedProjectImage(db, url, exceptProjectId = '') {
  if (!isManagedUploadUrl(url)) return;
  const count = db
    .prepare(
      exceptProjectId
        ? 'SELECT COUNT(*) AS count FROM projects WHERE image_url = ? AND id != ?'
        : 'SELECT COUNT(*) AS count FROM projects WHERE image_url = ?',
    )
    .get(...(exceptProjectId ? [url, exceptProjectId] : [url])).count;
  if (count > 0) return;
  deleteManagedUpload(url);
}

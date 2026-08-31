import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { env } from '../config/env.js';
import { getDb } from './index.js';
import { logger } from '../lib/logger.js';

function backupRoot() {
  return path.resolve(env.backup.dir);
}

function assertBackupDestination(resolvedDest) {
  const uploadRoot = path.resolve(env.uploads.dir);
  const root = backupRoot();
  if (root === uploadRoot || root.startsWith(`${uploadRoot}${path.sep}`)) {
    throw new Error('BACKUP_DIR cannot be inside the public uploads directory.');
  }

  const relative = path.relative(root, resolvedDest);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('Backup destination must stay inside BACKUP_DIR.');
  }
}

/**
 * Confirm a SQLite file opens and has tables. Never logs the full path.
 *
 * @param {string} filePath
 */
export function verifyBackupFile(filePath) {
  const probe = new Database(filePath, { readonly: true, fileMustExist: true });
  try {
    probe.prepare('SELECT 1 AS ok').get();
    const tables = probe
      .prepare("SELECT COUNT(*) AS count FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
      .get().count;
    if (tables < 1) throw new Error('Backup file has no application tables.');
    const bytes = fs.statSync(filePath).size;
    if (bytes < 1) throw new Error('Backup file is empty.');
  } finally {
    probe.close();
  }
}

/**
 * SQLite-safe snapshot via better-sqlite3 backup(), not a live file copy.
 *
 * @param {string} [destPath]
 * @returns {Promise<string>}
 */
export async function backupDatabase(destPath) {
  const dir = env.backup.dir;
  fs.mkdirSync(dir, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const destination = destPath || path.join(dir, `portfolio-${stamp}.db`);
  const resolvedDest = path.resolve(destination);
  assertBackupDestination(resolvedDest);

  const db = getDb();
  await db.backup(resolvedDest);
  verifyBackupFile(resolvedDest);
  logger.info('db.backup_written', { file: path.basename(resolvedDest), bytes: fs.statSync(resolvedDest).size });
  return resolvedDest;
}

function copyUploads(destDir) {
  const source = path.resolve(env.uploads.dir);
  if (!fs.existsSync(source)) {
    return { copied: false, files: 0 };
  }
  fs.cpSync(source, destDir, { recursive: true });
  let files = 0;
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) walk(path.join(dir, entry.name));
      else files += 1;
    }
  };
  walk(destDir);
  return { copied: true, files };
}

/**
 * Consistent recovery unit: SQLite snapshot + upload copy in one folder.
 * Not perfectly atomic across filesystem + SQLite.
 *
 * @returns {Promise<{ dir: string; dbFile: string; mediaFiles: number }>}
 */
export async function createSnapshot() {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dir = path.join(backupRoot(), `snapshot-${stamp}`);
  assertBackupDestination(dir);
  fs.mkdirSync(dir, { recursive: true });

  const dbFile = path.join(dir, 'portfolio.db');
  await backupDatabase(dbFile);

  const mediaDir = path.join(dir, 'media');
  const media = copyUploads(mediaDir);

  const manifest = {
    createdAt: new Date().toISOString(),
    dbFile: 'portfolio.db',
    mediaCopied: media.copied,
    mediaFiles: media.files,
    note: 'SQLite backup is consistent. Media is a filesystem copy from approximately the same moment, not a two-phase commit.',
  };
  fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  logger.info('backup.snapshot_complete', {
    snapshot: path.basename(dir),
    mediaFiles: media.files,
  });
  return { dir, dbFile, mediaFiles: media.files };
}

function snapshotMtime(fullPath) {
  try {
    return fs.statSync(fullPath).mtimeMs;
  } catch {
    return 0;
  }
}

/**
 * Keep the newest `keep` snapshot directories and leftover loose .db files.
 *
 * @param {number} [keep]
 */
export function pruneBackups(keep = env.backup.keep) {
  const dir = env.backup.dir;
  if (!fs.existsSync(dir) || keep < 1) return;

  const snapshots = fs
    .readdirSync(dir)
    .filter((name) => name.startsWith('snapshot-'))
    .map((name) => ({ name, full: path.join(dir, name), mtime: snapshotMtime(path.join(dir, name)) }))
    .sort((a, b) => b.mtime - a.mtime);

  for (const item of snapshots.slice(keep)) {
    try {
      fs.rmSync(item.full, { recursive: true, force: true });
      logger.info('backup.snapshot_pruned', { name: item.name });
    } catch (error) {
      logger.warn('backup.prune_failed', {
        name: item.name,
        message: error instanceof Error ? error.message : 'remove failed',
      });
    }
  }

  const loose = fs
    .readdirSync(dir)
    .filter((name) => name.endsWith('.db'))
    .map((name) => {
      const full = path.join(dir, name);
      return { name, full, mtime: snapshotMtime(full) };
    })
    .sort((a, b) => b.mtime - a.mtime);

  for (const file of loose.slice(keep)) {
    try {
      fs.unlinkSync(file.full);
      logger.info('db.backup_pruned', { name: file.name });
    } catch (error) {
      logger.warn('db.backup_prune_failed', {
        name: file.name,
        message: error instanceof Error ? error.message : 'unlink failed',
      });
    }
  }
}

const EXPECTED_TABLES = [
  'categories',
  'projects',
  'admin_users',
  'site_settings',
  'services',
  'inquiries',
  'media',
  'activity_logs',
];

/**
 * Operator-facing integrity check. Does not print filesystem paths.
 *
 * @param {import('better-sqlite3').Database} [db]
 */
export function inspectSchema(db = getDb()) {
  const tables = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    .all()
    .map((row) => row.name);
  const missingTables = EXPECTED_TABLES.filter((name) => !tables.includes(name));
  const foreignKeys = db.pragma('foreign_keys', { simple: true });
  const journalMode = db.pragma('journal_mode', { simple: true });
  return {
    ok: missingTables.length === 0 && Number(foreignKeys) === 1,
    tableCount: tables.length,
    missingTables,
    foreignKeys: Number(foreignKeys) === 1 ? 'on' : 'off',
    journalMode,
  };
}

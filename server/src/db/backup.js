import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import Database from 'better-sqlite3';
import { env } from '../config/env.js';
import { getDb } from './index.js';
import { logger } from '../lib/logger.js';
import { decryptFile, encryptFile, isEncryptedBackup } from '../lib/backupCrypto.js';

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
  if (filePath.endsWith('.sql')) {
    const bytes = fs.statSync(filePath).size;
    if (bytes < 1) throw new Error('Backup file is empty.');
    const sample = fs.readFileSync(filePath, 'utf8').slice(0, 200);
    if (!/CREATE TABLE|INSERT INTO/i.test(sample)) {
      throw new Error('Backup file has no application tables.');
    }
    return;
  }

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

function escapeSqlString(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value === 'bigint') return String(value);
  return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "''")}'`;
}

function backupMysql(destPath) {
  const db = getDb();
  const tables = db
    .prepare(
      "SELECT TABLE_NAME AS name FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME",
    )
    .all();

  const chunks = [`-- Moiz Web Solutions MySQL dump\n-- ${new Date().toISOString()}\nSET FOREIGN_KEY_CHECKS=0;\n`];
  for (const { name } of tables) {
    const createRows = db.prepare(`SHOW CREATE TABLE \`${name}\``).all();
    const createSql = createRows[0]?.['Create Table'] || createRows[0]?.['Create View'];
    if (createSql) {
      chunks.push(`DROP TABLE IF EXISTS \`${name}\`;\n${createSql};\n`);
    }
    const rows = db.prepare(`SELECT * FROM \`${name}\``).all();
    for (const row of rows) {
      const columns = Object.keys(row).map((column) => `\`${column}\``).join(', ');
      const values = Object.values(row).map(escapeSqlString).join(', ');
      chunks.push(`INSERT INTO \`${name}\` (${columns}) VALUES (${values});\n`);
    }
  }
  chunks.push('SET FOREIGN_KEY_CHECKS=1;\n');
  fs.writeFileSync(destPath, chunks.join('\n'), 'utf8');
}

/**
 * Snapshot via SQLite backup() or a MySQL SQL dump.
 *
 * @param {string} [destPath]
 * @returns {Promise<string>}
 */
export async function backupDatabase(destPath) {
  const dir = env.backup.dir;
  fs.mkdirSync(dir, { recursive: true });

  const db = getDb();
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const ext = db.dialect === 'mysql' ? 'sql' : 'db';
  const destination = destPath || path.join(dir, `portfolio-${stamp}.${ext}`);
  const resolvedDest = path.resolve(destination);
  assertBackupDestination(resolvedDest);

  if (db.dialect === 'mysql') {
    backupMysql(resolvedDest);
  } else {
    await db.backup(resolvedDest);
  }
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

  const dbFile = path.join(dir, getDb().dialect === 'mysql' ? 'portfolio.sql' : 'portfolio.db');
  await backupDatabase(dbFile);

  const mediaDir = path.join(dir, 'media');
  const media = copyUploads(mediaDir);

  const manifest = {
    createdAt: new Date().toISOString(),
    dbFile: path.basename(dbFile),
    mediaCopied: media.copied,
    mediaFiles: media.files,
    note: getDb().dialect === 'mysql'
      ? 'MySQL dump is a point-in-time SQL export. Media is a filesystem copy from approximately the same moment.'
      : 'SQLite backup is consistent. Media is a filesystem copy from approximately the same moment, not a two-phase commit.',
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
 * Keep the newest `keep` snapshot directories, archives, and leftover .db files.
 * The newest snapshot is never deleted, even when older copies are pruned.
 *
 * @param {number} [keep]
 */
export function pruneBackups(keep = env.backup.keep) {
  const dir = env.backup.dir;
  if (!fs.existsSync(dir) || keep < 1) return;

  const snapshots = fs
    .readdirSync(dir)
    .filter((name) => name.startsWith('snapshot-') && fs.statSync(path.join(dir, name)).isDirectory())
    .map((name) => ({ name, full: path.join(dir, name), mtime: snapshotMtime(path.join(dir, name)) }))
    .sort((a, b) => b.mtime - a.mtime);

  if (snapshots.length <= 1) {
    // Never remove the only remaining snapshot.
  } else {
    const removable = snapshots.slice(Math.max(keep, 1));
    for (const item of removable) {
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
  }

  const archives = fs
    .readdirSync(dir)
    .filter((name) => name.startsWith('snapshot-') && (name.endsWith('.tar.gz') || name.endsWith('.tar.gz.enc')))
    .map((name) => ({ name, full: path.join(dir, name), mtime: snapshotMtime(path.join(dir, name)) }))
    .sort((a, b) => b.mtime - a.mtime);

  for (const item of archives.slice(Math.max(keep, 1))) {
    try {
      fs.unlinkSync(item.full);
      logger.info('backup.archive_pruned', { name: item.name });
    } catch (error) {
      logger.warn('backup.archive_prune_failed', {
        name: item.name,
        message: error instanceof Error ? error.message : 'unlink failed',
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

  for (const file of loose.slice(Math.max(keep, 1))) {
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
  const tables =
    db.dialect === 'mysql'
      ? db
          .prepare(
            'SELECT TABLE_NAME AS name FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE()',
          )
          .all()
          .map((row) => row.name)
      : db
          .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
          .all()
          .map((row) => row.name);
  const missingTables = EXPECTED_TABLES.filter((name) => !tables.includes(name));
  const foreignKeys = db.dialect === 'mysql' ? 1 : db.pragma('foreign_keys', { simple: true });
  const journalMode = db.dialect === 'mysql' ? 'innodb' : db.pragma('journal_mode', { simple: true });
  let integrity = 'skipped';
  if (db.dialect !== 'mysql') {
    const rows = db.pragma('integrity_check');
    integrity = rows?.[0]?.integrity_check || String(rows?.[0] ?? '');
  }
  return {
    ok: missingTables.length === 0 && Number(foreignKeys) === 1 && (integrity === 'ok' || integrity === 'skipped'),
    tableCount: tables.length,
    missingTables,
    foreignKeys: Number(foreignKeys) === 1 ? 'on' : 'off',
    journalMode,
    integrity,
  };
}

function runTar(args) {
  const result = spawnSync('tar', args, { windowsHide: true, encoding: 'utf8' });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error('Archive command failed.');
  }
}

/**
 * Compress a snapshot directory to snapshot-<stamp>.tar.gz next to it.
 *
 * @param {string} snapshotDir
 */
export function archiveSnapshot(snapshotDir) {
  const resolved = path.resolve(snapshotDir);
  assertBackupDestination(resolved);
  const parent = path.dirname(resolved);
  const base = path.basename(resolved);
  const archivePath = path.join(parent, `${base}.tar.gz`);
  runTar(['-czf', archivePath, '-C', parent, base]);
  logger.info('backup.archived', { file: path.basename(archivePath), bytes: fs.statSync(archivePath).size });
  return archivePath;
}

/**
 * @param {string} archivePath
 * @returns {string} path copied off-site, or the local encrypted/plain archive
 */
export function protectAndCopyOffsite(archivePath) {
  const passphrase = env.backup.passphrase;
  let payload = archivePath;
  if (passphrase) {
    const encrypted = `${archivePath}.enc`;
    encryptFile(archivePath, encrypted, passphrase);
    logger.info('backup.encrypted', { file: path.basename(encrypted) });
    payload = encrypted;
  } else {
    logger.warn('backup.unencrypted', {
      detail: 'Set BACKUP_PASSPHRASE (16+) before copying snapshots off the server.',
    });
  }

  const offsite = env.backup.offsiteDir;
  if (!offsite) {
    logger.warn('backup.offsite_skipped', {
      detail: 'Set BACKUP_OFFSITE_DIR to a mounted remote/USB path so snapshots survive disk loss.',
    });
    return payload;
  }

  const destDir = path.resolve(offsite);
  fs.mkdirSync(destDir, { recursive: true });
  const dest = path.join(destDir, path.basename(payload));
  fs.copyFileSync(payload, dest);
  logger.info('backup.offsite_copied', { file: path.basename(dest) });
  return dest;
}

function assertRestoreTarget(targetDir) {
  const resolved = path.resolve(targetDir);
  const liveDb = path.resolve(env.db.path);
  const liveDir = path.dirname(liveDb);
  if (resolved === liveDir || isInside(resolved, liveDir) || resolved === liveDb) {
    throw new Error('Refusing to restore onto the live database path. Choose a temporary directory.');
  }
  if (isInside(resolved, path.resolve(env.uploads.dir))) {
    throw new Error('Refusing to restore into the public uploads directory.');
  }
}

function isInside(candidate, root) {
  const relative = path.relative(path.resolve(root), path.resolve(candidate));
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function findRestoredDb(root) {
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop();
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.name === 'portfolio.db' || entry.name.endsWith('.db')) return full;
    }
  }
  return null;
}

/**
 * Restore a snapshot directory, .tar.gz, or .tar.gz.enc into an empty temp folder.
 * Never overwrites the live DB_PATH.
 *
 * @param {{ source: string; target: string; passphrase?: string }} input
 */
export function restoreSnapshot({ source, target, passphrase = env.backup.passphrase }) {
  assertRestoreTarget(target);
  const sourcePath = path.resolve(source);
  const targetDir = path.resolve(target);
  fs.mkdirSync(targetDir, { recursive: true });
  if (fs.readdirSync(targetDir).length > 0) {
    throw new Error('Restore target must be an empty directory.');
  }

  let archive = sourcePath;
  if (fs.statSync(sourcePath).isDirectory()) {
    const dbFile = findRestoredDb(sourcePath);
    if (!dbFile) throw new Error('Snapshot directory has no database file.');
    const destDb = path.join(targetDir, 'portfolio.db');
    fs.copyFileSync(dbFile, destDb);
    const mediaSrc = path.join(sourcePath, 'media');
    if (fs.existsSync(mediaSrc)) fs.cpSync(mediaSrc, path.join(targetDir, 'media'), { recursive: true });
    return verifyRestoredDatabase(destDb);
  }

  if (isEncryptedBackup(sourcePath)) {
    const decrypted = path.join(targetDir, 'archive.tar.gz');
    decryptFile(sourcePath, decrypted, passphrase);
    archive = decrypted;
  }

  if (archive.endsWith('.tar.gz') || archive.endsWith('.tgz')) {
    runTar(['-xzf', archive, '-C', targetDir]);
  } else {
    throw new Error('Restore source must be a snapshot directory, .tar.gz, or .tar.gz.enc.');
  }

  const dbFile = findRestoredDb(targetDir);
  if (!dbFile) throw new Error('Restored archive has no database file.');
  return verifyRestoredDatabase(dbFile);
}

/**
 * @param {string} dbFile
 */
export function verifyRestoredDatabase(dbFile) {
  verifyBackupFile(dbFile);
  const probe = new Database(dbFile, { readonly: true, fileMustExist: true });
  try {
    const report = inspectSchema(probe);
    const inquiries = probe.prepare('SELECT COUNT(*) AS count FROM inquiries').get().count;
    const projects = probe.prepare('SELECT COUNT(*) AS count FROM projects').get().count;
    const admins = probe.prepare('SELECT COUNT(*) AS count FROM admin_users').get().count;
    if (!report.ok) {
      throw new Error('Restored database failed integrity or schema checks.');
    }
    logger.info('backup.restore_verified', {
      integrity: report.integrity,
      tableCount: report.tableCount,
      inquiries,
      projects,
      admins,
    });
    return { dbFile, report, counts: { inquiries, projects, admins } };
  } finally {
    probe.close();
  }
}

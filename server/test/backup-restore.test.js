import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { env } from '../src/config/env.js';
import { archiveSnapshot, createSnapshot, pruneBackups, restoreSnapshot } from '../src/db/backup.js';
import { encryptFile } from '../src/lib/backupCrypto.js';
import { getDb } from '../src/db/index.js';

const restoreRoot = mkdtempSync(path.join(os.tmpdir(), 'mws-restore-'));
after(() => rmSync(restoreRoot, { recursive: true, force: true }));

test('snapshot backup restores into a temp directory without touching the live db', async () => {
  const db = getDb();
  const before = db.prepare('SELECT COUNT(*) AS count FROM inquiries').get().count;
  db.prepare(
    `INSERT INTO inquiries (
      id, name, email, phone, business, website, social, services_json, project_types_json,
      description, budget_currency, budget_label, timeline, status, email_status, confirmation_sent
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', 'pending', 0)`,
  ).run(
    'MWS-RESTORE-TEST',
    'Restore Probe',
    'restore@example.com',
    '',
    '',
    '',
    '',
    '[]',
    '[]',
    'Restore verification brief.',
    'USD',
    '',
    '',
  );

  const snapshot = await createSnapshot();
  assert.ok(existsSync(snapshot.dbFile));
  const archive = archiveSnapshot(snapshot.dir);
  assert.ok(existsSync(archive));

  assert.throws(() => restoreSnapshot({ source: snapshot.dir, target: path.dirname(env.db.path) }));

  const target = path.join(restoreRoot, 'from-dir');
  mkdirSync(target);
  const restored = restoreSnapshot({ source: snapshot.dir, target });
  assert.equal(restored.report.integrity, 'ok');
  assert.ok(restored.counts.inquiries >= before + 1);
  assert.notEqual(path.resolve(restored.dbFile), path.resolve(env.db.path));
  assert.equal(existsSync(env.db.path), true);

  const archiveTarget = path.join(restoreRoot, 'from-archive');
  mkdirSync(archiveTarget);
  const fromArchive = restoreSnapshot({ source: archive, target: archiveTarget });
  assert.equal(fromArchive.report.integrity, 'ok');
});

test('encrypted archive restores with the passphrase', async () => {
  const snapshot = await createSnapshot();
  const archive = archiveSnapshot(snapshot.dir);
  const passphrase = 'restore-test-passphrase';
  const encrypted = `${archive}.enc`;
  encryptFile(archive, encrypted, passphrase);
  const target = path.join(restoreRoot, 'from-enc');
  mkdirSync(target);
  const restored = restoreSnapshot({ source: encrypted, target, passphrase });
  assert.equal(restored.report.integrity, 'ok');
  assert.ok(restored.counts.admins >= 1);
});

test('prune never deletes the newest snapshot', async () => {
  await createSnapshot();
  await createSnapshot();
  const dirs = () =>
    readdirSync(env.backup.dir)
      .filter((name) => name.startsWith('snapshot-') && statSync(path.join(env.backup.dir, name)).isDirectory())
      .map((name) => ({ name, mtime: statSync(path.join(env.backup.dir, name)).mtimeMs }))
      .sort((a, b) => b.mtime - a.mtime);
  const newest = dirs()[0];
  assert.ok(newest);
  pruneBackups(1);
  const remaining = dirs();
  assert.ok(remaining.length >= 1);
  assert.equal(remaining[0].name, newest.name);
});

test('encrypted backup files are not plaintext sqlite', async () => {
  const snapshot = await createSnapshot();
  const archive = archiveSnapshot(snapshot.dir);
  const encrypted = `${archive}.enc`;
  encryptFile(archive, encrypted, 'restore-test-passphrase');
  const head = readFileSync(encrypted).subarray(0, 16).toString('utf8');
  assert.equal(head.startsWith('SQLite format 3'), false);
  assert.ok(head.startsWith('MWSB1'));
});

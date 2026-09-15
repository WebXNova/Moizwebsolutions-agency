import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { env } from '../src/config/env.js';
import { backupDatabase, inspectSchema } from '../src/db/backup.js';
import { getDb } from '../src/db/index.js';
import { api, startServer, stopServer } from './helpers.mjs';

const { server, base } = await startServer();
after(() => stopServer(server));

test('health reports db and email without leaking SMTP details', async () => {
  const result = await api(base, '/api/health');
  assert.equal(result.status, 200);
  assert.equal(result.payload.ok, true);
  assert.equal(result.payload.db, 'ok');
  assert.equal(result.payload.uploads, 'ok');
  assert.equal(result.payload.email, 'unconfigured');
  assert.equal(result.payload.mailHost, undefined);
  assert.equal(result.payload.mailLastError, undefined);
  assert.equal(result.payload.mailPort, undefined);
});

test('liveness does not depend on database internals', async () => {
  const result = await api(base, '/api/health/live');
  assert.equal(result.status, 200);
  assert.equal(result.payload.ok, true);
});

test('responses include security headers and a request id', async () => {
  const response = await fetch(`${base}/api/health/live`);
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('x-frame-options'), 'DENY');
  assert.equal(response.headers.get('content-security-policy'), "frame-ancestors 'none'");
  assert.ok(response.headers.get('x-request-id'));
});

test('schema initializes inquiries and unique project slugs', () => {
  const db = getDb();
  const table = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='inquiries'").get();
  assert.ok(table);
  const indexes = db
    .prepare("SELECT name FROM sqlite_master WHERE type='index' AND name='idx_inquiries_status'")
    .get();
  assert.ok(indexes);
  const report = inspectSchema(db);
  assert.equal(report.ok, true);
  assert.equal(report.foreignKeys, 'on');
});

test('SQLite backup writes a file outside uploads', async () => {
  const dest = await backupDatabase();
  assert.ok(existsSync(dest));
  assert.equal(dest.includes('uploads'), false);
  assert.ok(dest.startsWith(env.backup.dir));
});

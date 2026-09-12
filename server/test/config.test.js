import { test } from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { isPathInside, isUnsafeDbLocation, isValidOrigin } from '../src/config/validate.js';

test('isValidOrigin accepts scheme://host[:port] only', () => {
  assert.equal(isValidOrigin('http://localhost:5173'), true);
  assert.equal(isValidOrigin('https://www.example.com'), true);
  assert.equal(isValidOrigin('http://localhost:5173/'), false);
  assert.equal(isValidOrigin('https://example.com/path'), false);
  assert.equal(isValidOrigin('*'), false);
  assert.equal(isValidOrigin(''), false);
});

test('database path cannot sit in uploads or backups', () => {
  const tmp = path.join(os.tmpdir(), 'mws-validate');
  const uploads = path.join(tmp, 'uploads');
  const backups = path.join(tmp, 'backups');
  assert.ok(isUnsafeDbLocation(path.join(uploads, 'portfolio.db'), { uploadsDir: uploads, backupDir: backups }));
  assert.ok(isUnsafeDbLocation(path.join(backups, 'live.db'), { uploadsDir: uploads, backupDir: backups }));
  assert.equal(isUnsafeDbLocation(path.join(tmp, 'data', 'portfolio.db'), { uploadsDir: uploads, backupDir: backups }), null);
});

test('isPathInside detects nested directories', () => {
  const root = path.join(os.tmpdir(), 'mws-root');
  assert.equal(isPathInside(path.join(root, 'a'), root), true);
  assert.equal(isPathInside(root, path.join(root, 'a')), false);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { getDb } from '../src/db/index.js';

const root = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const nginxPath = path.join(root, 'deploy/nginx/moizwebsolutions.conf');
const unitPath = path.join(root, 'deploy/systemd/mws-api.service');
const backupUnitPath = path.join(root, 'deploy/systemd/mws-backup.service');
const backupTimerPath = path.join(root, 'deploy/systemd/mws-backup.timer');
const gitignorePath = path.join(root, '.gitignore');

const nginx = readFileSync(nginxPath, 'utf8');
const unit = readFileSync(unitPath, 'utf8');
const backupUnit = readFileSync(backupUnitPath, 'utf8');
const backupTimer = readFileSync(backupTimerPath, 'utf8');
const gitignore = readFileSync(gitignorePath, 'utf8');

test('nginx template proxies to loopback Node and blocks sensitive files', () => {
  assert.match(nginx, /listen 443 ssl/);
  assert.match(nginx, /return 301 https:\/\/\$host\$request_uri/);
  assert.match(nginx, /proxy_pass http:\/\/127\.0\.0\.1:8787/);
  assert.match(nginx, /proxy_set_header X-Forwarded-For/);
  assert.match(nginx, /proxy_set_header X-Forwarded-Proto \$scheme/);
  assert.match(nginx, /X-Frame-Options "DENY"/);
  assert.match(nginx, /frame-ancestors 'none'/);
  assert.match(nginx, /Strict-Transport-Security/);
  assert.match(nginx, /X-Content-Type-Options nosniff/);
  assert.match(nginx, /location \^~ \/backups\//);
  assert.match(nginx, /location \^~ \/server\//);
  assert.match(nginx, /location \^~ \/data\//);
  assert.match(nginx, /location \^~ \/\.git\//);
  assert.match(nginx, /env\|db\|sqlite\|sql\|log\|wal\|shm/);
  assert.match(nginx, /location \^~ \/admin/);
  assert.match(nginx, /client_max_body_size 6m/);
  assert.match(nginx, /ssl_protocols TLSv1\.2 TLSv1\.3/);
  assert.match(nginx, /\.well-known\/acme-challenge/);
  assert.doesNotMatch(nginx, /ADMIN_SECRET_PATH\s*=/);
  assert.equal(/proxy_pass http:\/\/0\.0\.0\.0/.test(nginx), false);
});

test('nginx locations that set Cache-Control also repeat clickjacking headers', () => {
  const uploadsStart = nginx.indexOf('location /uploads/');
  const assetsStart = nginx.indexOf('location /assets/');
  const publicStart = nginx.indexOf('location / {', assetsStart);
  const uploads = nginx.slice(uploadsStart, assetsStart);
  const assets = nginx.slice(assetsStart, publicStart);
  for (const block of [uploads, assets]) {
    assert.match(block, /X-Frame-Options "DENY"/);
    assert.match(block, /frame-ancestors 'none'/);
    assert.match(block, /Strict-Transport-Security/);
  }
});

test('systemd API unit is non-root, production NODE_ENV, and enabled at boot', () => {
  assert.match(unit, /^User=mws$/m);
  assert.match(unit, /^Group=mws$/m);
  assert.doesNotMatch(unit, /^User=root$/m);
  assert.match(unit, /NODE_ENV=production \/usr\/bin\/node src\/index\.js/);
  assert.match(unit, /^Restart=on-failure$/m);
  assert.match(unit, /^WantedBy=multi-user\.target$/m);
  assert.match(unit, /^KillSignal=SIGTERM$/m);
  assert.match(unit, /^TimeoutStopSec=15$/m);
  assert.match(unit, /EnvironmentFile=-\/var\/www\/mws\/server\/\.env/);
  assert.match(unit, /^NoNewPrivileges=true$/m);
  assert.match(unit, /^ProtectSystem=full$/m);
  assert.match(unit, /ReadWritePaths=.*\/data.*\/uploads.*\/backups/);
  assert.match(unit, /^UMask=0077$/m);
  assert.match(unit, /^StartLimitBurst=5$/m);
  assert.match(backupUnit, /NODE_ENV=production \/usr\/bin\/node scripts\/backup-db\.mjs/);
  assert.match(backupTimer, /^WantedBy=timers\.target$/m);
});

test('.env is gitignored and the blocking MySQL worker is gone', () => {
  assert.match(gitignore, /^\.env$/m);
  assert.equal(existsSync(path.join(root, 'server/src/db/mysql-worker.js')), false);
});

test('sqlite integrity_check passes on the test database', () => {
  const db = getDb();
  assert.equal(db.pragma('journal_mode', { simple: true }), 'wal');
  assert.equal(Number(db.pragma('foreign_keys', { simple: true })), 1);
  const rows = db.pragma('integrity_check');
  assert.equal(rows[0].integrity_check, 'ok');
});

import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { env, evaluateAdminSecretConfig } from '../src/config/env.js';
import { mapSecretRequestToAdminPath } from '../src/lib/adminSecret.js';
import { secretsEqual } from '../src/lib/secretEqual.js';
import { api, authHeader, http, loginAs, startServer, stopServer } from './helpers.mjs';

const { server, base } = await startServer();
after(() => stopServer(server));

const configured = env.adminSecret.path;
assert.ok(configured, 'test setup must configure ADMIN_SECRET_PATH');

function cookieHeader(setCookie) {
  const value = String(setCookie).split(';')[0];
  return value || '';
}

test('production refuses missing, short, reserved, and obvious admin secrets', () => {
  assert.ok(evaluateAdminSecretConfig({ isProduction: true, secretPath: '' }).length > 0);
  assert.ok(evaluateAdminSecretConfig({ isProduction: true, secretPath: 'admin' }).length > 0);
  assert.ok(evaluateAdminSecretConfig({ isProduction: true, secretPath: 'secret' }).length > 0);
  assert.ok(evaluateAdminSecretConfig({ isProduction: true, secretPath: '123456' }).length > 0);
  assert.ok(evaluateAdminSecretConfig({ isProduction: true, secretPath: 'login' }).length > 0);
  assert.ok(evaluateAdminSecretConfig({ isProduction: true, secretPath: 'admin-login' }).length > 0);
  assert.ok(evaluateAdminSecretConfig({ isProduction: true, secretPath: 'portfolio' }).length > 0);
  assert.ok(evaluateAdminSecretConfig({ isProduction: true, secretPath: 'shortpath' }).length > 0);
  assert.deepEqual(
    evaluateAdminSecretConfig({ isProduction: false, secretPath: '' }),
    [],
  );
  assert.deepEqual(
    evaluateAdminSecretConfig({ isProduction: true, secretPath: 'gatepath9xK2mQ' }),
    [],
  );
});

test('constant-time compare does not treat unequal secrets as equal', () => {
  assert.equal(secretsEqual(configured, configured), true);
  assert.equal(secretsEqual(configured, `${configured}x`), false);
  assert.equal(secretsEqual('', ''), false);
  assert.equal(secretsEqual('abc', 'abd'), false);
});

test('correct secret serves the admin SPA without exposing /admin', async () => {
  const result = await http(base, `/${configured}/login`);
  assert.equal(result.status, 200);
  assert.ok(result.headers.get('content-type')?.includes('text/html'));
  assert.equal(result.headers.get('x-robots-tag'), 'noindex, nofollow, noarchive');
  assert.equal(result.text.includes(configured), false);
  assert.equal(result.location, '');
});

test('secret aliases map onto the existing /admin SPA routes', () => {
  assert.equal(mapSecretRequestToAdminPath(`/${configured}`, configured), '/admin/login');
  assert.equal(mapSecretRequestToAdminPath(`/${configured}/dashboard`, configured), '/admin/dashboard');
  assert.equal(mapSecretRequestToAdminPath(`/${configured}/admin/projects`, configured), '/admin/projects');
  assert.equal(mapSecretRequestToAdminPath(`/${configured}/inquiries`, configured), '/admin/inquiries');
  assert.equal(mapSecretRequestToAdminPath(`/${configured}/../login`, configured), null);
  assert.equal(mapSecretRequestToAdminPath('/login', configured), null);
});

test('wrong, empty, and common paths do not expose the admin portal', async () => {
  const paths = [
    '/login',
    '/admin',
    '/admin/login',
    '/dashboard',
    '/admin/dashboard',
    '/cms',
    '/cms/login',
    '/wrong-secret/login',
    '//login',
    `/${configured.slice(0, -1)}/login`,
  ];
  for (const pathname of paths) {
    const result = await http(base, pathname);
    assert.notEqual(result.status, 302, pathname);
    if (pathname === '/admin' || pathname.startsWith('/admin/')) {
      assert.equal(result.status, 404, pathname);
      assert.ok(result.text.toLowerCase().includes('not found'));
      assert.equal(result.text.toLowerCase().includes('password'), false);
      assert.equal(result.text.includes(configured), false);
    }
  }
});

test('POST to the secret path is denied and does not echo the secret', async () => {
  const result = await http(base, `/${configured}/login`, { method: 'POST' });
  assert.equal(result.status, 404);
  assert.equal(result.text.includes(configured), false);
});

test('query-string secret is ignored', async () => {
  const result = await http(base, `/login?secret=${encodeURIComponent(configured)}`);
  assert.notEqual(result.status, 302);
  const admin = await http(base, `/admin/login?secret=${encodeURIComponent(configured)}`);
  assert.equal(admin.status, 404);
});

test('/admin HTML is never served, even after a valid secret visit', async () => {
  const denied = await http(base, '/admin/login');
  assert.equal(denied.status, 404);

  const entry = await http(base, `/${configured}/dashboard`);
  assert.equal(entry.status, 200);
  assert.ok(entry.headers.get('content-type')?.includes('text/html'));
  assert.equal(entry.text.includes(configured), false);

  const stillDenied = await http(base, '/admin/dashboard', {
    headers: { Cookie: cookieHeader(entry.setCookie) },
  });
  assert.equal(stillDenied.status, 404);

  const apiDenied = await api(base, '/api/admin/dashboard', { headers: { Cookie: entry.setCookie } });
  assert.equal(apiDenied.status, 401);

  const login = await loginAs(base);
  assert.equal(login.status, 200);
  const apiOk = await api(base, '/api/admin/dashboard', { headers: authHeader(login.payload.token) });
  assert.equal(apiOk.status, 200);
});

test('old secret stops working after in-process rotation', async () => {
  const previous = env.adminSecret.path;

  env.adminSecret.path = 'rotated-admin-url9';
  try {
    const stale = await http(base, `/${previous}/login`);
    assert.equal(stale.status, 404);

    const fresh = await http(base, '/rotated-admin-url9/login');
    assert.equal(fresh.status, 200);
    assert.ok(fresh.headers.get('content-type')?.includes('text/html'));

    const legacy = await http(base, '/admin/login');
    assert.equal(legacy.status, 404);
  } finally {
    env.adminSecret.path = previous;
  }
});

test('health and public JSON do not include the admin secret', async () => {
  const health = await api(base, '/api/health');
  const live = await api(base, '/api/health/live');
  const blob = JSON.stringify({ health: health.payload, live: live.payload });
  assert.equal(blob.includes(configured), false);
  assert.equal(health.payload.adminSecretPath, undefined);
  assert.equal(health.payload.adminSecret, undefined);
});

test('login still rate-limits repeated failures for one email', async () => {
  const email = 'gate-brute@example.com';
  let last = null;
  for (let i = 0; i < 6; i += 1) {
    last = await api(base, '/api/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: 'definitely-wrong-password' }),
    });
  }
  assert.equal(last.status, 429);
  assert.equal(last.payload.code, 'rate_limited');
  assert.equal(JSON.stringify(last.payload).includes(configured), false);
});

test('nginx render script writes a location file without logging the secret', () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'mws-nginx-'));
  const output = path.join(dir, 'secret.conf');
  const script = fileURLToPath(new URL('../scripts/render-admin-nginx.mjs', import.meta.url));
  const result = spawnSync(process.execPath, [script, '--output', output], {
    cwd: path.resolve(path.dirname(script), '..'),
    env: { ...process.env },
    encoding: 'utf8',
  });
  try {
    assert.equal(result.status, 0, result.stderr);
    const written = readFileSync(output, 'utf8');
    assert.ok(written.includes(`location = /${configured}`));
    assert.ok(written.includes('proxy_pass http://127.0.0.1:8787'));
    assert.equal(result.stdout.includes(configured), false);
    assert.equal(result.stderr.includes(configured), false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

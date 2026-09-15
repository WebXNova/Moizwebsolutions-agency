import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import jwt from 'jsonwebtoken';
import { env, evaluateAuthConfig, evaluateMysqlGuard } from '../src/config/env.js';
import { redactSecrets } from '../src/lib/logger.js';
import { setTransporter } from '../src/email/mailer.js';
import { durationToMs } from '../src/lib/duration.js';
import { sniffImageKind } from '../src/lib/imageMagic.js';
import { installProcessGuards } from '../src/lib/processGuards.js';
import { createRateLimiter } from '../src/lib/rateLimit.js';
import { isDangerousUrl, isSafeAssetUrl, isSafeHref, isSafeHttpUrl } from '../src/lib/safeUrl.js';
import { mysqlPoolOptions } from '../src/db/mysql.js';
import { validatePassword } from '../src/lib/passwordPolicy.js';
import { api, authHeader, getDb, loginAs, startServer, stopServer, validInquiry } from './helpers.mjs';

const { server, base } = await startServer();
after(() => stopServer(server));

const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+X89gAAAAASUVORK5CYII=',
  'base64',
);

const JPEG_HEADER = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
const WEBP_HEADER = Buffer.from([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]);

async function upload(token, filename, bytes, mime = 'image/png', endpoint = '/api/admin/uploads/project-image') {
  const form = new FormData();
  form.append('image', new Blob([bytes], { type: mime }), filename);
  const response = await fetch(`${base}${endpoint}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  const payload = await response.json().catch(() => null);
  return { status: response.status, payload };
}

test('production rejects missing secrets and development JWT fallback', () => {
  const missing = evaluateAuthConfig({
    isProduction: true,
    jwtSecret: '',
    jwtExpiresIn: '12h',
    adminPassword: 'changeme123',
    allowDevJwtFallback: true,
  });
  assert.ok(missing.some((item) => item.includes('JWT_SECRET')));
  assert.ok(missing.some((item) => item.includes('ADMIN_PASSWORD') || item.includes('fallback')));

  const weak = evaluateAuthConfig({
    isProduction: true,
    jwtSecret: 'dev-only-change-in-production',
    jwtExpiresIn: '7d',
    adminPassword: 'ok-enough-secret',
  });
  assert.ok(weak.some((item) => item.includes('placeholder') || item.includes('24h') || item.includes('fallback')));

  const shortSeed = evaluateAuthConfig({
    isProduction: true,
    jwtSecret: 'a'.repeat(32),
    jwtExpiresIn: '12h',
    adminPassword: 'short',
  });
  assert.ok(shortSeed.some((item) => item.includes('ADMIN_PASSWORD')));

  const ok = evaluateAuthConfig({
    isProduction: true,
    jwtSecret: 'a'.repeat(32),
    jwtExpiresIn: '12h',
    adminPassword: 'unique-admin-pass',
  });
  assert.deepEqual(ok, []);

  const dev = evaluateAuthConfig({
    isProduction: false,
    jwtSecret: '',
    jwtExpiresIn: '12h',
    adminPassword: 'changeme123',
  });
  assert.deepEqual(dev, []);
});

test('production refuses accidental MySQL activation', () => {
  assert.ok(evaluateMysqlGuard({ isProduction: true, dbHost: '127.0.0.1' }).length > 0);
  assert.deepEqual(evaluateMysqlGuard({ isProduction: false, dbHost: '127.0.0.1' }), []);
  assert.ok(!readFileSync(new URL('../src/db/mysql.js', import.meta.url), 'utf8').includes('Atomics.wait('));
  const options = mysqlPoolOptions({
    host: '127.0.0.1',
    port: 3306,
    user: 'mws',
    password: 'x',
    name: 'mws',
  });
  assert.equal(options.waitForConnections, true);
  assert.equal(options.connectionLimit, 10);
});

test('logout revokes a previously valid access token', async () => {
  const login = await loginAs(base);
  assert.equal(login.status, 200);
  const token = login.payload.token;
  const me = await api(base, '/api/admin/auth/me', { headers: authHeader(token) });
  assert.equal(me.status, 200);

  const loggedOut = await api(base, '/api/admin/auth/logout', {
    method: 'POST',
    headers: authHeader(token),
  });
  assert.equal(loggedOut.status, 200);
  assert.equal(loggedOut.payload.ok, true);

  const after = await api(base, '/api/admin/dashboard', { headers: authHeader(token) });
  assert.equal(after.status, 401);
});

test('unknown roles cannot use admin APIs', async () => {
  const login = await loginAs(base);
  const created = await api(base, '/api/admin/cms/users', {
    method: 'POST',
    headers: authHeader(login.payload.token),
    body: JSON.stringify({
      email: 'unknown-role@example.com',
      password: 'unknownrole1',
      role: 'viewer',
      active: true,
    }),
  });
  assert.equal(created.status, 201);
  getDb().prepare("UPDATE admin_users SET role = 'superuser' WHERE email = ?").run('unknown-role@example.com');

  const unknownLogin = await loginAs(base, 'unknown-role@example.com', 'unknownrole1');
  assert.equal(unknownLogin.status, 401);

  const forged = jwt.sign({ email: 'unknown-role@example.com' }, env.jwt.secret, {
    subject: created.payload.user.id,
    expiresIn: '12h',
  });
  const write = await api(base, '/api/admin/cms/services', {
    method: 'POST',
    headers: authHeader(forged),
    body: JSON.stringify({ title: 'Nope', slug: 'nope-unknown' }),
  });
  assert.equal(write.status, 401);
});

test('viewer cannot read inquiry PII', async () => {
  const superLogin = await loginAs(base);
  await api(base, '/api/admin/cms/users', {
    method: 'POST',
    headers: authHeader(superLogin.payload.token),
    body: JSON.stringify({
      email: 'pii-viewer@example.com',
      password: 'viewerpass12',
      role: 'viewer',
      active: true,
    }),
  });
  const created = await api(base, '/api/project-inquiry', {
    method: 'POST',
    body: JSON.stringify({ ...validInquiry, email: 'lead@example.com', description: 'PII probe brief.' }),
  });
  const viewer = await loginAs(base, 'pii-viewer@example.com', 'viewerpass12');
  const listed = await api(base, '/api/admin/inquiries', { headers: authHeader(viewer.payload.token) });
  assert.equal(listed.status, 403);
  const detail = await api(base, `/api/admin/inquiries/${created.payload.inquiryId}`, {
    headers: authHeader(viewer.payload.token),
  });
  assert.equal(detail.status, 403);
});

test('content_manager cannot read inquiry PII either', async () => {
  const superLogin = await loginAs(base);
  await api(base, '/api/admin/cms/users', {
    method: 'POST',
    headers: authHeader(superLogin.payload.token),
    body: JSON.stringify({
      email: 'manager@example.com',
      password: 'cms-write-pass1',
      role: 'content_manager',
      active: true,
    }),
  });
  const manager = await loginAs(base, 'manager@example.com', 'cms-write-pass1');
  const listed = await api(base, '/api/admin/inquiries', { headers: authHeader(manager.payload.token) });
  assert.equal(listed.status, 403);
});

test('unsafe uploads are rejected and safe rasters are accepted', async () => {
  const login = await loginAs(base);
  const token = login.payload.token;

  const svg = await upload(token, 'xss.svg', Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>'), 'image/svg+xml');
  assert.equal(svg.status, 400);

  const html = await upload(token, 'page.html', Buffer.from('<script>alert(1)</script>'), 'text/html');
  assert.equal(html.status, 400);

  const js = await upload(token, 'payload.js', Buffer.from('alert(1)'), 'text/javascript');
  assert.equal(js.status, 400);

  const exe = await upload(token, 'tool.exe', Buffer.from('MZ'), 'application/octet-stream');
  assert.equal(exe.status, 400);

  const png = await upload(token, 'ok.png', PNG_1X1, 'image/png');
  assert.equal(png.status, 200);
  assert.equal(png.payload.ok, true);

  const jpg = await upload(token, 'ok.jpg', Buffer.concat([JPEG_HEADER, Buffer.alloc(32)]), 'image/jpeg');
  assert.equal(jpg.status, 200);

  const webp = await upload(token, 'ok.webp', Buffer.concat([WEBP_HEADER, Buffer.alloc(16)]), 'image/webp');
  assert.equal(webp.status, 200);

  const unauth = await upload('', 'ok.png', PNG_1X1, 'image/png');
  assert.equal(unauth.status, 401);

  const viewerLogin = await loginAs(base, 'pii-viewer@example.com', 'viewerpass12').catch(() => null);
  if (viewerLogin?.status === 200) {
    const viewerUpload = await upload(viewerLogin.payload.token, 'ok.png', PNG_1X1, 'image/png');
    assert.equal(viewerUpload.status, 403);
  }

  const oversized = await upload(token, 'huge.png', Buffer.concat([PNG_1X1, Buffer.alloc(5 * 1024 * 1024)]), 'image/png');
  assert.equal(oversized.status, 400);

  assert.equal(sniffImageKind(PNG_1X1), 'png');
  assert.equal(sniffImageKind(WEBP_HEADER), 'webp');
});

test('SMTP success and failure are recorded without deleting the inquiry', async () => {
  const previousHost = env.smtp.host;
  const previousUser = env.smtp.user;
  const previousPass = env.smtp.pass;
  const previousFrom = env.mail.fromAddress;
  const previousBiz = env.mail.businessEmail;

  env.smtp.host = 'smtp.test.local';
  env.smtp.user = 'mailer';
  env.smtp.pass = 'secret';
  env.mail.fromAddress = 'from@example.com';
  env.mail.businessEmail = 'biz@example.com';

  setTransporter({
    sendMail: async () => ({ accepted: ['biz@example.com'], rejected: [] }),
  });
  const sent = await api(base, '/api/project-inquiry', {
    method: 'POST',
    body: JSON.stringify({ ...validInquiry, email: 'smtp-ok@example.com', description: 'SMTP success path.' }),
  });
  assert.equal(sent.status, 201);
  assert.equal(sent.payload.emailStatus, 'sent');
  assert.equal(sent.payload.notificationSent, true);
  const sentRow = getDb().prepare('SELECT * FROM inquiries WHERE id = ?').get(sent.payload.inquiryId);
  assert.equal(sentRow.email_status, 'sent');

  setTransporter({
    sendMail: async () => {
      throw new Error('smtp unavailable');
    },
  });
  const failed = await api(base, '/api/project-inquiry', {
    method: 'POST',
    body: JSON.stringify({ ...validInquiry, email: 'smtp-fail@example.com', description: 'SMTP failure path.' }),
  });
  assert.equal(failed.status, 201);
  assert.equal(failed.payload.ok, true);
  assert.equal(failed.payload.emailStatus, 'failed');
  assert.equal(failed.payload.notificationSent, false);
  const failedRow = getDb().prepare('SELECT * FROM inquiries WHERE id = ?').get(failed.payload.inquiryId);
  assert.ok(failedRow);
  assert.equal(failedRow.email_status, 'failed');

  env.smtp.host = previousHost;
  env.smtp.user = previousUser;
  env.smtp.pass = previousPass;
  env.mail.fromAddress = previousFrom;
  env.mail.businessEmail = previousBiz;
  setTransporter(null);
});

test('dangerous CMS URLs are rejected', async () => {
  const login = await loginAs(base);
  const headers = authHeader(login.payload.token);
  const listed = await api(base, '/api/admin/cms/services', { headers });
  const id = listed.payload.services[0].id;

  const js = await api(base, `/api/admin/cms/services/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ ctaUrl: 'javascript:alert(1)' }),
  });
  assert.equal(js.status, 400);

  const dataUrl = await api(base, `/api/admin/cms/services/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ ctaUrl: 'data:text/html,hi' }),
  });
  assert.equal(dataUrl.status, 400);

  const vb = await api(base, `/api/admin/cms/navigation/${listed.payload.services[0].id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ href: '/javascript:alert(1)' }),
  });
  assert.ok(vb.status === 400 || vb.status === 404);

  const nav = await api(base, '/api/admin/cms/navigation', { headers });
  const navId = nav.payload.navigation[0].id;
  const slashJs = await api(base, `/api/admin/cms/navigation/${navId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ href: '/javascript:alert(1)' }),
  });
  assert.equal(slashJs.status, 400);

  const httpsOk = await api(base, `/api/admin/cms/services/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ ctaUrl: 'https://example.com' }),
  });
  assert.equal(httpsOk.status, 200);

  assert.equal(isSafeHttpUrl('https://example.com'), true);
  assert.equal(isSafeHttpUrl('http://example.com'), true);
  assert.equal(isDangerousUrl('javascript:alert(1)'), true);
  assert.equal(isSafeHref('/javascript:alert(1)'), false);
  assert.equal(isSafeAssetUrl('vbscript:x'), false);
  assert.equal(isSafeAssetUrl('data:text/html,x'), false);
});

test('password policy rejects short and common passwords', async () => {
  assert.ok(validatePassword('short'));
  assert.ok(validatePassword('password123'));
  assert.equal(validatePassword('a-unique-pass', { email: 'admin@example.com' }), null);

  const login = await loginAs(base);
  const created = await api(base, '/api/admin/cms/users', {
    method: 'POST',
    headers: authHeader(login.payload.token),
    body: JSON.stringify({
      email: 'weakpass@example.com',
      password: 'short',
      role: 'viewer',
    }),
  });
  assert.equal(created.status, 400);
});

test('rate limiter returns 429 after the window is exhausted', () => {
  const limiter = createRateLimiter({ windowMs: 60_000, maxPerKey: 2, maxGlobal: 10 });
  assert.equal(limiter.check('a').allowed, true);
  assert.equal(limiter.check('a').allowed, true);
  const blocked = limiter.check('a');
  assert.equal(blocked.allowed, false);
});

test('process guards invoke shutdown on fatal events', () => {
  const calls = [];
  const handlers = { unhandledRejection: null, uncaughtException: null };
  const originalOn = process.on;
  process.on = (event, handler) => {
    handlers[event] = handler;
    return process;
  };
  try {
    installProcessGuards({ shutdown: (signal) => calls.push(signal) });
    handlers.unhandledRejection(new Error('boom'));
    handlers.uncaughtException(new Error('bang'));
  } finally {
    process.on = originalOn;
  }
  assert.deepEqual(calls, ['unhandledRejection', 'uncaughtException']);
});

test('JWT default lifetime is bounded and parseable', () => {
  assert.ok(durationToMs(env.jwt.expiresIn) <= 24 * 60 * 60 * 1000);
  assert.equal(durationToMs('12h'), 12 * 60 * 60 * 1000);
});

test('logger redacts configured secrets from accidental log payloads', () => {
  const leak = redactSecrets(`path=${env.adminSecret.path}; jwt=${env.jwt.secret}`);
  assert.equal(leak.includes(env.adminSecret.path), false);
  assert.equal(leak.includes(env.jwt.secret), false);
  assert.equal(leak.includes('[redacted]'), true);
});

test('sqlite queries, failed SQL, and transactions still work', () => {
  const db = getDb();
  const ok = db.prepare('SELECT 1 AS ok').get();
  assert.equal(ok.ok, 1);
  assert.throws(() => db.prepare('SELECT * FROM definitely_missing').get());
  const tx = db.transaction(() => 7);
  assert.equal(tx(), 7);
});

test('inquiry resend is rate limited', async () => {
  const login = await loginAs(base);
  const created = await api(base, '/api/project-inquiry', {
    method: 'POST',
    body: JSON.stringify({ ...validInquiry, email: 'resend@example.com', description: 'Resend limit brief.' }),
  });
  const headers = authHeader(login.payload.token);
  let last = null;
  for (let i = 0; i < 8; i += 1) {
    last = await api(base, `/api/admin/inquiries/${created.payload.inquiryId}/resend`, {
      method: 'POST',
      headers,
    });
  }
  assert.equal(last.status, 429);
  assert.equal(last.payload.code, 'rate_limited');
});


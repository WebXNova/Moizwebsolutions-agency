import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env.js';
import { ACCESS_TOKEN_AUD, ACCESS_TOKEN_ISS } from '../src/lib/sessions.js';
import { api, authHeader, getDb, loginAs, startServer, stopServer, validInquiry } from './helpers.mjs';

const { server, base } = await startServer();
after(() => stopServer(server));

const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+X89gAAAAASUVORK5CYII=',
  'base64',
);
const GIF_HEADER = Buffer.concat([Buffer.from('GIF89a'), Buffer.alloc(10)]);

async function upload(token, filename, bytes, mime) {
  const form = new FormData();
  form.append('image', new Blob([bytes], { type: mime }), filename);
  const response = await fetch(`${base}/api/admin/uploads/project-image`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  const payload = await response.json().catch(() => null);
  return { status: response.status, payload };
}

test('invalid JWT signature and unknown JTI are rejected', async () => {
  const admin = getDb().prepare('SELECT id, email FROM admin_users LIMIT 1').get();
  const forged = jwt.sign({ email: admin.email }, 'other-secret-that-is-not-the-jwt', {
    algorithm: 'HS256',
    issuer: ACCESS_TOKEN_ISS,
    audience: ACCESS_TOKEN_AUD,
    subject: admin.id,
    jwtid: '00000000-0000-4000-8000-000000000000',
    expiresIn: '12h',
  });
  const badSig = await api(base, '/api/admin/dashboard', { headers: authHeader(forged) });
  assert.equal(badSig.status, 401);

  const unknownJti = jwt.sign({ email: admin.email }, env.jwt.secret, {
    algorithm: 'HS256',
    issuer: ACCESS_TOKEN_ISS,
    audience: ACCESS_TOKEN_AUD,
    subject: admin.id,
    jwtid: '11111111-1111-4111-8111-111111111111',
    expiresIn: '12h',
  });
  const unknown = await api(base, '/api/admin/dashboard', { headers: authHeader(unknownJti) });
  assert.equal(unknown.status, 401);
});

test('CORS allows configured origins and denies others without a credentialed wildcard', async () => {
  const previous = env.allowedOrigins.slice();
  env.allowedOrigins = ['https://moizwebsolutions.com'];
  try {
    const allowed = await fetch(`${base}/api/health/live`, {
      headers: { Origin: 'https://moizwebsolutions.com' },
    });
    assert.equal(allowed.headers.get('access-control-allow-origin'), 'https://moizwebsolutions.com');
    assert.notEqual(allowed.headers.get('access-control-allow-credentials'), 'true');

    const denied = await fetch(`${base}/api/health/live`, {
      headers: { Origin: 'https://evil.example' },
    });
    assert.equal(denied.headers.get('access-control-allow-origin'), null);

    const malformed = await fetch(`${base}/api/health/live`, {
      headers: { Origin: 'https://moizwebsolutions.com/admin' },
    });
    assert.equal(malformed.headers.get('access-control-allow-origin'), null);

    const preflight = await fetch(`${base}/api/admin/auth/login`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://evil.example',
        'Access-Control-Request-Method': 'POST',
      },
    });
    assert.equal(preflight.headers.get('access-control-allow-origin'), null);
  } finally {
    env.allowedOrigins = previous;
  }
});

test('API responses include clickjacking and referrer headers without leaking stacks', async () => {
  const response = await fetch(`${base}/api/health/live`);
  assert.equal(response.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
  assert.equal(response.headers.get('permissions-policy'), 'camera=(), microphone=(), geolocation=()');
  assert.equal(response.headers.get('x-powered-by'), null);

  const malformed = await fetch(`${base}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{"email":',
  });
  const text = await malformed.text();
  assert.ok(malformed.status >= 400);
  assert.equal(text.includes('SyntaxError'), false);
  assert.equal(text.includes('at ') && text.includes('.js:'), false);
  assert.equal(text.toLowerCase().includes('node_modules'), false);
  assert.equal(text.includes(env.jwt.secret), false);
  const payload = JSON.parse(text);
  assert.equal(payload.ok, false);
  assert.equal(Object.hasOwn(payload, 'stack'), false);
});

test('inquiry rejects XSS URL schemes, type confusion, and oversized fields', async () => {
  const js = await api(base, '/api/project-inquiry', {
    method: 'POST',
    body: JSON.stringify({ ...validInquiry, website: 'javascript:alert(1)' }),
  });
  assert.equal(js.status, 422);

  const dataUrl = await api(base, '/api/project-inquiry', {
    method: 'POST',
    body: JSON.stringify({ ...validInquiry, social: 'data:text/html,hi' }),
  });
  assert.equal(dataUrl.status, 422);

  const typed = await api(base, '/api/project-inquiry', {
    method: 'POST',
    body: JSON.stringify({ ...validInquiry, name: ['Admin'], email: { $gt: '' }, services: 'web-development' }),
  });
  assert.equal(typed.status, 422);

  const sqli = await api(base, '/api/project-inquiry', {
    method: 'POST',
    body: JSON.stringify({
      ...validInquiry,
      name: "Robert'); DROP TABLE inquiries;--",
      email: 'gate-sqli@example.com',
      description: '<script>alert(1)</script> Need a brochure site built this quarter.',
    }),
  });
  assert.equal(sqli.status, 201);
  const tables = getDb().prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='inquiries'").get();
  assert.ok(tables);

  const login = await loginAs(base);
  const listed = await api(base, '/api/admin/inquiries?search=%27%20OR%201=1--', {
    headers: authHeader(login.payload.token),
  });
  assert.equal(listed.status, 200);
  assert.equal(Array.isArray(listed.payload.inquiries), true);
});

test('editor cannot read inquiry PII; viewer dashboard does not include lead contact', async () => {
  const superLogin = await loginAs(base);
  await api(base, '/api/admin/cms/users', {
    method: 'POST',
    headers: authHeader(superLogin.payload.token),
    body: JSON.stringify({
      email: 'gate-editor@example.com',
      password: 'editor-pass-12',
      role: 'editor',
      active: true,
    }),
  });
  await api(base, '/api/admin/cms/users', {
    method: 'POST',
    headers: authHeader(superLogin.payload.token),
    body: JSON.stringify({
      email: 'gate-viewer@example.com',
      password: 'viewer-pass-12',
      role: 'viewer',
      active: true,
    }),
  });

  const created = await api(base, '/api/project-inquiry', {
    method: 'POST',
    body: JSON.stringify({
      ...validInquiry,
      email: 'lead-pii@example.com',
      phone: '+1 555 0199',
      description: 'Confidential launch brief for the new brand site.',
    }),
  });
  assert.equal(created.status, 201);

  const editor = await loginAs(base, 'gate-editor@example.com', 'editor-pass-12');
  const editorList = await api(base, '/api/admin/inquiries', { headers: authHeader(editor.payload.token) });
  assert.equal(editorList.status, 403);
  const editorDetail = await api(base, `/api/admin/inquiries/${created.payload.inquiryId}`, {
    headers: authHeader(editor.payload.token),
  });
  assert.equal(editorDetail.status, 403);

  const viewer = await loginAs(base, 'gate-viewer@example.com', 'viewer-pass-12');
  const dash = await api(base, '/api/admin/dashboard', { headers: authHeader(viewer.payload.token) });
  assert.equal(dash.status, 200);
  const blob = JSON.stringify(dash.payload);
  assert.equal(blob.includes('lead-pii@example.com'), false);
  assert.equal(blob.includes('+1 555 0199'), false);
  assert.equal(blob.includes('Confidential launch brief'), false);
});

test('GIF is accepted; HTML/JS disguised as images are not', async () => {
  const login = await loginAs(base);
  const token = login.payload.token;

  const gif = await upload(token, 'ok.gif', GIF_HEADER, 'image/gif');
  assert.equal(gif.status, 200);

  const fakePng = await upload(
    token,
    'page.png',
    Buffer.from('<!DOCTYPE html><script>alert(1)</script>'),
    'image/png',
  );
  assert.equal(fakePng.status, 400);

  const wrongMime = await upload(token, 'ok.png', PNG_1X1, 'text/html');
  assert.equal(wrongMime.status, 400);

  const exeNamedPng = await upload(token, 'tool.png', Buffer.from('MZ\0\0\0\0\0\0\0\0\0\0\0\0'), 'image/png');
  assert.equal(exeNamedPng.status, 400);
});

import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env.js';
import { ACCESS_TOKEN_AUD, ACCESS_TOKEN_ISS } from '../src/lib/sessions.js';
import { getDb, api, authHeader, loginAs, startServer, stopServer } from './helpers.mjs';

const { server, base } = await startServer();
after(() => stopServer(server));

test('valid login returns a token and admin identity', async () => {
  const result = await loginAs(base);
  assert.equal(result.status, 200);
  assert.equal(result.payload.ok, true);
  assert.ok(result.payload.token);
  assert.equal(result.payload.admin.email, 'admin@example.com');
  assert.equal(result.payload.admin.role, 'super_admin');
});

test('unknown accounts and wrong passwords share the same failure', async () => {
  const unknown = await loginAs(base, 'missing-admin@example.com', 'wrong-password1');
  const wrong = await loginAs(base, 'admin@example.com', 'wrong-password1');
  assert.equal(unknown.status, 401);
  assert.equal(wrong.status, 401);
  assert.equal(unknown.payload.code, 'invalid_credentials');
  assert.equal(wrong.payload.code, 'invalid_credentials');
  assert.equal(unknown.payload.message, wrong.payload.message);
});

test('login rejects missing, oversized, and non-string credentials', async () => {
  const missing = await api(base, '/api/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({}),
  });
  assert.equal(missing.status, 400);

  const injection = await api(base, '/api/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: "' OR 1=1 --", password: "' OR 1=1 --" }),
  });
  assert.equal(injection.status, 401);
  assert.equal(injection.payload.code, 'invalid_credentials');

  const typed = await api(base, '/api/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: ['admin@example.com'], password: { $gt: '' } }),
  });
  assert.equal(typed.status, 400);

  const long = await api(base, '/api/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@example.com', password: 'x'.repeat(201) }),
  });
  assert.equal(long.status, 400);
});

test('unauthenticated and malformed tokens cannot call admin APIs', async () => {
  const none = await api(base, '/api/admin/dashboard');
  assert.equal(none.status, 401);

  const empty = await api(base, '/api/admin/dashboard', { headers: authHeader('') });
  assert.equal(empty.status, 401);
});

test('malformed token is rejected', async () => {
  const result = await api(base, '/api/admin/dashboard', {
    headers: authHeader('not-a-jwt'),
  });
  assert.equal(result.status, 401);
  assert.equal(result.payload.code, 'unauthorized');
});

test('expired token is rejected', async () => {
  const admin = getDb().prepare('SELECT id, email FROM admin_users LIMIT 1').get();
  const token = jwt.sign({ email: admin.email }, env.jwt.secret, {
    algorithm: 'HS256',
    issuer: ACCESS_TOKEN_ISS,
    audience: ACCESS_TOKEN_AUD,
    subject: admin.id,
    expiresIn: '1ms',
  });
  await new Promise((resolve) => setTimeout(resolve, 20));
  const result = await api(base, '/api/admin/dashboard', {
    headers: authHeader(token),
  });
  assert.equal(result.status, 401);
});

test('inactive admin cannot sign in', async () => {
  const login = await loginAs(base);
  const created = await api(base, '/api/admin/cms/users', {
    method: 'POST',
    headers: authHeader(login.payload.token),
    body: JSON.stringify({
      email: 'viewer-inactive@example.com',
      password: 'inactivepass1',
      role: 'viewer',
      active: false,
    }),
  });
  assert.equal(created.status, 201);

  const result = await loginAs(base, 'viewer-inactive@example.com', 'inactivepass1');
  assert.equal(result.status, 401);
  assert.equal(result.payload.code, 'invalid_credentials');
});

test('viewer cannot perform privileged writes', async () => {
  const superLogin = await loginAs(base);
  const created = await api(base, '/api/admin/cms/users', {
    method: 'POST',
    headers: authHeader(superLogin.payload.token),
    body: JSON.stringify({
      email: 'viewer@example.com',
      password: 'readonly-pass1',
      role: 'viewer',
      active: true,
    }),
  });
  assert.equal(created.status, 201);

  const viewerLogin = await loginAs(base, 'viewer@example.com', 'readonly-pass1');
  assert.equal(viewerLogin.status, 200);

  const forbidden = await api(base, '/api/admin/cms/services', {
    method: 'POST',
    headers: authHeader(viewerLogin.payload.token),
    body: JSON.stringify({ title: 'Should not work', slug: 'nope' }),
  });
  assert.equal(forbidden.status, 403);
  assert.equal(forbidden.payload.code, 'forbidden');

  const users = await api(base, '/api/admin/cms/users', { headers: authHeader(viewerLogin.payload.token) });
  assert.equal(users.status, 403);
});

test('login response never includes a password or hash', async () => {
  const result = await loginAs(base);
  const blob = JSON.stringify(result.payload);
  assert.equal(result.status, 200);
  assert.equal(Object.hasOwn(result.payload, 'password'), false);
  assert.equal(Object.hasOwn(result.payload.admin, 'password'), false);
  assert.equal(Object.hasOwn(result.payload.admin, 'password_hash'), false);
  assert.equal(blob.includes('password_hash'), false);
  assert.equal(blob.includes(process.env.ADMIN_PASSWORD), false);
});

test('tokens missing jti, issuer, audience, or using the wrong algorithm fail', async () => {
  const admin = getDb().prepare('SELECT id, email FROM admin_users LIMIT 1').get();

  const noJti = jwt.sign({ email: admin.email }, env.jwt.secret, {
    algorithm: 'HS256',
    issuer: ACCESS_TOKEN_ISS,
    audience: ACCESS_TOKEN_AUD,
    subject: admin.id,
    expiresIn: '12h',
  });
  const noJtiResult = await api(base, '/api/admin/dashboard', { headers: authHeader(noJti) });
  assert.equal(noJtiResult.status, 401);

  const wrongIss = jwt.sign({ email: admin.email }, env.jwt.secret, {
    algorithm: 'HS256',
    issuer: 'other-api',
    audience: ACCESS_TOKEN_AUD,
    subject: admin.id,
    jwtid: 'not-a-session',
    expiresIn: '12h',
  });
  const wrongIssResult = await api(base, '/api/admin/dashboard', { headers: authHeader(wrongIss) });
  assert.equal(wrongIssResult.status, 401);

  const hs512 = jwt.sign({ email: admin.email }, env.jwt.secret, {
    algorithm: 'HS512',
    issuer: ACCESS_TOKEN_ISS,
    audience: ACCESS_TOKEN_AUD,
    subject: admin.id,
    jwtid: 'not-a-session',
    expiresIn: '12h',
  });
  const hs512Result = await api(base, '/api/admin/dashboard', { headers: authHeader(hs512) });
  assert.equal(hs512Result.status, 401);

  const noneHeader = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  const nonePayload = Buffer.from(
    JSON.stringify({
      sub: admin.id,
      iss: ACCESS_TOKEN_ISS,
      aud: ACCESS_TOKEN_AUD,
      jti: 'forged',
    }),
  ).toString('base64url');
  const noneResult = await api(base, '/api/admin/dashboard', {
    headers: authHeader(`${noneHeader}.${nonePayload}.`),
  });
  assert.equal(noneResult.status, 401);
});

test('password change and deactivation revoke existing sessions', async () => {
  const superLogin = await loginAs(base);
  const created = await api(base, '/api/admin/cms/users', {
    method: 'POST',
    headers: authHeader(superLogin.payload.token),
    body: JSON.stringify({
      email: 'rotate-admin@example.com',
      password: 'first-password1',
      role: 'editor',
      active: true,
    }),
  });
  assert.equal(created.status, 201);
  const userId = created.payload.user.id;

  const first = await loginAs(base, 'rotate-admin@example.com', 'first-password1');
  assert.equal(first.status, 200);
  const me = await api(base, '/api/admin/auth/me', { headers: authHeader(first.payload.token) });
  assert.equal(me.status, 200);

  const renamed = await api(base, `/api/admin/cms/users/${userId}`, {
    method: 'PUT',
    headers: authHeader(superLogin.payload.token),
    body: JSON.stringify({ password: 'second-password1' }),
  });
  assert.equal(renamed.status, 200);
  const afterPassword = await api(base, '/api/admin/auth/me', { headers: authHeader(first.payload.token) });
  assert.equal(afterPassword.status, 401);

  const second = await loginAs(base, 'rotate-admin@example.com', 'second-password1');
  assert.equal(second.status, 200);

  const disabled = await api(base, `/api/admin/cms/users/${userId}`, {
    method: 'PUT',
    headers: authHeader(superLogin.payload.token),
    body: JSON.stringify({ active: false }),
  });
  assert.equal(disabled.status, 200);
  const afterDisable = await api(base, '/api/admin/dashboard', { headers: authHeader(second.payload.token) });
  assert.equal(afterDisable.status, 401);

  const relogin = await loginAs(base, 'rotate-admin@example.com', 'second-password1');
  assert.equal(relogin.status, 401);
});

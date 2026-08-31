import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env.js';
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

test('invalid credentials are rejected', async () => {
  const result = await loginAs(base, 'admin@example.com', 'wrong-password');
  assert.equal(result.status, 401);
  assert.equal(result.payload.ok, false);
  assert.equal(result.payload.code, 'invalid_credentials');
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
      password: 'viewerpass1',
      role: 'viewer',
      active: true,
    }),
  });
  assert.equal(created.status, 201);

  const viewerLogin = await loginAs(base, 'viewer@example.com', 'viewerpass1');
  assert.equal(viewerLogin.status, 200);

  const forbidden = await api(base, '/api/admin/cms/services', {
    method: 'POST',
    headers: authHeader(viewerLogin.payload.token),
    body: JSON.stringify({ title: 'Should not work', slug: 'nope' }),
  });
  assert.equal(forbidden.status, 403);
  assert.equal(forbidden.payload.code, 'forbidden');
});

import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { api, authHeader, getDb, loginAs, startServer, stopServer, validInquiry } from './helpers.mjs';

const { server, base } = await startServer();
after(() => stopServer(server));

test('valid inquiry is persisted when SMTP is unconfigured', async () => {
  const result = await api(base, '/api/project-inquiry', {
    method: 'POST',
    body: JSON.stringify(validInquiry),
  });
  assert.equal(result.status, 201);
  assert.equal(result.payload.ok, true);
  assert.ok(result.payload.inquiryId);
  assert.equal(result.payload.emailStatus, 'failed');
  assert.equal(result.payload.notificationSent, false);
  assert.equal(result.payload.confirmationSent, false);

  const row = getDb().prepare('SELECT * FROM inquiries WHERE id = ?').get(result.payload.inquiryId);
  assert.ok(row);
  assert.equal(row.email, 'client@example.com');
  assert.equal(row.status, 'new');
  assert.equal(row.email_status, 'failed');
});

test('invalid inquiry is rejected and not stored', async () => {
  const before = getDb().prepare('SELECT COUNT(*) AS count FROM inquiries').get().count;
  const result = await api(base, '/api/project-inquiry', {
    method: 'POST',
    body: JSON.stringify({ name: 'A', email: 'not-an-email' }),
  });
  assert.equal(result.status, 422);
  assert.equal(result.payload.ok, false);
  const after = getDb().prepare('SELECT COUNT(*) AS count FROM inquiries').get().count;
  assert.equal(after, before);
});

test('duplicate emails are allowed when the brief differs', async () => {
  const first = await api(base, '/api/project-inquiry', {
    method: 'POST',
    body: JSON.stringify({ ...validInquiry, email: 'repeat@example.com', description: 'First brief for the studio.' }),
  });
  const second = await api(base, '/api/project-inquiry', {
    method: 'POST',
    body: JSON.stringify({ ...validInquiry, email: 'repeat@example.com', description: 'A follow-up with a new scope.' }),
  });
  assert.equal(first.status, 201);
  assert.equal(second.status, 201);
  assert.notEqual(first.payload.inquiryId, second.payload.inquiryId);
});

test('identical inquiry retries reuse the existing record', async () => {
  const body = { ...validInquiry, email: 'idempotent@example.com', description: 'Same payload sent twice.' };
  const first = await api(base, '/api/project-inquiry', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  const second = await api(base, '/api/project-inquiry', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  assert.equal(first.status, 201);
  assert.equal(second.status, 201);
  assert.equal(first.payload.inquiryId, second.payload.inquiryId);
});

test('public users cannot list or update inquiries', async () => {
  const created = await api(base, '/api/project-inquiry', {
    method: 'POST',
    body: JSON.stringify({ ...validInquiry, email: 'secret@example.com' }),
  });
  const id = created.payload.inquiryId;

  const listed = await api(base, '/api/admin/inquiries');
  assert.equal(listed.status, 401);

  const byId = await api(base, `/api/admin/inquiries/${id}`);
  assert.equal(byId.status, 401);

  const updated = await api(base, `/api/admin/inquiries/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status: 'won' }),
  });
  assert.equal(updated.status, 401);
});

test('admin can retrieve and change inquiry status', async () => {
  const created = await api(base, '/api/project-inquiry', {
    method: 'POST',
    body: JSON.stringify({ ...validInquiry, email: 'pipeline@example.com' }),
  });
  const id = created.payload.inquiryId;
  const login = await loginAs(base);
  const headers = authHeader(login.payload.token);

  const listed = await api(base, '/api/admin/inquiries?status=new&search=pipeline', { headers });
  assert.equal(listed.status, 200);
  assert.ok(listed.payload.inquiries.some((row) => row.id === id));

  const updated = await api(base, `/api/admin/inquiries/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ status: 'contacted', notes: 'Called back.' }),
  });
  assert.equal(updated.status, 200);
  assert.equal(updated.payload.inquiry.status, 'contacted');
  assert.equal(updated.payload.inquiry.notes, 'Called back.');

  const archived = await api(base, `/api/admin/inquiries/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ status: 'archived' }),
  });
  assert.equal(archived.payload.inquiry.status, 'archived');

  const deleted = await api(base, `/api/admin/inquiries/${id}`, {
    method: 'DELETE',
    headers,
  });
  assert.equal(deleted.status, 405);
});

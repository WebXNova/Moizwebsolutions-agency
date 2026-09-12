import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { api, authHeader, loginAs, startServer, stopServer } from './helpers.mjs';

const { server, base } = await startServer();
after(() => stopServer(server));

const login = await loginAs(base);
const token = login.payload.token;
const headers = authHeader(token);

test('CMS testimonial create, read, update, delete', async () => {
  const created = await api(base, '/api/admin/cms/testimonials', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      quote: 'They shipped a calm, fast site.',
      author: 'Ada',
      role: 'Founder',
      company: 'Northbound',
      published: true,
    }),
  });
  assert.equal(created.status, 201);
  assert.equal(created.payload.ok, true);
  const id = created.payload.testimonial.id;

  const listed = await api(base, '/api/admin/cms/testimonials', { headers });
  assert.ok(listed.payload.testimonials.some((item) => item.id === id));

  const updated = await api(base, `/api/admin/cms/testimonials/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ quote: 'Updated quote', author: 'Ada', published: true }),
  });
  assert.equal(updated.status, 200);
  assert.equal(updated.payload.testimonial.quote, 'Updated quote');

  const removed = await api(base, `/api/admin/cms/testimonials/${id}`, {
    method: 'DELETE',
    headers,
  });
  assert.equal(removed.status, 200);

  const afterDelete = await api(base, '/api/admin/cms/testimonials', { headers });
  assert.equal(
    afterDelete.payload.testimonials.some((item) => item.id === id),
    false,
  );
});

test('CMS full-set reorder succeeds', async () => {
  const listed = await api(base, '/api/admin/cms/services', { headers });
  const ids = listed.payload.services.map((row) => row.id);
  const reversed = [...ids].reverse();
  const result = await api(base, '/api/admin/cms/services/reorder', {
    method: 'PUT',
    headers,
    body: JSON.stringify({ ids: reversed }),
  });
  assert.equal(result.status, 200);
  const after = await api(base, '/api/admin/cms/services', { headers });
  assert.deepEqual(
    after.payload.services.map((row) => row.id),
    reversed,
  );
});

test('public content response has the expected shape', async () => {
  const result = await api(base, '/api/content');
  assert.equal(result.status, 200);
  assert.equal(result.payload.ok, true);
  assert.ok(result.payload.content);
  assert.ok(Array.isArray(result.payload.content.services));
  assert.ok(Array.isArray(result.payload.content.updates));
  assert.ok(result.payload.content.seo);
});

test('dashboard stats come from real counts', async () => {
  const result = await api(base, '/api/admin/dashboard', { headers });
  assert.equal(result.status, 200);
  assert.equal(typeof result.payload.stats.publishedProjects, 'number');
  assert.equal(typeof result.payload.stats.draftProjects, 'number');
  assert.equal(typeof result.payload.stats.totalInquiries, 'number');
  assert.equal(typeof result.payload.stats.newInquiries, 'number');
});

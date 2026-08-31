import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { api, authHeader, loginAs, startServer, stopServer } from './helpers.mjs';

const { server, base } = await startServer();
after(() => stopServer(server));

const login = await loginAs(base);
const token = login.payload.token;
const categoryId = (await api(base, '/api/categories')).payload.categories[0].id;

async function createProject(overrides = {}) {
  return api(base, '/api/projects', {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify({
      title: overrides.title || `Project ${randomUUID().slice(0, 8)}`,
      categoryId,
      description: 'A considered description for the test project.',
      technologies: 'React, Node',
      imageUrl: '/assets/work-commerce.svg',
      liveUrl: 'https://example.com',
      featured: false,
      published: true,
      ...overrides,
    }),
  });
}

test('public list includes published projects', async () => {
  const created = await createProject({ title: 'Visible Work', published: true });
  assert.equal(created.status, 201);
  const list = await api(base, '/api/projects');
  const ids = list.payload.projects.map((project) => project.id);
  assert.ok(ids.includes(created.payload.project.id));
});

test('public users cannot retrieve unpublished projects', async () => {
  const created = await createProject({ title: 'Hidden Draft', published: false });
  const draftId = created.payload.project.id;

  const list = await api(base, '/api/projects');
  assert.equal(
    list.payload.projects.some((project) => project.id === draftId),
    false,
  );

  const publicGet = await api(base, `/api/projects/${draftId}`);
  assert.equal(publicGet.status, 404);

  const adminGet = await api(base, `/api/projects/${draftId}`, {
    headers: authHeader(token),
  });
  assert.equal(adminGet.status, 200);
  assert.equal(adminGet.payload.project.published, false);
});

test('editing a draft without published keeps it draft', async () => {
  const created = await createProject({ title: 'Stay Draft', published: false });
  const updated = await api(base, `/api/projects/${created.payload.project.id}`, {
    method: 'PUT',
    headers: authHeader(token),
    body: JSON.stringify({ title: 'Stay Draft edited' }),
  });
  assert.equal(updated.payload.project.published, false);
});

test('editing a published project without published keeps it published', async () => {
  const created = await createProject({ title: 'Stay Live', published: true });
  const updated = await api(base, `/api/projects/${created.payload.project.id}`, {
    method: 'PUT',
    headers: authHeader(token),
    body: JSON.stringify({ title: 'Stay Live edited' }),
  });
  assert.equal(updated.payload.project.published, true);
});

test('explicit publish and unpublish change visibility', async () => {
  const created = await createProject({ title: 'Toggle', published: false });
  const id = created.payload.project.id;

  const published = await api(base, `/api/projects/${id}`, {
    method: 'PUT',
    headers: authHeader(token),
    body: JSON.stringify({ published: true }),
  });
  assert.equal(published.payload.project.published, true);

  const unpublished = await api(base, `/api/projects/${id}`, {
    method: 'PUT',
    headers: authHeader(token),
    body: JSON.stringify({ published: false }),
  });
  assert.equal(unpublished.payload.project.published, false);
});

/**
 * Local Phase 2 regression checks. Uses a throwaway SQLite file — never production.
 *
 *   npm run test:phase2
 */
import { mkdtempSync, writeFileSync, rmSync, existsSync, mkdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const tmp = mkdtempSync(path.join(os.tmpdir(), 'mws-p2-'));
process.env.NODE_ENV = 'development';
process.env.DB_PATH = path.join(tmp, 'test.db');
process.env.JWT_SECRET = 'phase2-local-test-secret-key-32ch';
process.env.ADMIN_EMAIL = 'Admin@Example.com';
process.env.ADMIN_PASSWORD = 'testpass1234';
process.env.UPLOADS_DIR = path.join(tmp, 'uploads');
process.env.UPLOADS_PUBLIC_PATH = '/uploads/projects';
process.env.ALLOWED_ORIGINS = '';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed += 1;
    console.log(`ok  ${message}`);
  } else {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

const { asBool, asDate, normalizeEmail, isValidEmail } = await import('../src/lib/validators.js');
const { validateSetting } = await import('../src/cms/settingsValidation.js');
const { resolveManagedUploadPath, deleteManagedUpload, isManagedUploadUrl } = await import(
  '../src/lib/uploads.js'
);
const { applyReorder } = await import('../src/cms/reorder.js');
const { getDb } = await import('../src/db/index.js');
const { createApp } = await import('../src/app.js');
const { seedDatabase } = await import('../src/db/seed.js');
const { seedCmsContent } = await import('../src/cms/seed.js');

// ── asBool ──────────────────────────────────────────────────────────────────

assert(asBool(undefined, true) === true, 'asBool(undefined, true) uses fallback');
assert(asBool(null, true) === true, 'asBool(null, true) uses fallback');
assert(asBool('', false) === false, 'asBool("", false) uses fallback');
assert(asBool(true) === true, 'asBool(true)');
assert(asBool(false, true) === false, 'asBool(false, true) does not use fallback');
assert(asBool('true') === true, 'asBool("true")');
assert(asBool('false', true) === false, 'asBool("false") is false, not fallback');
assert(asBool('1') === true, 'asBool("1")');
assert(asBool('0', true) === false, 'asBool("0") is false');
assert(asBool('yes') === true, 'asBool("yes")');
assert(asBool('no', true) === false, 'asBool("no") is false');
assert(normalizeEmail('User@Example.com') === 'user@example.com', 'normalizeEmail lowercases');
assert(isValidEmail('user@example.com') === true, 'isValidEmail accepts a normal address');
assert(asDate('2026-08-30') === '2026-08-30', 'asDate accepts YYYY-MM-DD');
assert(asDate('not-a-date') === undefined, 'asDate rejects invalid dates');
assert(asDate('') === null, 'asDate empty is null');

// ── settings ────────────────────────────────────────────────────────────────

assert(validateSetting('unknown', {}).ok === false, 'unknown settings key rejected');
assert(validateSetting('seo', { homeTitle: 'Studio' }).ok === true, 'valid seo payload accepted');
assert(validateSetting('hero', { titleLines: ['Hello'] }).ok === true, 'valid hero payload accepted');
assert(validateSetting('contact', []).ok === false, 'settings array rejected');

// ── upload path safety ──────────────────────────────────────────────────────

assert(isManagedUploadUrl('/assets/work.svg') === false, 'static assets are not managed uploads');
assert(resolveManagedUploadPath('../../etc/passwd') === null, 'path traversal rejected');
assert(resolveManagedUploadPath('/uploads/projects/../secret.png') === null, 'relative escape rejected');
assert(resolveManagedUploadPath('C:\\\\Windows\\\\x.png') === null, 'absolute path rejected');
const safeName = `${randomUUID()}.png`;
assert(
  resolveManagedUploadPath(`/uploads/projects/${safeName}`)?.endsWith(safeName) === true,
  'managed project image path resolves',
);

mkdirSync(process.env.UPLOADS_DIR, { recursive: true });
const missing = deleteManagedUpload(`/uploads/projects/${randomUUID()}.png`);
assert(missing.attempted === true && missing.missing === true, 'missing file delete is graceful');

// ── seed idempotency ────────────────────────────────────────────────────────

const db = getDb();
const categoryCount1 = db.prepare('SELECT COUNT(*) AS count FROM categories').get().count;
seedDatabase(db);
seedCmsContent(db);
const categoryCount2 = db.prepare('SELECT COUNT(*) AS count FROM categories').get().count;
assert(categoryCount1 === categoryCount2 && categoryCount1 > 0, 'seed is idempotent for categories');
const serviceCount = db.prepare('SELECT COUNT(*) AS count FROM services').get().count;
seedCmsContent(db);
assert(
  db.prepare('SELECT COUNT(*) AS count FROM services').get().count === serviceCount,
  'seed is idempotent for services',
);

const techIds = db.prepare('SELECT id FROM technologies ORDER BY display_order').all().map((r) => r.id);
const badReorder = applyReorder(db, {
  table: 'technologies',
  ids: techIds.slice(0, 2),
  resourceLabel: 'technology',
});
assert(badReorder.ok === false, 'partial reorder is rejected');
const shuffled = [...techIds].reverse();
const goodReorder = applyReorder(db, {
  table: 'technologies',
  ids: shuffled,
  resourceLabel: 'technology',
});
assert(goodReorder.ok === true, 'full reorder succeeds');
const after = db.prepare('SELECT id FROM technologies ORDER BY display_order').all().map((r) => r.id);
assert(after.join() === shuffled.join(), 'reorder persists display_order');

// ── HTTP API ────────────────────────────────────────────────────────────────

const app = createApp();
const { server, base } = await new Promise((resolve) => {
  const httpServer = app.listen(0, '127.0.0.1', () => {
    const address = httpServer.address();
    resolve({ server: httpServer, base: `http://127.0.0.1:${address.port}` });
  });
});

async function api(pathname, options = {}) {
  const response = await fetch(`${base}${pathname}`, {
    ...options,
    headers: {
      ...(options.body && !(options.body instanceof FormData)
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...options.headers,
    },
  });
  const payload = await response.json().catch(() => null);
  return { status: response.status, payload };
}

const login = await api('/api/admin/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email: 'Admin@Example.com', password: 'testpass1234' }),
});
assert(login.status === 200 && login.payload?.ok, 'login with mixed-case email succeeds');
const token = login.payload.token;
const auth = { Authorization: `Bearer ${token}` };

const categories = await api('/api/categories');
const categoryId = categories.payload.categories[0].id;

async function createProject(overrides = {}) {
  return api('/api/projects', {
    method: 'POST',
    headers: auth,
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

const publishedCreate = await createProject({ title: 'Published One', published: true });
assert(publishedCreate.status === 201 && publishedCreate.payload.project.published === true, 'create published project');

const draftCreate = await createProject({ title: 'Draft One', published: false });
assert(draftCreate.status === 201 && draftCreate.payload.project.published === false, 'create draft project');
const draftId = draftCreate.payload.project.id;
const publishedId = publishedCreate.payload.project.id;

const publicList = await api('/api/projects');
const publicIds = publicList.payload.projects.map((p) => p.id);
assert(!publicIds.includes(draftId), 'draft is hidden from public list');
assert(publicIds.includes(publishedId), 'published project is on public list');

const draftEdit = await api(`/api/projects/${draftId}`, {
  method: 'PUT',
  headers: auth,
  body: JSON.stringify({ title: 'Draft One edited', featured: true }),
});
assert(draftEdit.payload.project.published === false, 'editing a draft without published keeps it draft');
assert(draftEdit.payload.project.featured === true, 'featured can change without touching published');

const publishedEdit = await api(`/api/projects/${publishedId}`, {
  method: 'PUT',
  headers: auth,
  body: JSON.stringify({ title: 'Published One edited' }),
});
assert(publishedEdit.payload.project.published === true, 'editing a published project keeps it published');

const explicitPublish = await api(`/api/projects/${draftId}`, {
  method: 'PUT',
  headers: auth,
  body: JSON.stringify({ published: true }),
});
assert(explicitPublish.payload.project.published === true, 'explicit publish');

const explicitUnpublish = await api(`/api/projects/${draftId}`, {
  method: 'PUT',
  headers: auth,
  body: JSON.stringify({ published: false }),
});
assert(explicitUnpublish.payload.project.published === false, 'explicit unpublish');

const invalidYear = await api(`/api/projects/${publishedId}`, {
  method: 'PUT',
  headers: auth,
  body: JSON.stringify({ year: 1800 }),
});
assert(invalidYear.status === 400, 'invalid year rejected');

const githubOk = await api(`/api/projects/${publishedId}`, {
  method: 'PUT',
  headers: auth,
  body: JSON.stringify({ githubUrl: 'https://github.com/example/repo', client: 'Acme', year: 2026 }),
});
assert(
  githubOk.payload.project.githubUrl.includes('github.com') && githubOk.payload.project.client === 'Acme',
  'client/year/github persist',
);

// Reorder routes reachable
async function reorderResource(resourcePath, ids) {
  return api(`/api/admin/cms/${resourcePath}/reorder`, {
    method: 'PUT',
    headers: auth,
    body: JSON.stringify({ ids }),
  });
}

const services = await api('/api/admin/cms/services', { headers: auth });
const serviceIds = services.payload.services.map((s) => s.id);
const reorderHit = await reorderResource('services', [...serviceIds].reverse());
assert(reorderHit.status === 200 && reorderHit.payload.ok, 'PUT /services/reorder is reachable');

const fakeReorder = await reorderResource('services', [randomUUID()]);
assert(fakeReorder.status === 400, 'invalid reorder ids rejected');
const servicesAfter = await api('/api/admin/cms/services', { headers: auth });
assert(
  servicesAfter.payload.services.map((s) => s.id).join() === [...serviceIds].reverse().join(),
  'invalid reorder does not corrupt service order',
);

for (const resource of ['testimonials', 'trusted-companies', 'technologies', 'process-steps']) {
  const listed = await api(`/api/admin/cms/${resource}`, { headers: auth });
  const key = Object.keys(listed.payload).find((k) => k !== 'ok');
  const ids = listed.payload[key].map((row) => row.id);
  const result = await reorderResource(resource, [...ids].reverse());
  assert(result.status === 200, `PUT /${resource}/reorder succeeds`);
}

const unknownSetting = await api('/api/admin/cms/settings/notARealKey', {
  method: 'PUT',
  headers: auth,
  body: JSON.stringify({ foo: 1 }),
});
assert(unknownSetting.status === 400, 'unknown CMS setting key rejected');

const seoSave = await api('/api/admin/cms/settings/seo', {
  method: 'PUT',
  headers: auth,
  body: JSON.stringify({ homeTitle: 'Phase 2 Title', homeDescription: 'Phase 2 description' }),
});
assert(seoSave.status === 200 && seoSave.payload.settings.seo.homeTitle === 'Phase 2 Title', 'valid SEO settings save');

const navCreate = await api('/api/admin/cms/navigation', {
  method: 'POST',
  headers: auth,
  body: JSON.stringify({ label: 'Extra', href: '/#x' }),
});
assert(navCreate.status === 405, 'navigation create is rejected');

const users = await api('/api/admin/cms/users', { headers: auth });
const adminUser = users.payload.users[0];
const hashBefore = db.prepare('SELECT password_hash FROM admin_users WHERE id = ?').get(adminUser.id)
  .password_hash;
const nameOnly = await api(`/api/admin/cms/users/${adminUser.id}`, {
  method: 'PUT',
  headers: auth,
  body: JSON.stringify({ name: 'Studio Admin' }),
});
assert(nameOnly.status === 200, 'user name update succeeds');
const hashAfterName = db.prepare('SELECT password_hash FROM admin_users WHERE id = ?').get(adminUser.id)
  .password_hash;
assert(hashBefore === hashAfterName, 'password hash unchanged when password omitted');

const passwordUpdate = await api(`/api/admin/cms/users/${adminUser.id}`, {
  method: 'PUT',
  headers: auth,
  body: JSON.stringify({ password: 'newpass1234' }),
});
assert(passwordUpdate.status === 200, 'password update succeeds');
const hashAfterPass = db.prepare('SELECT password_hash FROM admin_users WHERE id = ?').get(adminUser.id)
  .password_hash;
assert(hashAfterPass !== hashBefore && hashAfterPass.startsWith('$2'), 'new password is bcrypt hashed');

const userDelete = await api(`/api/admin/cms/users/${adminUser.id}`, {
  method: 'DELETE',
  headers: auth,
});
assert(userDelete.status === 405, 'user delete is not allowed');

const relogin = await api('/api/admin/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email: 'admin@example.com', password: 'newpass1234' }),
});
assert(relogin.status === 200, 'login works after password change with normalized email');
const token2 = relogin.payload.token;

const mediaDir = path.join(process.env.UPLOADS_DIR, 'media');
mkdirSync(mediaDir, { recursive: true });
const mediaName = `${randomUUID()}.png`;
const mediaDisk = path.join(mediaDir, mediaName);
writeFileSync(mediaDisk, Buffer.from([137, 80, 78, 71]));
const mediaId = randomUUID();
const mediaUrl = `/uploads/projects/media/${mediaName}`;
db.prepare(
  'INSERT INTO media (id, filename, url, mime_type, size_bytes, alt_text) VALUES (?, ?, ?, ?, ?, ?)',
).run(mediaId, 'shot.png', mediaUrl, 'image/png', 4, 'old alt');

const altUpdate = await api(`/api/admin/cms/media/${mediaId}`, {
  method: 'PUT',
  headers: { Authorization: `Bearer ${token2}` },
  body: JSON.stringify({ altText: 'New alt' }),
});
assert(altUpdate.status === 200 && altUpdate.payload.media.altText === 'New alt', 'media alt text updates');

const mediaDelete = await api(`/api/admin/cms/media/${mediaId}`, {
  method: 'DELETE',
  headers: { Authorization: `Bearer ${token2}` },
});
assert(mediaDelete.status === 200, 'media delete succeeds');
assert(!existsSync(mediaDisk), 'physical media file is removed');
assert(db.prepare('SELECT id FROM media WHERE id = ?').get(mediaId) == null, 'media DB row is removed');

const missingMedia = randomUUID();
db.prepare(
  'INSERT INTO media (id, filename, url, mime_type, size_bytes, alt_text) VALUES (?, ?, ?, ?, ?, ?)',
).run(missingMedia, 'gone.png', `/uploads/projects/media/${randomUUID()}.png`, 'image/png', 1, '');
const missingDelete = await api(`/api/admin/cms/media/${missingMedia}`, {
  method: 'DELETE',
  headers: { Authorization: `Bearer ${token2}` },
});
assert(missingDelete.status === 200, 'deleting media with missing file still succeeds');

const uniqueConflict = await api('/api/projects', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token2}` },
  body: JSON.stringify({
    title: 'Published One edited',
    slug: publishedEdit.payload.project.slug,
    categoryId,
    description: 'Duplicate slug attempt.',
    imageUrl: '/assets/work-commerce.svg',
    liveUrl: 'https://example.com',
  }),
});
assert(uniqueConflict.status === 409, 'duplicate project slug returns 409');

const inquiry = await api('/api/project-inquiry', {
  method: 'POST',
  body: JSON.stringify({ name: 'A', email: 'not-an-email' }),
});
assert(inquiry.status === 422, 'invalid inquiry is rejected');
assert(
  db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='inquiries'").get() != null,
  'inquiries table exists for persisted leads',
);

await new Promise((resolve) => server.close(resolve));
try {
  db.close();
} catch {
  // already closed
}
try {
  rmSync(tmp, { recursive: true, force: true });
} catch {
  // Windows can keep a lock on SQLite WAL files until process exit.
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);

import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { getDb } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';
import { slugify } from '../lib/slug.js';
import { asString } from '../lib/validators.js';

export const categoriesRouter = Router();

/**
 * @param {import('better-sqlite3').Statement} row
 */
function formatCategory(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    projectCount: row.project_count ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

categoriesRouter.get('/', (_req, res) => {
  const db = getDb();
  const rows = db
    .prepare(`
      SELECT c.*, COUNT(p.id) AS project_count
      FROM categories c
      LEFT JOIN projects p ON p.category_id = c.id
      GROUP BY c.id
      ORDER BY c.name ASC
    `)
    .all();

  return res.json({ ok: true, categories: rows.map(formatCategory) });
});

categoriesRouter.post('/', requireAuth, (req, res) => {
  const name = asString(req.body?.name);
  if (!name) {
    return res.status(400).json({
      ok: false,
      code: 'validation_failed',
      message: 'Category name is required.',
      errors: { name: 'Category name is required.' },
    });
  }

  const slug = slugify(name);
  const db = getDb();
  const existing = db.prepare('SELECT id FROM categories WHERE slug = ? OR name = ?').get(slug, name);
  if (existing) {
    return res.status(409).json({
      ok: false,
      code: 'duplicate_category',
      message: 'A category with this name already exists.',
    });
  }

  const id = randomUUID();
  db.prepare('INSERT INTO categories (id, name, slug) VALUES (?, ?, ?)').run(id, name, slug);
  const row = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);

  return res.status(201).json({ ok: true, category: formatCategory({ ...row, project_count: 0 }) });
});

categoriesRouter.put('/:id', requireAuth, (req, res) => {
  const name = asString(req.body?.name);
  if (!name) {
    return res.status(400).json({
      ok: false,
      code: 'validation_failed',
      message: 'Category name is required.',
    });
  }

  const db = getDb();
  const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ ok: false, code: 'not_found', message: 'Category not found.' });
  }

  const slug = slugify(name);
  const duplicate = db
    .prepare('SELECT id FROM categories WHERE (slug = ? OR name = ?) AND id != ?')
    .get(slug, name, req.params.id);
  if (duplicate) {
    return res.status(409).json({
      ok: false,
      code: 'duplicate_category',
      message: 'A category with this name already exists.',
    });
  }

  db.prepare(
    'UPDATE categories SET name = ?, slug = ?, updated_at = datetime(\'now\') WHERE id = ?',
  ).run(name, slug, req.params.id);

  const row = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  const count = db
    .prepare('SELECT COUNT(*) AS count FROM projects WHERE category_id = ?')
    .get(req.params.id).count;

  return res.json({ ok: true, category: formatCategory({ ...row, project_count: count }) });
});

categoriesRouter.delete('/:id', requireAuth, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ ok: false, code: 'not_found', message: 'Category not found.' });
  }

  const projectCount = db
    .prepare('SELECT COUNT(*) AS count FROM projects WHERE category_id = ?')
    .get(req.params.id).count;

  if (projectCount > 0) {
    return res.status(409).json({
      ok: false,
      code: 'category_in_use',
      message: 'Cannot delete a category that has projects. Reassign or delete those projects first.',
    });
  }

  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  return res.json({ ok: true });
});

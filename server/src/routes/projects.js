import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { getDb } from '../db/index.js';
import { canViewUnpublished, optionalAuth, requireAuth, requireWrite } from '../middleware/auth.js';
import { slugify } from '../lib/slug.js';
import { deleteUnreferencedProjectImage } from '../lib/uploads.js';
import { asBool, asInt, asOptionalUrl, asString, isValidUrl, normalizeUrl } from '../lib/validators.js';

export const projectsRouter = Router();

/**
 * @param {Record<string, unknown>} row
 */
function formatProject(row) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    categoryId: row.category_id,
    category: row.category_name ?? row.category ?? '',
    description: row.description,
    technologies: row.technologies,
    imageUrl: row.image_url,
    liveUrl: row.live_url,
    featured: Boolean(row.featured),
    published: Boolean(row.published),
    client: row.client ?? '',
    year: row.year ?? null,
    githubUrl: row.github_url ?? '',
    seoTitle: row.seo_title ?? '',
    seoDescription: row.seo_description ?? '',
    seoOgImage: row.seo_og_image ?? '',
    previewObjectPosition: row.preview_object_position ?? 'center',
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const PROJECT_SELECT = `
  SELECT p.*, c.name AS category_name
  FROM projects p
  JOIN categories c ON c.id = p.category_id
`;

/**
 * @param {Record<string, unknown>} body
 * @param {boolean} isUpdate
 */
function validateProjectBody(body, isUpdate = false) {
  const errors = {};
  const title = asString(body.title);
  const categoryId = asString(body.categoryId);
  const description = asString(body.description);
  const imageUrl = asString(body.imageUrl);
  const liveUrlRaw = asString(body.liveUrl);
  const slug = asString(body.slug) || (title ? slugify(title) : '');
  const featured = asBool(body.featured);
  const published = asBool(body.published, true);
  const displayOrder = asInt(body.displayOrder, 0);
  const client = asString(body.client).slice(0, 160);
  const technologiesValue = asString(body.technologies).slice(0, 500);
  const githubRaw = asString(body.githubUrl);
  const githubUrl = githubRaw ? asOptionalUrl(body.githubUrl) : '';
  const seoTitle = asString(body.seoTitle).slice(0, 80);
  const seoDescription = asString(body.seoDescription).slice(0, 320);
  const seoOgImage = asString(body.seoOgImage).slice(0, 500);
  const previewObjectPosition = asString(body.previewObjectPosition).slice(0, 80) || 'center';

  let year = null;
  if (body.year !== undefined && body.year !== null && body.year !== '') {
    const parsedYear = asInt(body.year, Number.NaN);
    if (!Number.isFinite(parsedYear) || parsedYear < 1990 || parsedYear > 2100) {
      errors.year = 'Enter a year between 1990 and 2100.';
    } else {
      year = parsedYear;
    }
  }

  if (!isUpdate || body.title !== undefined) {
    if (!title) errors.title = 'Project title is required.';
  }
  if (!isUpdate || body.categoryId !== undefined) {
    if (!categoryId) errors.categoryId = 'Category is required.';
  }
  if (!isUpdate || body.description !== undefined) {
    if (!description) errors.description = 'Description is required.';
  }
  if (!isUpdate || body.imageUrl !== undefined) {
    if (!imageUrl) errors.imageUrl = 'Project image is required.';
  }
  if (!isUpdate || body.liveUrl !== undefined) {
    if (!liveUrlRaw) errors.liveUrl = 'Live preview URL is required.';
    else if (!isValidUrl(liveUrlRaw)) errors.liveUrl = 'Enter a valid URL (https://...).';
  }

  const liveUrl = liveUrlRaw ? normalizeUrl(liveUrlRaw) : null;

  if (githubRaw && githubUrl === null) {
    errors.githubUrl = 'Enter a valid URL (https://...).';
  }

  return {
    errors,
    data: {
      title,
      slug,
      categoryId,
      description,
      technologies: technologiesValue,
      imageUrl,
      liveUrl,
      featured,
      published,
      displayOrder,
      client,
      year,
      githubUrl: githubUrl || '',
      seoTitle,
      seoDescription,
      seoOgImage,
      previewObjectPosition,
    },
  };
}

projectsRouter.get('/', optionalAuth, (req, res) => {
  const db = getDb();
  const featuredOnly = req.query.featured === 'true' || req.query.featured === '1';
  const categoryId = asString(req.query.categoryId);
  const includeUnpublished =
    canViewUnpublished(req) &&
    (req.query.includeUnpublished === 'true' || req.query.includeUnpublished === '1');

  let query = PROJECT_SELECT + ' WHERE 1=1';
  const params = [];

  if (!includeUnpublished) {
    query += ' AND p.published = 1';
  }
  if (featuredOnly) {
    query += ' AND p.featured = 1';
  }
  if (categoryId) {
    query += ' AND p.category_id = ?';
    params.push(categoryId);
  }

  query += ' ORDER BY p.display_order ASC, p.created_at DESC';

  const rows = db.prepare(query).all(...params);
  return res.json({ ok: true, projects: rows.map(formatProject) });
});

projectsRouter.get('/:id', optionalAuth, (req, res) => {
  const db = getDb();
  const row = db.prepare(PROJECT_SELECT + ' WHERE p.id = ?').get(req.params.id);
  if (!row || (!row.published && !canViewUnpublished(req))) {
    return res.status(404).json({ ok: false, code: 'not_found', message: 'Project not found.' });
  }
  return res.json({ ok: true, project: formatProject(row) });
});

projectsRouter.post('/', requireAuth, requireWrite, (req, res) => {
  const { errors, data } = validateProjectBody(req.body);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      ok: false,
      code: 'validation_failed',
      message: 'Please fix the highlighted fields.',
      errors,
    });
  }

  const db = getDb();
  const category = db.prepare('SELECT id FROM categories WHERE id = ?').get(data.categoryId);
  if (!category) {
    return res.status(400).json({
      ok: false,
      code: 'validation_failed',
      message: 'Selected category does not exist.',
      errors: { categoryId: 'Selected category does not exist.' },
    });
  }

  const slugExists = db.prepare('SELECT id FROM projects WHERE slug = ?').get(data.slug);
  if (slugExists) {
    return res.status(409).json({
      ok: false,
      code: 'duplicate_slug',
      message: 'A project with this slug already exists.',
      errors: { slug: 'This slug is already in use.' },
    });
  }

  const id = randomUUID();
  db.prepare(`
    INSERT INTO projects (
      id, title, slug, category_id, description, technologies,
      image_url, live_url, featured, published, display_order,
      client, year, github_url, seo_title, seo_description, seo_og_image, preview_object_position
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.title,
    data.slug,
    data.categoryId,
    data.description,
    data.technologies,
    data.imageUrl,
    data.liveUrl,
    data.featured ? 1 : 0,
    data.published ? 1 : 0,
    data.displayOrder,
    data.client,
    data.year,
    data.githubUrl,
    data.seoTitle,
    data.seoDescription,
    data.seoOgImage,
    data.previewObjectPosition,
  );

  const row = db.prepare(PROJECT_SELECT + ' WHERE p.id = ?').get(id);
  return res.status(201).json({ ok: true, project: formatProject(row) });
});

projectsRouter.put('/:id', requireAuth, requireWrite, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ ok: false, code: 'not_found', message: 'Project not found.' });
  }

  const { errors, data } = validateProjectBody(req.body, true);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      ok: false,
      code: 'validation_failed',
      message: 'Please fix the highlighted fields.',
      errors,
    });
  }

  const title = data.title || existing.title;
  const slug = data.slug || slugify(title);
  const categoryId = data.categoryId || existing.category_id;
  const description = data.description || existing.description;
  const technologies = req.body.technologies !== undefined ? data.technologies : existing.technologies;
  const imageUrl = data.imageUrl || existing.image_url;
  const liveUrl = data.liveUrl || existing.live_url;
  const featured = req.body.featured !== undefined ? data.featured : Boolean(existing.featured);
  const published = req.body.published !== undefined ? data.published : Boolean(existing.published);
  const displayOrder =
    req.body.displayOrder !== undefined ? data.displayOrder : existing.display_order;
  const client = req.body.client !== undefined ? data.client : (existing.client ?? '');
  const year = req.body.year !== undefined ? data.year : existing.year;
  const githubUrl = req.body.githubUrl !== undefined ? data.githubUrl : (existing.github_url ?? '');
  const seoTitle = req.body.seoTitle !== undefined ? data.seoTitle : (existing.seo_title ?? '');
  const seoDescription = req.body.seoDescription !== undefined ? data.seoDescription : (existing.seo_description ?? '');
  const seoOgImage = req.body.seoOgImage !== undefined ? data.seoOgImage : (existing.seo_og_image ?? '');
  const previewObjectPosition = req.body.previewObjectPosition !== undefined ? data.previewObjectPosition : (existing.preview_object_position ?? 'center');

  const category = db.prepare('SELECT id FROM categories WHERE id = ?').get(categoryId);
  if (!category) {
    return res.status(400).json({
      ok: false,
      code: 'validation_failed',
      message: 'Selected category does not exist.',
      errors: { categoryId: 'Selected category does not exist.' },
    });
  }

  const slugConflict = db
    .prepare('SELECT id FROM projects WHERE slug = ? AND id != ?')
    .get(slug, req.params.id);
  if (slugConflict) {
    return res.status(409).json({
      ok: false,
      code: 'duplicate_slug',
      message: 'A project with this slug already exists.',
    });
  }

  db.prepare(`
    UPDATE projects SET
      title = ?, slug = ?, category_id = ?, description = ?, technologies = ?,
      image_url = ?, live_url = ?, featured = ?, published = ?, display_order = ?,
      client = ?, year = ?, github_url = ?, seo_title = ?, seo_description = ?,
      seo_og_image = ?, preview_object_position = ?,
      updated_at = datetime('now')
    WHERE id = ?
  `).run(
    title,
    slug,
    categoryId,
    description,
    technologies,
    imageUrl,
    liveUrl,
    featured ? 1 : 0,
    published ? 1 : 0,
    displayOrder,
    client,
    year,
    githubUrl,
    seoTitle,
    seoDescription,
    seoOgImage,
    previewObjectPosition,
    req.params.id,
  );

  if (imageUrl !== existing.image_url) {
    deleteUnreferencedProjectImage(db, existing.image_url, req.params.id);
  }

  const row = db.prepare(PROJECT_SELECT + ' WHERE p.id = ?').get(req.params.id);
  return res.json({ ok: true, project: formatProject(row) });
});

projectsRouter.delete('/:id', requireAuth, requireWrite, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT id, image_url FROM projects WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ ok: false, code: 'not_found', message: 'Project not found.' });
  }

  db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
  deleteUnreferencedProjectImage(db, existing.image_url);
  return res.json({ ok: true });
});

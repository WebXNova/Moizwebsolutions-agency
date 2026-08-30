import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { getDb } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';
import { getAllSettings, getSetting, setSetting } from '../cms/seed.js';
import { logActivity, getClientIp } from '../cms/activity.js';
import { slugify } from '../lib/slug.js';
import { asBool, asInt, asString, isValidUrl, normalizeUrl } from '../lib/validators.js';
import {
  formatActivityLog,
  formatMedia,
  formatNavigationItem,
  formatProcessStep,
  formatService,
  formatSocialLink,
  formatTechnology,
  formatTestimonial,
  formatTrustedCompany,
  formatWebsiteUpdate,
} from '../cms/formatters.js';

export const cmsRouter = Router();
cmsRouter.use(requireAuth);

const SERVICE_ICONS = ['design', 'development', 'marketing', 'graphic'];
const PROCESS_ICONS = ['discovery', 'iterate', 'agile', 'launch'];

function audit(req, action, resourceType, resourceId, details = '') {
  logActivity({
    admin: req.admin,
    action,
    resourceType,
    resourceId,
    details,
    ip: getClientIp(req),
  });
}

// ─── Settings ───────────────────────────────────────────────────────────────

cmsRouter.get('/settings', (_req, res) => {
  const db = getDb();
  return res.json({ ok: true, settings: getAllSettings(db) });
});

cmsRouter.put('/settings/:key', (req, res) => {
  const key = asString(req.params.key);
  if (!key) return res.status(400).json({ ok: false, message: 'Invalid setting key.' });
  setSetting(getDb(), key, req.body);
  audit(req, 'updated_setting', 'setting', key);
  return res.json({ ok: true, settings: getAllSettings(getDb()) });
});

cmsRouter.get('/hero', (_req, res) => {
  return res.json({ ok: true, hero: getSetting(getDb(), 'hero') });
});

cmsRouter.put('/hero', (req, res) => {
  setSetting(getDb(), 'hero', req.body);
  audit(req, 'updated_hero', 'hero', 'hero');
  return res.json({ ok: true, hero: getSetting(getDb(), 'hero') });
});

// ─── Services ───────────────────────────────────────────────────────────────

cmsRouter.get('/services', (req, res) => {
  const db = getDb();
  const activeOnly = req.query.active === 'true';
  let query = 'SELECT * FROM services';
  if (activeOnly) query += ' WHERE active = 1';
  query += ' ORDER BY display_order ASC, created_at ASC';
  return res.json({ ok: true, services: db.prepare(query).all().map(formatService) });
});

cmsRouter.post('/services', (req, res) => {
  const db = getDb();
  const title = asString(req.body.title);
  const slug = asString(req.body.slug) || slugify(title);
  if (!title) return res.status(400).json({ ok: false, message: 'Title is required.' });
  const icon = asString(req.body.icon) || 'design';
  if (!SERVICE_ICONS.includes(icon)) {
    return res.status(400).json({ ok: false, message: 'Invalid icon.' });
  }
  const id = randomUUID();
  db.prepare(`
    INSERT INTO services (id, slug, icon, label, title, description, details_json, cta_text, cta_url, category_label, active, featured, display_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, slug, icon,
    asString(req.body.label) || title,
    title,
    asString(req.body.description),
    JSON.stringify(req.body.details || []),
    asString(req.body.ctaText),
    asString(req.body.ctaUrl),
    asString(req.body.categoryLabel),
    asBool(req.body.active, true) ? 1 : 0,
    asBool(req.body.featured) ? 1 : 0,
    asInt(req.body.displayOrder, 0),
  );
  audit(req, 'created_service', 'service', id, title);
  const row = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
  return res.status(201).json({ ok: true, service: formatService(row) });
});

cmsRouter.put('/services/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ ok: false, message: 'Service not found.' });
  const icon = req.body.icon !== undefined ? asString(req.body.icon) : existing.icon;
  if (!SERVICE_ICONS.includes(icon)) {
    return res.status(400).json({ ok: false, message: 'Invalid icon.' });
  }
  const title = asString(req.body.title) || existing.title;
  const slug = asString(req.body.slug) || existing.slug;
  db.prepare(`
    UPDATE services SET slug=?, icon=?, label=?, title=?, description=?, details_json=?,
    cta_text=?, cta_url=?, category_label=?, active=?, featured=?, display_order=?,
    updated_at=datetime('now') WHERE id=?
  `).run(
    slug, icon,
    asString(req.body.label) || existing.label,
    title,
    req.body.description !== undefined ? asString(req.body.description) : existing.description,
    req.body.details !== undefined ? JSON.stringify(req.body.details) : existing.details_json,
    req.body.ctaText !== undefined ? asString(req.body.ctaText) : existing.cta_text,
    req.body.ctaUrl !== undefined ? asString(req.body.ctaUrl) : existing.cta_url,
    req.body.categoryLabel !== undefined ? asString(req.body.categoryLabel) : existing.category_label,
    req.body.active !== undefined ? (asBool(req.body.active) ? 1 : 0) : existing.active,
    req.body.featured !== undefined ? (asBool(req.body.featured) ? 1 : 0) : existing.featured,
    req.body.displayOrder !== undefined ? asInt(req.body.displayOrder, existing.display_order) : existing.display_order,
    req.params.id,
  );
  audit(req, 'updated_service', 'service', req.params.id);
  const row = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
  return res.json({ ok: true, service: formatService(row) });
});

cmsRouter.delete('/services/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM services WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ ok: false, message: 'Service not found.' });
  db.prepare('DELETE FROM services WHERE id = ?').run(req.params.id);
  audit(req, 'deleted_service', 'service', req.params.id);
  return res.json({ ok: true });
});

cmsRouter.put('/services/reorder', (req, res) => {
  const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
  const db = getDb();
  const update = db.prepare('UPDATE services SET display_order = ?, updated_at = datetime(\'now\') WHERE id = ?');
  ids.forEach((id, index) => update.run(index + 1, id));
  audit(req, 'reordered_services', 'service', '', `${ids.length} items`);
  return res.json({ ok: true });
});

// ─── Testimonials ───────────────────────────────────────────────────────────

cmsRouter.get('/testimonials', (_req, res) => {
  const rows = getDb().prepare('SELECT * FROM testimonials ORDER BY display_order ASC').all();
  return res.json({ ok: true, testimonials: rows.map(formatTestimonial) });
});

cmsRouter.post('/testimonials', (req, res) => {
  const quote = asString(req.body.quote);
  const author = asString(req.body.author);
  if (!quote || !author) return res.status(400).json({ ok: false, message: 'Quote and author are required.' });
  const id = randomUUID();
  getDb().prepare(`
    INSERT INTO testimonials (id, quote, author, role, company, avatar_url, verified, featured, published, display_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, quote, author,
    asString(req.body.role), asString(req.body.company), asString(req.body.avatarUrl),
    asBool(req.body.verified) ? 1 : 0, asBool(req.body.featured) ? 1 : 0,
    asBool(req.body.published, true) ? 1 : 0, asInt(req.body.displayOrder, 0),
  );
  audit(req, 'created_testimonial', 'testimonial', id);
  const row = getDb().prepare('SELECT * FROM testimonials WHERE id = ?').get(id);
  return res.status(201).json({ ok: true, testimonial: formatTestimonial(row) });
});

cmsRouter.put('/testimonials/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ ok: false, message: 'Testimonial not found.' });
  db.prepare(`
    UPDATE testimonials SET quote=?, author=?, role=?, company=?, avatar_url=?,
    verified=?, featured=?, published=?, display_order=?, updated_at=datetime('now') WHERE id=?
  `).run(
    asString(req.body.quote) || existing.quote,
    asString(req.body.author) || existing.author,
    req.body.role !== undefined ? asString(req.body.role) : existing.role,
    req.body.company !== undefined ? asString(req.body.company) : existing.company,
    req.body.avatarUrl !== undefined ? asString(req.body.avatarUrl) : existing.avatar_url,
    req.body.verified !== undefined ? (asBool(req.body.verified) ? 1 : 0) : existing.verified,
    req.body.featured !== undefined ? (asBool(req.body.featured) ? 1 : 0) : existing.featured,
    req.body.published !== undefined ? (asBool(req.body.published) ? 1 : 0) : existing.published,
    req.body.displayOrder !== undefined ? asInt(req.body.displayOrder, existing.display_order) : existing.display_order,
    req.params.id,
  );
  audit(req, 'updated_testimonial', 'testimonial', req.params.id);
  const row = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(req.params.id);
  return res.json({ ok: true, testimonial: formatTestimonial(row) });
});

cmsRouter.delete('/testimonials/:id', (req, res) => {
  const db = getDb();
  if (!db.prepare('SELECT id FROM testimonials WHERE id = ?').get(req.params.id)) {
    return res.status(404).json({ ok: false, message: 'Testimonial not found.' });
  }
  db.prepare('DELETE FROM testimonials WHERE id = ?').run(req.params.id);
  audit(req, 'deleted_testimonial', 'testimonial', req.params.id);
  return res.json({ ok: true });
});

cmsRouter.put('/testimonials/reorder', (req, res) => {
  const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
  const update = getDb().prepare('UPDATE testimonials SET display_order = ? WHERE id = ?');
  ids.forEach((id, index) => update.run(index + 1, id));
  audit(req, 'reordered_testimonials', 'testimonial');
  return res.json({ ok: true });
});

// ─── Trusted Companies ──────────────────────────────────────────────────────

cmsRouter.get('/trusted-companies', (_req, res) => {
  const rows = getDb().prepare('SELECT * FROM trusted_companies ORDER BY display_order ASC').all();
  return res.json({ ok: true, companies: rows.map(formatTrustedCompany) });
});

cmsRouter.post('/trusted-companies', (req, res) => {
  const name = asString(req.body.name);
  if (!name) return res.status(400).json({ ok: false, message: 'Company name is required.' });
  const id = randomUUID();
  getDb().prepare(`
    INSERT INTO trusted_companies (id, name, logo_url, website_url, logo_alt, active, display_order)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, name, asString(req.body.logoUrl), asString(req.body.websiteUrl),
    asString(req.body.logoAlt) || name, asBool(req.body.active, true) ? 1 : 0, asInt(req.body.displayOrder, 0),
  );
  audit(req, 'created_company', 'trusted_company', id, name);
  const row = getDb().prepare('SELECT * FROM trusted_companies WHERE id = ?').get(id);
  return res.status(201).json({ ok: true, company: formatTrustedCompany(row) });
});

cmsRouter.put('/trusted-companies/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM trusted_companies WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ ok: false, message: 'Company not found.' });
  const websiteUrl = req.body.websiteUrl !== undefined ? asString(req.body.websiteUrl) : existing.website_url;
  if (websiteUrl && !isValidUrl(websiteUrl)) {
    return res.status(400).json({ ok: false, message: 'Invalid website URL.' });
  }
  db.prepare(`
    UPDATE trusted_companies SET name=?, logo_url=?, website_url=?, logo_alt=?, active=?, display_order=?, updated_at=datetime('now') WHERE id=?
  `).run(
    asString(req.body.name) || existing.name,
    req.body.logoUrl !== undefined ? asString(req.body.logoUrl) : existing.logo_url,
    websiteUrl, req.body.logoAlt !== undefined ? asString(req.body.logoAlt) : existing.logo_alt,
    req.body.active !== undefined ? (asBool(req.body.active) ? 1 : 0) : existing.active,
    req.body.displayOrder !== undefined ? asInt(req.body.displayOrder, existing.display_order) : existing.display_order,
    req.params.id,
  );
  audit(req, 'updated_company', 'trusted_company', req.params.id);
  const row = db.prepare('SELECT * FROM trusted_companies WHERE id = ?').get(req.params.id);
  return res.json({ ok: true, company: formatTrustedCompany(row) });
});

cmsRouter.delete('/trusted-companies/:id', (req, res) => {
  const db = getDb();
  if (!db.prepare('SELECT id FROM trusted_companies WHERE id = ?').get(req.params.id)) {
    return res.status(404).json({ ok: false, message: 'Company not found.' });
  }
  db.prepare('DELETE FROM trusted_companies WHERE id = ?').run(req.params.id);
  audit(req, 'deleted_company', 'trusted_company', req.params.id);
  return res.json({ ok: true });
});

cmsRouter.put('/trusted-companies/reorder', (req, res) => {
  const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
  const update = getDb().prepare('UPDATE trusted_companies SET display_order = ? WHERE id = ?');
  ids.forEach((id, index) => update.run(index + 1, id));
  audit(req, 'reordered_companies', 'trusted_company');
  return res.json({ ok: true });
});

// ─── Technologies ───────────────────────────────────────────────────────────

cmsRouter.get('/technologies', (_req, res) => {
  const rows = getDb().prepare('SELECT * FROM technologies ORDER BY display_order ASC').all();
  return res.json({ ok: true, technologies: rows.map(formatTechnology) });
});

cmsRouter.post('/technologies', (req, res) => {
  const name = asString(req.body.name);
  if (!name) return res.status(400).json({ ok: false, message: 'Name is required.' });
  const slug = asString(req.body.slug) || slugify(name);
  const id = randomUUID();
  getDb().prepare(`
    INSERT INTO technologies (id, slug, name, category, logo_url, color, invert_on_dark, active, featured, display_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, slug, name, asString(req.body.category), asString(req.body.logoUrl),
    asString(req.body.color), asBool(req.body.invertOnDark) ? 1 : 0,
    asBool(req.body.active, true) ? 1 : 0, asBool(req.body.featured) ? 1 : 0, asInt(req.body.displayOrder, 0),
  );
  audit(req, 'created_technology', 'technology', id, name);
  const row = getDb().prepare('SELECT * FROM technologies WHERE id = ?').get(id);
  return res.status(201).json({ ok: true, technology: formatTechnology(row) });
});

cmsRouter.put('/technologies/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM technologies WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ ok: false, message: 'Technology not found.' });
  db.prepare(`
    UPDATE technologies SET slug=?, name=?, category=?, logo_url=?, color=?, invert_on_dark=?,
    active=?, featured=?, display_order=?, updated_at=datetime('now') WHERE id=?
  `).run(
    req.body.slug !== undefined ? asString(req.body.slug) : existing.slug,
    asString(req.body.name) || existing.name,
    req.body.category !== undefined ? asString(req.body.category) : existing.category,
    req.body.logoUrl !== undefined ? asString(req.body.logoUrl) : existing.logo_url,
    req.body.color !== undefined ? asString(req.body.color) : existing.color,
    req.body.invertOnDark !== undefined ? (asBool(req.body.invertOnDark) ? 1 : 0) : existing.invert_on_dark,
    req.body.active !== undefined ? (asBool(req.body.active) ? 1 : 0) : existing.active,
    req.body.featured !== undefined ? (asBool(req.body.featured) ? 1 : 0) : existing.featured,
    req.body.displayOrder !== undefined ? asInt(req.body.displayOrder, existing.display_order) : existing.display_order,
    req.params.id,
  );
  audit(req, 'updated_technology', 'technology', req.params.id);
  const row = db.prepare('SELECT * FROM technologies WHERE id = ?').get(req.params.id);
  return res.json({ ok: true, technology: formatTechnology(row) });
});

cmsRouter.delete('/technologies/:id', (req, res) => {
  const db = getDb();
  if (!db.prepare('SELECT id FROM technologies WHERE id = ?').get(req.params.id)) {
    return res.status(404).json({ ok: false, message: 'Technology not found.' });
  }
  db.prepare('DELETE FROM technologies WHERE id = ?').run(req.params.id);
  audit(req, 'deleted_technology', 'technology', req.params.id);
  return res.json({ ok: true });
});

cmsRouter.put('/technologies/reorder', (req, res) => {
  const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
  const update = getDb().prepare('UPDATE technologies SET display_order = ? WHERE id = ?');
  ids.forEach((id, index) => update.run(index + 1, id));
  audit(req, 'reordered_technologies', 'technology');
  return res.json({ ok: true });
});

// ─── Process Steps ──────────────────────────────────────────────────────────

cmsRouter.get('/process-steps', (_req, res) => {
  const rows = getDb().prepare('SELECT * FROM process_steps ORDER BY display_order ASC').all();
  return res.json({ ok: true, steps: rows.map(formatProcessStep) });
});

cmsRouter.post('/process-steps', (req, res) => {
  const title = asString(req.body.title);
  if (!title) return res.status(400).json({ ok: false, message: 'Title is required.' });
  const icon = asString(req.body.icon) || 'discovery';
  if (!PROCESS_ICONS.includes(icon)) return res.status(400).json({ ok: false, message: 'Invalid icon.' });
  const id = randomUUID();
  getDb().prepare(`
    INSERT INTO process_steps (id, step_number, title, description, icon, active, display_order)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, asInt(req.body.stepNumber, 1), title, asString(req.body.description), icon,
    asBool(req.body.active, true) ? 1 : 0, asInt(req.body.displayOrder, 0),
  );
  audit(req, 'created_process_step', 'process_step', id);
  const row = getDb().prepare('SELECT * FROM process_steps WHERE id = ?').get(id);
  return res.status(201).json({ ok: true, step: formatProcessStep(row) });
});

cmsRouter.put('/process-steps/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM process_steps WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ ok: false, message: 'Process step not found.' });
  const icon = req.body.icon !== undefined ? asString(req.body.icon) : existing.icon;
  if (!PROCESS_ICONS.includes(icon)) return res.status(400).json({ ok: false, message: 'Invalid icon.' });
  db.prepare(`
    UPDATE process_steps SET step_number=?, title=?, description=?, icon=?, active=?, display_order=?, updated_at=datetime('now') WHERE id=?
  `).run(
    req.body.stepNumber !== undefined ? asInt(req.body.stepNumber, existing.step_number) : existing.step_number,
    asString(req.body.title) || existing.title,
    req.body.description !== undefined ? asString(req.body.description) : existing.description,
    icon,
    req.body.active !== undefined ? (asBool(req.body.active) ? 1 : 0) : existing.active,
    req.body.displayOrder !== undefined ? asInt(req.body.displayOrder, existing.display_order) : existing.display_order,
    req.params.id,
  );
  audit(req, 'updated_process_step', 'process_step', req.params.id);
  const row = db.prepare('SELECT * FROM process_steps WHERE id = ?').get(req.params.id);
  return res.json({ ok: true, step: formatProcessStep(row) });
});

cmsRouter.delete('/process-steps/:id', (req, res) => {
  const db = getDb();
  if (!db.prepare('SELECT id FROM process_steps WHERE id = ?').get(req.params.id)) {
    return res.status(404).json({ ok: false, message: 'Process step not found.' });
  }
  db.prepare('DELETE FROM process_steps WHERE id = ?').run(req.params.id);
  audit(req, 'deleted_process_step', 'process_step', req.params.id);
  return res.json({ ok: true });
});

cmsRouter.put('/process-steps/reorder', (req, res) => {
  const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
  const update = getDb().prepare('UPDATE process_steps SET display_order = ? WHERE id = ?');
  ids.forEach((id, index) => update.run(index + 1, id));
  audit(req, 'reordered_process_steps', 'process_step');
  return res.json({ ok: true });
});

// ─── Website Updates ────────────────────────────────────────────────────────

cmsRouter.get('/updates', (_req, res) => {
  const rows = getDb().prepare('SELECT * FROM website_updates ORDER BY display_order ASC, created_at DESC').all();
  return res.json({ ok: true, updates: rows.map(formatWebsiteUpdate) });
});

cmsRouter.post('/updates', (req, res) => {
  const title = asString(req.body.title);
  if (!title) return res.status(400).json({ ok: false, message: 'Title is required.' });
  const ctaUrl = asString(req.body.ctaUrl);
  if (ctaUrl && !isValidUrl(ctaUrl)) return res.status(400).json({ ok: false, message: 'Invalid CTA URL.' });
  const id = randomUUID();
  getDb().prepare(`
    INSERT INTO website_updates (id, title, short_description, full_description, image_url, category, cta_text, cta_url, published, featured, start_date, end_date, display_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, title, asString(req.body.shortDescription), asString(req.body.fullDescription),
    asString(req.body.imageUrl), asString(req.body.category) || 'announcement',
    asString(req.body.ctaText), ctaUrl ? normalizeUrl(ctaUrl) : '',
    asBool(req.body.published) ? 1 : 0, asBool(req.body.featured) ? 1 : 0,
    asString(req.body.startDate) || null, asString(req.body.endDate) || null, asInt(req.body.displayOrder, 0),
  );
  audit(req, 'created_update', 'website_update', id, title);
  const row = getDb().prepare('SELECT * FROM website_updates WHERE id = ?').get(id);
  return res.status(201).json({ ok: true, update: formatWebsiteUpdate(row) });
});

cmsRouter.put('/updates/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM website_updates WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ ok: false, message: 'Update not found.' });
  const ctaUrl = req.body.ctaUrl !== undefined ? asString(req.body.ctaUrl) : existing.cta_url;
  if (ctaUrl && !isValidUrl(ctaUrl)) return res.status(400).json({ ok: false, message: 'Invalid CTA URL.' });
  db.prepare(`
    UPDATE website_updates SET title=?, short_description=?, full_description=?, image_url=?, category=?,
    cta_text=?, cta_url=?, published=?, featured=?, start_date=?, end_date=?, display_order=?, updated_at=datetime('now') WHERE id=?
  `).run(
    asString(req.body.title) || existing.title,
    req.body.shortDescription !== undefined ? asString(req.body.shortDescription) : existing.short_description,
    req.body.fullDescription !== undefined ? asString(req.body.fullDescription) : existing.full_description,
    req.body.imageUrl !== undefined ? asString(req.body.imageUrl) : existing.image_url,
    req.body.category !== undefined ? asString(req.body.category) : existing.category,
    req.body.ctaText !== undefined ? asString(req.body.ctaText) : existing.cta_text,
    ctaUrl ? normalizeUrl(ctaUrl) : '',
    req.body.published !== undefined ? (asBool(req.body.published) ? 1 : 0) : existing.published,
    req.body.featured !== undefined ? (asBool(req.body.featured) ? 1 : 0) : existing.featured,
    req.body.startDate !== undefined ? (asString(req.body.startDate) || null) : existing.start_date,
    req.body.endDate !== undefined ? (asString(req.body.endDate) || null) : existing.end_date,
    req.body.displayOrder !== undefined ? asInt(req.body.displayOrder, existing.display_order) : existing.display_order,
    req.params.id,
  );
  audit(req, 'updated_update', 'website_update', req.params.id);
  const row = db.prepare('SELECT * FROM website_updates WHERE id = ?').get(req.params.id);
  return res.json({ ok: true, update: formatWebsiteUpdate(row) });
});

cmsRouter.delete('/updates/:id', (req, res) => {
  const db = getDb();
  if (!db.prepare('SELECT id FROM website_updates WHERE id = ?').get(req.params.id)) {
    return res.status(404).json({ ok: false, message: 'Update not found.' });
  }
  db.prepare('DELETE FROM website_updates WHERE id = ?').run(req.params.id);
  audit(req, 'deleted_update', 'website_update', req.params.id);
  return res.json({ ok: true });
});

// ─── Social Links ───────────────────────────────────────────────────────────

cmsRouter.get('/social-links', (_req, res) => {
  const rows = getDb().prepare('SELECT * FROM social_links ORDER BY display_order ASC').all();
  return res.json({ ok: true, socialLinks: rows.map(formatSocialLink) });
});

cmsRouter.post('/social-links', (req, res) => {
  const platform = asString(req.body.platform);
  const href = asString(req.body.href);
  if (!platform) return res.status(400).json({ ok: false, message: 'Platform is required.' });
  if (href && !isValidUrl(href)) return res.status(400).json({ ok: false, message: 'Invalid URL.' });
  const id = randomUUID();
  getDb().prepare(`
    INSERT INTO social_links (id, platform, href, label, icon, active, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, platform, href ? normalizeUrl(href) : '', asString(req.body.label) || platform, asString(req.body.icon) || platform, asBool(req.body.active, true) ? 1 : 0, asInt(req.body.displayOrder, 0));
  audit(req, 'created_social_link', 'social_link', id);
  const row = getDb().prepare('SELECT * FROM social_links WHERE id = ?').get(id);
  return res.status(201).json({ ok: true, socialLink: formatSocialLink(row) });
});

cmsRouter.put('/social-links/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM social_links WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ ok: false, message: 'Social link not found.' });
  const href = req.body.href !== undefined ? asString(req.body.href) : existing.href;
  if (href && !isValidUrl(href)) return res.status(400).json({ ok: false, message: 'Invalid URL.' });
  db.prepare(`
    UPDATE social_links SET platform=?, href=?, label=?, icon=?, active=?, display_order=?, updated_at=datetime('now') WHERE id=?
  `).run(
    asString(req.body.platform) || existing.platform,
    href ? normalizeUrl(href) : '',
    req.body.label !== undefined ? asString(req.body.label) : existing.label,
    req.body.icon !== undefined ? asString(req.body.icon) : existing.icon,
    req.body.active !== undefined ? (asBool(req.body.active) ? 1 : 0) : existing.active,
    req.body.displayOrder !== undefined ? asInt(req.body.displayOrder, existing.display_order) : existing.display_order,
    req.params.id,
  );
  audit(req, 'updated_social_link', 'social_link', req.params.id);
  const row = db.prepare('SELECT * FROM social_links WHERE id = ?').get(req.params.id);
  return res.json({ ok: true, socialLink: formatSocialLink(row) });
});

cmsRouter.delete('/social-links/:id', (req, res) => {
  const db = getDb();
  if (!db.prepare('SELECT id FROM social_links WHERE id = ?').get(req.params.id)) {
    return res.status(404).json({ ok: false, message: 'Social link not found.' });
  }
  db.prepare('DELETE FROM social_links WHERE id = ?').run(req.params.id);
  audit(req, 'deleted_social_link', 'social_link', req.params.id);
  return res.json({ ok: true });
});

// ─── Navigation ─────────────────────────────────────────────────────────────

cmsRouter.get('/navigation', (_req, res) => {
  const rows = getDb().prepare('SELECT * FROM navigation_items ORDER BY display_order ASC').all();
  return res.json({ ok: true, navigation: rows.map(formatNavigationItem) });
});

cmsRouter.put('/navigation/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM navigation_items WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ ok: false, message: 'Navigation item not found.' });
  db.prepare(`
    UPDATE navigation_items SET label=?, href=?, active=?, display_order=?, updated_at=datetime('now') WHERE id=?
  `).run(
    asString(req.body.label) || existing.label,
    asString(req.body.href) || existing.href,
    req.body.active !== undefined ? (asBool(req.body.active) ? 1 : 0) : existing.active,
    req.body.displayOrder !== undefined ? asInt(req.body.displayOrder, existing.display_order) : existing.display_order,
    req.params.id,
  );
  audit(req, 'updated_navigation', 'navigation', req.params.id);
  const row = db.prepare('SELECT * FROM navigation_items WHERE id = ?').get(req.params.id);
  return res.json({ ok: true, item: formatNavigationItem(row) });
});

// ─── Media ──────────────────────────────────────────────────────────────────

cmsRouter.get('/media', (req, res) => {
  const db = getDb();
  const search = asString(req.query.search).toLowerCase();
  const page = Math.max(1, asInt(req.query.page, 1));
  const limit = Math.min(100, Math.max(1, asInt(req.query.limit, 24)));
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM media';
  const params = [];
  if (search) {
    query += ' WHERE lower(filename) LIKE ? OR lower(alt_text) LIKE ?';
    params.push(`%${search}%`, `%${search}%`);
  }
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const items = db.prepare(query).all(...params).map(formatMedia);
  const total = search
    ? db.prepare('SELECT COUNT(*) AS count FROM media WHERE lower(filename) LIKE ? OR lower(alt_text) LIKE ?').get(`%${search}%`, `%${search}%`).count
    : db.prepare('SELECT COUNT(*) AS count FROM media').get().count;

  return res.json({ ok: true, media: items, pagination: { page, limit, total } });
});

cmsRouter.delete('/media/:id', (req, res) => {
  const db = getDb();
  if (!db.prepare('SELECT id FROM media WHERE id = ?').get(req.params.id)) {
    return res.status(404).json({ ok: false, message: 'Media not found.' });
  }
  db.prepare('DELETE FROM media WHERE id = ?').run(req.params.id);
  audit(req, 'deleted_media', 'media', req.params.id);
  return res.json({ ok: true });
});

// ─── Activity Logs ──────────────────────────────────────────────────────────

cmsRouter.get('/activity-logs', (req, res) => {
  const db = getDb();
  const page = Math.max(1, asInt(req.query.page, 1));
  const limit = Math.min(100, Math.max(1, asInt(req.query.limit, 50)));
  const offset = (page - 1) * limit;
  const rows = db.prepare('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT ? OFFSET ?').all(limit, offset);
  const total = db.prepare('SELECT COUNT(*) AS count FROM activity_logs').get().count;
  return res.json({
    ok: true,
    logs: rows.map(formatActivityLog),
    pagination: { page, limit, total },
  });
});

// ─── Admin Users ────────────────────────────────────────────────────────────

cmsRouter.get('/users', (_req, res) => {
  const rows = getDb().prepare('SELECT id, email, name, role, active, created_at, updated_at FROM admin_users ORDER BY created_at ASC').all();
  return res.json({
    ok: true,
    users: rows.map((row) => ({
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      active: Boolean(row.active),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
  });
});

cmsRouter.post('/users', (req, res) => {
  if (req.admin?.role && req.admin.role !== 'super_admin') {
    return res.status(403).json({ ok: false, message: 'Insufficient permissions.' });
  }
  const email = asString(req.body.email);
  const password = asString(req.body.password);
  if (!email || !password) return res.status(400).json({ ok: false, message: 'Email and password required.' });
  if (password.length < 8) return res.status(400).json({ ok: false, message: 'Password must be at least 8 characters.' });
  const db = getDb();
  const exists = db.prepare('SELECT id FROM admin_users WHERE email = ?').get(email);
  if (exists) return res.status(409).json({ ok: false, message: 'Email already exists.' });
  const id = randomUUID();
  const hash = bcrypt.hashSync(password, 12);
  db.prepare('INSERT INTO admin_users (id, email, password_hash, name, role, active) VALUES (?, ?, ?, ?, ?, ?)').run(
    id, email, hash, asString(req.body.name), asString(req.body.role) || 'content_manager', asBool(req.body.active, true) ? 1 : 0,
  );
  audit(req, 'created_user', 'admin_user', id, email);
  return res.status(201).json({ ok: true, user: { id, email, name: asString(req.body.name), role: asString(req.body.role) || 'content_manager' } });
});

cmsRouter.put('/users/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM admin_users WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ ok: false, message: 'User not found.' });
  const password = asString(req.body.password);
  if (password) {
    if (password.length < 8) return res.status(400).json({ ok: false, message: 'Password must be at least 8 characters.' });
    const hash = bcrypt.hashSync(password, 12);
    db.prepare('UPDATE admin_users SET password_hash = ?, updated_at = datetime(\'now\') WHERE id = ?').run(hash, req.params.id);
  }
  db.prepare(`
    UPDATE admin_users SET name=?, role=?, active=?, updated_at=datetime('now') WHERE id=?
  `).run(
    req.body.name !== undefined ? asString(req.body.name) : existing.name,
    req.body.role !== undefined ? asString(req.body.role) : existing.role,
    req.body.active !== undefined ? (asBool(req.body.active) ? 1 : 0) : existing.active,
    req.params.id,
  );
  audit(req, 'updated_user', 'admin_user', req.params.id);
  return res.json({ ok: true });
});

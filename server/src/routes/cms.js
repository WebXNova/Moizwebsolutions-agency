import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import bcrypt from 'bcryptjs';
import { getDb } from '../db/index.js';
import { ADMIN_ROLES, requireAuth, requireUserAdmin, requireWrite } from '../middleware/auth.js';
import { getAllSettings, getSetting, setSetting } from '../cms/seed.js';
import { logActivity, getClientIp } from '../cms/activity.js';
import { applyReorder } from '../cms/reorder.js';
import { validateSetting } from '../cms/settingsValidation.js';
import { slugify } from '../lib/slug.js';
import { deleteManagedUpload, resolveManagedUploadPath } from '../lib/uploads.js';
import {
  asBool,
  asDate,
  asInt,
  asString,
  isValidEmail,
  isValidUrl,
  normalizeEmail,
  normalizeUrl,
} from '../lib/validators.js';
import { isSafeHref, isSafeHttpUrl, isSafeRelativePath } from '../lib/safeUrl.js';
import { validatePassword } from '../lib/passwordPolicy.js';
import { revokeSessionsForAdmin } from '../lib/sessions.js';
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
cmsRouter.use((req, res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD') return next();
  return requireWrite(req, res, next);
});

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

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {{ table: string; resourceLabel: string; action: string; resourceType: string }} spec
 */
function handleReorder(req, res, spec) {
  const result = applyReorder(getDb(), {
    table: spec.table,
    ids: req.body?.ids,
    resourceLabel: spec.resourceLabel,
  });
  if (!result.ok) {
    return res.status(result.status).json({
      ok: false,
      code: result.code,
      message: result.message,
    });
  }
  audit(req, spec.action, spec.resourceType, '', `${Array.isArray(req.body?.ids) ? req.body.ids.length : 0} items`);
  return res.json({ ok: true });
}

/**
 * @param {unknown} startValue
 * @param {unknown} endValue
 */
function validateDateRange(startValue, endValue) {
  const startDate = asDate(startValue);
  const endDate = asDate(endValue);
  if (startDate === undefined) return { error: 'Start date must be YYYY-MM-DD.' };
  if (endDate === undefined) return { error: 'End date must be YYYY-MM-DD.' };
  if (startDate && endDate && startDate > endDate) {
    return { error: 'End date must be on or after the start date.' };
  }
  return { startDate, endDate };
}

function isSafeNavHref(href) {
  return isSafeRelativePath(href);
}

/**
 * @param {unknown} value
 * @param {{ allowRelative?: boolean; allowEmpty?: boolean }} [options]
 * @returns {{ ok: true; value: string } | { ok: false }}
 */
function parseSafeUrlField(value, options = {}) {
  const raw = asString(value);
  if (!raw) return options.allowEmpty === false ? { ok: false } : { ok: true, value: '' };
  if (options.allowRelative) {
    return isSafeHref(raw) ? { ok: true, value: raw } : { ok: false };
  }
  return isSafeHttpUrl(raw) ? { ok: true, value: normalizeUrl(raw) || raw } : { ok: false };
}

// ─── Settings ───────────────────────────────────────────────────────────────

cmsRouter.get('/settings', (_req, res) => {
  const db = getDb();
  return res.json({ ok: true, settings: getAllSettings(db) });
});

cmsRouter.put('/settings/:key', (req, res) => {
  const key = asString(req.params.key);
  if (!key) return res.status(400).json({ ok: false, message: 'Invalid setting key.' });
  const result = validateSetting(key, req.body);
  if (!result.ok) {
    return res.status(result.status).json({
      ok: false,
      code: result.code,
      message: result.message,
    });
  }
  setSetting(getDb(), key, result.data);
  audit(req, 'updated_setting', 'setting', key);
  return res.json({ ok: true, settings: getAllSettings(getDb()) });
});

cmsRouter.get('/hero', (_req, res) => {
  return res.json({ ok: true, hero: getSetting(getDb(), 'hero') });
});

cmsRouter.put('/hero', (req, res) => {
  const result = validateSetting('hero', req.body);
  if (!result.ok) {
    return res.status(result.status).json({
      ok: false,
      code: result.code,
      message: result.message,
    });
  }
  setSetting(getDb(), 'hero', result.data);
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
  const ctaUrlField = parseSafeUrlField(req.body.ctaUrl, { allowRelative: true });
  if (!ctaUrlField.ok) return res.status(400).json({ ok: false, message: 'Invalid CTA URL.' });
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
    ctaUrlField.value,
    asString(req.body.categoryLabel),
    asBool(req.body.active, true) ? 1 : 0,
    asBool(req.body.featured) ? 1 : 0,
    asInt(req.body.displayOrder, 0),
  );
  audit(req, 'created_service', 'service', id, title);
  const row = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
  return res.status(201).json({ ok: true, service: formatService(row) });
});

cmsRouter.put('/services/reorder', (req, res) => {
  return handleReorder(req, res, {
    table: 'services',
    resourceLabel: 'service',
    action: 'reordered_services',
    resourceType: 'service',
  });
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
  const nextCtaUrl =
    req.body.ctaUrl !== undefined
      ? parseSafeUrlField(req.body.ctaUrl, { allowRelative: true })
      : { ok: true, value: existing.cta_url };
  if (!nextCtaUrl.ok) return res.status(400).json({ ok: false, message: 'Invalid CTA URL.' });
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
    nextCtaUrl.value,
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

// ─── Testimonials ───────────────────────────────────────────────────────────

cmsRouter.get('/testimonials', (_req, res) => {
  const rows = getDb().prepare('SELECT * FROM testimonials ORDER BY display_order ASC').all();
  return res.json({ ok: true, testimonials: rows.map(formatTestimonial) });
});

cmsRouter.post('/testimonials', (req, res) => {
  const quote = asString(req.body.quote);
  const author = asString(req.body.author);
  if (!quote || !author) return res.status(400).json({ ok: false, message: 'Quote and author are required.' });
  const avatarUrl = parseSafeUrlField(req.body.avatarUrl, { allowRelative: true });
  if (!avatarUrl.ok) return res.status(400).json({ ok: false, message: 'Invalid avatar URL.' });
  const id = randomUUID();
  getDb().prepare(`
    INSERT INTO testimonials (id, quote, author, role, company, avatar_url, verified, featured, published, display_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, quote, author,
    asString(req.body.role), asString(req.body.company), avatarUrl.value,
    asBool(req.body.verified) ? 1 : 0, asBool(req.body.featured) ? 1 : 0,
    asBool(req.body.published, true) ? 1 : 0, asInt(req.body.displayOrder, 0),
  );
  audit(req, 'created_testimonial', 'testimonial', id);
  const row = getDb().prepare('SELECT * FROM testimonials WHERE id = ?').get(id);
  return res.status(201).json({ ok: true, testimonial: formatTestimonial(row) });
});

cmsRouter.put('/testimonials/reorder', (req, res) => {
  return handleReorder(req, res, {
    table: 'testimonials',
    resourceLabel: 'testimonial',
    action: 'reordered_testimonials',
    resourceType: 'testimonial',
  });
});

cmsRouter.put('/testimonials/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ ok: false, message: 'Testimonial not found.' });
  const nextAvatar =
    req.body.avatarUrl !== undefined
      ? parseSafeUrlField(req.body.avatarUrl, { allowRelative: true })
      : { ok: true, value: existing.avatar_url };
  if (!nextAvatar.ok) return res.status(400).json({ ok: false, message: 'Invalid avatar URL.' });
  db.prepare(`
    UPDATE testimonials SET quote=?, author=?, role=?, company=?, avatar_url=?,
    verified=?, featured=?, published=?, display_order=?, updated_at=datetime('now') WHERE id=?
  `).run(
    asString(req.body.quote) || existing.quote,
    asString(req.body.author) || existing.author,
    req.body.role !== undefined ? asString(req.body.role) : existing.role,
    req.body.company !== undefined ? asString(req.body.company) : existing.company,
    nextAvatar.value,
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

// ─── Trusted Companies ──────────────────────────────────────────────────────

cmsRouter.get('/trusted-companies', (_req, res) => {
  const rows = getDb().prepare('SELECT * FROM trusted_companies ORDER BY display_order ASC').all();
  return res.json({ ok: true, companies: rows.map(formatTrustedCompany) });
});

cmsRouter.post('/trusted-companies', (req, res) => {
  const name = asString(req.body.name);
  if (!name) return res.status(400).json({ ok: false, message: 'Company name is required.' });
  const logoUrl = parseSafeUrlField(req.body.logoUrl, { allowRelative: true });
  const websiteUrl = parseSafeUrlField(req.body.websiteUrl, { allowRelative: false });
  if (!logoUrl.ok) return res.status(400).json({ ok: false, message: 'Invalid logo URL.' });
  if (!websiteUrl.ok) return res.status(400).json({ ok: false, message: 'Invalid website URL.' });
  const id = randomUUID();
  getDb().prepare(`
    INSERT INTO trusted_companies (id, name, logo_url, website_url, logo_alt, active, display_order)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, name, logoUrl.value, websiteUrl.value,
    asString(req.body.logoAlt) || name, asBool(req.body.active, true) ? 1 : 0, asInt(req.body.displayOrder, 0),
  );
  audit(req, 'created_company', 'trusted_company', id, name);
  const row = getDb().prepare('SELECT * FROM trusted_companies WHERE id = ?').get(id);
  return res.status(201).json({ ok: true, company: formatTrustedCompany(row) });
});

cmsRouter.put('/trusted-companies/reorder', (req, res) => {
  return handleReorder(req, res, {
    table: 'trusted_companies',
    resourceLabel: 'company',
    action: 'reordered_companies',
    resourceType: 'trusted_company',
  });
});

cmsRouter.put('/trusted-companies/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM trusted_companies WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ ok: false, message: 'Company not found.' });
  const websiteUrl = req.body.websiteUrl !== undefined ? parseSafeUrlField(req.body.websiteUrl, { allowRelative: false }) : { ok: true, value: existing.website_url };
  if (!websiteUrl.ok) {
    return res.status(400).json({ ok: false, message: 'Invalid website URL.' });
  }
  const logoUrl = req.body.logoUrl !== undefined ? parseSafeUrlField(req.body.logoUrl, { allowRelative: true }) : { ok: true, value: existing.logo_url };
  if (!logoUrl.ok) return res.status(400).json({ ok: false, message: 'Invalid logo URL.' });
  db.prepare(`
    UPDATE trusted_companies SET name=?, logo_url=?, website_url=?, logo_alt=?, active=?, display_order=?, updated_at=datetime('now') WHERE id=?
  `).run(
    asString(req.body.name) || existing.name,
    logoUrl.value,
    websiteUrl.value, req.body.logoAlt !== undefined ? asString(req.body.logoAlt) : existing.logo_alt,
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

// ─── Technologies ───────────────────────────────────────────────────────────

cmsRouter.get('/technologies', (_req, res) => {
  const rows = getDb().prepare('SELECT * FROM technologies ORDER BY display_order ASC').all();
  return res.json({ ok: true, technologies: rows.map(formatTechnology) });
});

cmsRouter.post('/technologies', (req, res) => {
  const name = asString(req.body.name);
  if (!name) return res.status(400).json({ ok: false, message: 'Name is required.' });
  const slug = asString(req.body.slug) || slugify(name);
  const logoUrl = parseSafeUrlField(req.body.logoUrl, { allowRelative: true });
  if (!logoUrl.ok) return res.status(400).json({ ok: false, message: 'Invalid logo URL.' });
  const id = randomUUID();
  getDb().prepare(`
    INSERT INTO technologies (id, slug, name, category, logo_url, color, invert_on_dark, active, featured, display_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, slug, name, asString(req.body.category), logoUrl.value,
    asString(req.body.color), asBool(req.body.invertOnDark) ? 1 : 0,
    asBool(req.body.active, true) ? 1 : 0, asBool(req.body.featured) ? 1 : 0, asInt(req.body.displayOrder, 0),
  );
  audit(req, 'created_technology', 'technology', id, name);
  const row = getDb().prepare('SELECT * FROM technologies WHERE id = ?').get(id);
  return res.status(201).json({ ok: true, technology: formatTechnology(row) });
});

cmsRouter.put('/technologies/reorder', (req, res) => {
  return handleReorder(req, res, {
    table: 'technologies',
    resourceLabel: 'technology',
    action: 'reordered_technologies',
    resourceType: 'technology',
  });
});

cmsRouter.put('/technologies/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM technologies WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ ok: false, message: 'Technology not found.' });
  const nextLogo =
    req.body.logoUrl !== undefined
      ? parseSafeUrlField(req.body.logoUrl, { allowRelative: true })
      : { ok: true, value: existing.logo_url };
  if (!nextLogo.ok) return res.status(400).json({ ok: false, message: 'Invalid logo URL.' });
  db.prepare(`
    UPDATE technologies SET slug=?, name=?, category=?, logo_url=?, color=?, invert_on_dark=?,
    active=?, featured=?, display_order=?, updated_at=datetime('now') WHERE id=?
  `).run(
    req.body.slug !== undefined ? asString(req.body.slug) : existing.slug,
    asString(req.body.name) || existing.name,
    req.body.category !== undefined ? asString(req.body.category) : existing.category,
    nextLogo.value,
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

cmsRouter.put('/process-steps/reorder', (req, res) => {
  return handleReorder(req, res, {
    table: 'process_steps',
    resourceLabel: 'process step',
    action: 'reordered_process_steps',
    resourceType: 'process_step',
  });
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

// ─── Website Updates ────────────────────────────────────────────────────────

cmsRouter.get('/updates', (_req, res) => {
  const rows = getDb().prepare('SELECT * FROM website_updates ORDER BY display_order ASC, created_at DESC').all();
  return res.json({ ok: true, updates: rows.map(formatWebsiteUpdate) });
});

cmsRouter.post('/updates', (req, res) => {
  const title = asString(req.body.title);
  if (!title) return res.status(400).json({ ok: false, message: 'Title is required.' });
  const ctaUrlField = parseSafeUrlField(req.body.ctaUrl, { allowRelative: true });
  if (!ctaUrlField.ok) return res.status(400).json({ ok: false, message: 'Invalid CTA URL.' });
  const imageUrlField = parseSafeUrlField(req.body.imageUrl, { allowRelative: true });
  if (!imageUrlField.ok) return res.status(400).json({ ok: false, message: 'Invalid image URL.' });
  const dates = validateDateRange(req.body.startDate, req.body.endDate);
  if (dates.error) return res.status(400).json({ ok: false, message: dates.error });
  const id = randomUUID();
  getDb().prepare(`
    INSERT INTO website_updates (id, title, short_description, full_description, image_url, category, cta_text, cta_url, published, featured, start_date, end_date, display_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, title, asString(req.body.shortDescription), asString(req.body.fullDescription),
    imageUrlField.value, asString(req.body.category) || 'announcement',
    asString(req.body.ctaText), ctaUrlField.value,
    asBool(req.body.published) ? 1 : 0, asBool(req.body.featured) ? 1 : 0,
    dates.startDate, dates.endDate, asInt(req.body.displayOrder, 0),
  );
  audit(req, 'created_update', 'website_update', id, title);
  const row = getDb().prepare('SELECT * FROM website_updates WHERE id = ?').get(id);
  return res.status(201).json({ ok: true, update: formatWebsiteUpdate(row) });
});

cmsRouter.put('/updates/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM website_updates WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ ok: false, message: 'Update not found.' });
  const ctaUrl = req.body.ctaUrl !== undefined ? parseSafeUrlField(req.body.ctaUrl, { allowRelative: true }) : { ok: true, value: existing.cta_url };
  if (!ctaUrl.ok) return res.status(400).json({ ok: false, message: 'Invalid CTA URL.' });
  const imageUrl = req.body.imageUrl !== undefined ? parseSafeUrlField(req.body.imageUrl, { allowRelative: true }) : { ok: true, value: existing.image_url };
  if (!imageUrl.ok) return res.status(400).json({ ok: false, message: 'Invalid image URL.' });
  const nextStart = req.body.startDate !== undefined ? req.body.startDate : existing.start_date;
  const nextEnd = req.body.endDate !== undefined ? req.body.endDate : existing.end_date;
  const dates = validateDateRange(nextStart, nextEnd);
  if (dates.error) return res.status(400).json({ ok: false, message: dates.error });
  db.prepare(`
    UPDATE website_updates SET title=?, short_description=?, full_description=?, image_url=?, category=?,
    cta_text=?, cta_url=?, published=?, featured=?, start_date=?, end_date=?, display_order=?, updated_at=datetime('now') WHERE id=?
  `).run(
    asString(req.body.title) || existing.title,
    req.body.shortDescription !== undefined ? asString(req.body.shortDescription) : existing.short_description,
    req.body.fullDescription !== undefined ? asString(req.body.fullDescription) : existing.full_description,
    imageUrl.value,
    req.body.category !== undefined ? asString(req.body.category) : existing.category,
    req.body.ctaText !== undefined ? asString(req.body.ctaText) : existing.cta_text,
    ctaUrl.value,
    req.body.published !== undefined ? (asBool(req.body.published) ? 1 : 0) : existing.published,
    req.body.featured !== undefined ? (asBool(req.body.featured) ? 1 : 0) : existing.featured,
    dates.startDate,
    dates.endDate,
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

cmsRouter.post('/navigation', (_req, res) => {
  return res.status(405).json({
    ok: false,
    code: 'not_allowed',
    message: 'Navigation items are system-managed. Edit an existing item instead of creating a new one.',
  });
});

cmsRouter.put('/navigation/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM navigation_items WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ ok: false, message: 'Navigation item not found.' });
  const href = asString(req.body.href) || existing.href;
  if (!isSafeNavHref(href)) {
    return res.status(400).json({
      ok: false,
      message: 'Navigation href must be a site path or in-page hash (starting with / or #).',
    });
  }
  db.prepare(`
    UPDATE navigation_items SET label=?, href=?, active=?, display_order=?, updated_at=datetime('now') WHERE id=?
  `).run(
    asString(req.body.label) || existing.label,
    href,
    req.body.active !== undefined ? (asBool(req.body.active) ? 1 : 0) : existing.active,
    req.body.displayOrder !== undefined ? asInt(req.body.displayOrder, existing.display_order) : existing.display_order,
    req.params.id,
  );
  audit(req, 'updated_navigation', 'navigation', req.params.id);
  const row = db.prepare('SELECT * FROM navigation_items WHERE id = ?').get(req.params.id);
  return res.json({ ok: true, item: formatNavigationItem(row) });
});

cmsRouter.delete('/navigation/:id', (_req, res) => {
  return res.status(405).json({
    ok: false,
    code: 'not_allowed',
    message: 'Navigation items cannot be deleted. Deactivate an item to hide it from the public site.',
  });
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

  const items = db.prepare(query).all(...params).map((row) => {
    const formatted = formatMedia(row);
    const diskPath = resolveManagedUploadPath(row.url);
    return {
      ...formatted,
      fileMissing: Boolean(diskPath) && !fs.existsSync(diskPath),
    };
  });
  const total = search
    ? db.prepare('SELECT COUNT(*) AS count FROM media WHERE lower(filename) LIKE ? OR lower(alt_text) LIKE ?').get(`%${search}%`, `%${search}%`).count
    : db.prepare('SELECT COUNT(*) AS count FROM media').get().count;

  return res.json({ ok: true, media: items, pagination: { page, limit, total } });
});

cmsRouter.put('/media/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM media WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ ok: false, message: 'Media not found.' });
  const altText = req.body.altText !== undefined ? asString(req.body.altText).slice(0, 200) : existing.alt_text;
  db.prepare('UPDATE media SET alt_text = ? WHERE id = ?').run(altText, req.params.id);
  audit(req, 'updated_media', 'media', req.params.id);
  const row = db.prepare('SELECT * FROM media WHERE id = ?').get(req.params.id);
  return res.json({ ok: true, media: formatMedia(row) });
});

cmsRouter.delete('/media/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM media WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ ok: false, message: 'Media not found.' });
  deleteManagedUpload(existing.url);
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
  const action = asString(req.query.action);
  const resourceType = asString(req.query.resourceType);
  const adminEmail = asString(req.query.adminEmail).toLowerCase();

  const where = [];
  const params = [];
  if (action) {
    where.push('action = ?');
    params.push(action);
  }
  if (resourceType) {
    where.push('resource_type = ?');
    params.push(resourceType);
  }
  if (adminEmail) {
    where.push('lower(admin_email) LIKE ?');
    params.push(`%${adminEmail}%`);
  }

  const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
  const rows = db
    .prepare(`SELECT * FROM activity_logs ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .all(...params, limit, offset);
  const total = db.prepare(`SELECT COUNT(*) AS count FROM activity_logs ${whereSql}`).get(...params).count;
  return res.json({
    ok: true,
    logs: rows.map(formatActivityLog),
    pagination: { page, limit, total },
  });
});

// ─── Admin Users ────────────────────────────────────────────────────────────

cmsRouter.get('/users', requireUserAdmin, (_req, res) => {
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

cmsRouter.post('/users', requireUserAdmin, (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = asString(req.body.password);
  if (!email || !password) return res.status(400).json({ ok: false, message: 'Email and password required.' });
  if (!isValidEmail(email)) return res.status(400).json({ ok: false, message: 'Enter a valid email address.' });
  const passwordError = validatePassword(password, { email });
  if (passwordError) return res.status(400).json({ ok: false, message: passwordError });
  const role = asString(req.body.role) || 'content_manager';
  if (!ADMIN_ROLES.includes(role)) {
    return res.status(400).json({ ok: false, message: 'Invalid role.' });
  }
  const db = getDb();
  const exists = db.prepare('SELECT id FROM admin_users WHERE lower(email) = ?').get(email);
  if (exists) return res.status(409).json({ ok: false, message: 'Email already exists.' });
  const id = randomUUID();
  const hash = bcrypt.hashSync(password, 12);
  const name = asString(req.body.name);
  const active = asBool(req.body.active, true);
  db.prepare('INSERT INTO admin_users (id, email, password_hash, name, role, active) VALUES (?, ?, ?, ?, ?, ?)').run(
    id, email, hash, name, role, active ? 1 : 0,
  );
  audit(req, 'created_user', 'admin_user', id, email);
  return res.status(201).json({ ok: true, user: { id, email, name, role, active } });
});

cmsRouter.put('/users/:id', requireUserAdmin, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM admin_users WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ ok: false, message: 'User not found.' });
  const password = asString(req.body.password);
  if (password) {
    const passwordError = validatePassword(password, { email: existing.email });
    if (passwordError) return res.status(400).json({ ok: false, message: passwordError });
  }
  const nextRole = req.body.role !== undefined ? asString(req.body.role) : existing.role;
  if (!ADMIN_ROLES.includes(nextRole)) {
    return res.status(400).json({ ok: false, message: 'Invalid role.' });
  }
  const nextActive = req.body.active !== undefined ? (asBool(req.body.active) ? 1 : 0) : existing.active;

  if (req.admin.id === req.params.id && nextActive === 0) {
    return res.status(400).json({ ok: false, message: 'You cannot deactivate your own account.' });
  }

  const removingSuper =
    existing.role === 'super_admin' && (nextRole !== 'super_admin' || nextActive === 0);
  if (removingSuper) {
    const remaining = db
      .prepare(
        "SELECT COUNT(*) AS count FROM admin_users WHERE role = 'super_admin' AND active = 1 AND id != ?",
      )
      .get(req.params.id).count;
    if (remaining === 0) {
      return res.status(409).json({
        ok: false,
        code: 'last_super_admin',
        message: 'Cannot remove the last active super admin.',
      });
    }
  }

  const nextName = req.body.name !== undefined ? asString(req.body.name) : existing.name;
  const applyUpdate = db.transaction(() => {
    if (password) {
      const hash = bcrypt.hashSync(password, 12);
      db.prepare(
        "UPDATE admin_users SET password_hash = ?, name = ?, role = ?, active = ?, updated_at = datetime('now') WHERE id = ?",
      ).run(hash, nextName, nextRole, nextActive, req.params.id);
      return;
    }
    db.prepare(
      "UPDATE admin_users SET name = ?, role = ?, active = ?, updated_at = datetime('now') WHERE id = ?",
    ).run(nextName, nextRole, nextActive, req.params.id);
  });
  applyUpdate();
  if (password || nextActive === 0 || nextRole !== existing.role) {
    revokeSessionsForAdmin(req.params.id);
  }
  audit(req, 'updated_user', 'admin_user', req.params.id);
  return res.json({ ok: true });
});

cmsRouter.delete('/users/:id', requireUserAdmin, (_req, res) => {
  return res.status(405).json({
    ok: false,
    code: 'not_allowed',
    message: 'Admin users cannot be deleted. Deactivate the account instead.',
  });
});

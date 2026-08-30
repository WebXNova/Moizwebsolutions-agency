import { randomUUID } from 'node:crypto';
import {
  defaultHero,
  defaultProcessSteps,
  defaultServiceGroups,
  defaultSiteSettings,
  defaultSocialLinks,
  defaultTechnologies,
  defaultTestimonials,
  defaultTrustedCompanies,
} from './defaults.js';

/**
 * @param {import('better-sqlite3').Database} db
 */
function ensureMissingSettings(db) {
  const insertSetting = db.prepare(
    'INSERT OR IGNORE INTO site_settings (key, value) VALUES (?, ?)',
  );
  insertSetting.run('hero', JSON.stringify(defaultHero));
  for (const [key, value] of Object.entries(defaultSiteSettings)) {
    insertSetting.run(key, JSON.stringify(value));
  }
}

/**
 * @param {import('better-sqlite3').Database} db
 */
export function seedCmsContent(db) {
  ensureMissingSettings(db);
  const settingsCount = db.prepare('SELECT COUNT(*) AS count FROM site_settings').get().count;
  if (settingsCount === 0) {
    const insertSetting = db.prepare(
      'INSERT INTO site_settings (key, value) VALUES (?, ?)',
    );
    insertSetting.run('hero', JSON.stringify(defaultHero));
    for (const [key, value] of Object.entries(defaultSiteSettings)) {
      insertSetting.run(key, JSON.stringify(value));
    }
  }

  const servicesCount = db.prepare('SELECT COUNT(*) AS count FROM services').get().count;
  if (servicesCount === 0) {
    const insert = db.prepare(`
      INSERT INTO services (
        id, slug, icon, label, title, description, details_json,
        cta_text, cta_url, category_label, active, featured, display_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const service of defaultServiceGroups) {
      insert.run(
        randomUUID(),
        service.slug,
        service.icon,
        service.label,
        service.title,
        service.description,
        JSON.stringify(service.details),
        service.ctaText,
        service.ctaUrl,
        service.categoryLabel,
        service.active ? 1 : 0,
        service.featured ? 1 : 0,
        service.displayOrder,
      );
    }
  }

  const testimonialsCount = db.prepare('SELECT COUNT(*) AS count FROM testimonials').get().count;
  if (testimonialsCount === 0) {
    const insert = db.prepare(`
      INSERT INTO testimonials (
        id, quote, author, role, company, avatar_url,
        verified, featured, published, display_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const item of defaultTestimonials) {
      insert.run(
        randomUUID(),
        item.quote,
        item.author,
        item.role,
        item.company,
        item.avatarUrl,
        item.verified ? 1 : 0,
        item.featured ? 1 : 0,
        item.published ? 1 : 0,
        item.displayOrder,
      );
    }
  }

  const companiesCount = db.prepare('SELECT COUNT(*) AS count FROM trusted_companies').get().count;
  if (companiesCount === 0) {
    const insert = db.prepare(`
      INSERT INTO trusted_companies (
        id, name, logo_url, website_url, logo_alt, active, display_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const company of defaultTrustedCompanies) {
      insert.run(
        randomUUID(),
        company.name,
        company.logoUrl,
        company.websiteUrl,
        company.logoAlt,
        company.active ? 1 : 0,
        company.displayOrder,
      );
    }
  }

  const techCount = db.prepare('SELECT COUNT(*) AS count FROM technologies').get().count;
  if (techCount === 0) {
    const insert = db.prepare(`
      INSERT INTO technologies (
        id, slug, name, category, logo_url, color, invert_on_dark,
        active, featured, display_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const tech of defaultTechnologies) {
      insert.run(
        randomUUID(),
        tech.slug,
        tech.name,
        tech.category,
        tech.logoUrl,
        tech.color,
        tech.invertOnDark ? 1 : 0,
        tech.active ? 1 : 0,
        tech.featured ? 1 : 0,
        tech.displayOrder,
      );
    }
  }

  const processCount = db.prepare('SELECT COUNT(*) AS count FROM process_steps').get().count;
  if (processCount === 0) {
    const insert = db.prepare(`
      INSERT INTO process_steps (
        id, step_number, title, description, icon, active, display_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const step of defaultProcessSteps) {
      insert.run(
        randomUUID(),
        step.stepNumber,
        step.title,
        step.description,
        step.icon,
        step.active ? 1 : 0,
        step.displayOrder,
      );
    }
  }

  const socialCount = db.prepare('SELECT COUNT(*) AS count FROM social_links').get().count;
  if (socialCount === 0) {
    const insert = db.prepare(`
      INSERT INTO social_links (id, platform, href, label, icon, active, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const link of defaultSocialLinks) {
      insert.run(
        randomUUID(),
        link.platform,
        link.href,
        link.label,
        link.icon,
        link.active ? 1 : 0,
        link.displayOrder,
      );
    }
  }

  const navCount = db.prepare('SELECT COUNT(*) AS count FROM navigation_items').get().count;
  if (navCount === 0) {
    const insert = db.prepare(`
      INSERT INTO navigation_items (id, label, href, active, is_system, display_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const navItems = [
      { label: 'Services', href: '/#services', isSystem: 1, displayOrder: 1 },
      { label: 'Work', href: '/#work', isSystem: 1, displayOrder: 2 },
      { label: 'Process', href: '/#process', isSystem: 1, displayOrder: 3 },
      { label: 'Contact', href: '/#contact', isSystem: 1, displayOrder: 4 },
    ];
    for (const item of navItems) {
      insert.run(randomUUID(), item.label, item.href, 1, item.isSystem, item.displayOrder);
    }
  }
}

/**
 * @param {import('better-sqlite3').Database} db
 * @param {string} key
 */
export function getSetting(db, key) {
  const row = db.prepare('SELECT value FROM site_settings WHERE key = ?').get(key);
  if (!row) return null;
  try {
    return JSON.parse(row.value);
  } catch {
    return null;
  }
}

/**
 * @param {import('better-sqlite3').Database} db
 * @param {string} key
 * @param {unknown} value
 */
export function setSetting(db, key, value) {
  db.prepare(`
    INSERT INTO site_settings (key, value, updated_at)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      updated_at = datetime('now')
  `).run(key, JSON.stringify(value));
}

/**
 * @param {import('better-sqlite3').Database} db
 */
export function getAllSettings(db) {
  const rows = db.prepare('SELECT key, value FROM site_settings').all();
  /** @type {Record<string, unknown>} */
  const settings = {};
  for (const row of rows) {
    try {
      settings[row.key] = JSON.parse(row.value);
    } catch {
      settings[row.key] = row.value;
    }
  }
  return settings;
}

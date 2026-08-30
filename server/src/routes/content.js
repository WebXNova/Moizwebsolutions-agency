import { Router } from 'express';
import { getDb } from '../db/index.js';
import { getAllSettings, getSetting } from '../cms/seed.js';
import {
  formatProcessStep,
  formatService,
  formatSocialLink,
  formatTechnology,
  formatTestimonial,
  formatTrustedCompany,
  formatWebsiteUpdate,
  formatNavigationItem,
  isUpdatePubliclyVisible,
} from '../cms/formatters.js';

export const contentRouter = Router();

contentRouter.get('/', (_req, res) => {
  const db = getDb();
  const settings = getAllSettings(db);

  const services = db
    .prepare('SELECT * FROM services WHERE active = 1 ORDER BY display_order ASC, created_at ASC')
    .all()
    .map(formatService);

  const testimonials = db
    .prepare('SELECT * FROM testimonials WHERE published = 1 ORDER BY display_order ASC, created_at ASC')
    .all()
    .map(formatTestimonial);

  const trustedCompanies = db
    .prepare('SELECT * FROM trusted_companies WHERE active = 1 ORDER BY display_order ASC, created_at ASC')
    .all()
    .map(formatTrustedCompany);

  const technologies = db
    .prepare('SELECT * FROM technologies WHERE active = 1 ORDER BY display_order ASC, created_at ASC')
    .all()
    .map(formatTechnology);

  const processSteps = db
    .prepare('SELECT * FROM process_steps WHERE active = 1 ORDER BY display_order ASC, step_number ASC')
    .all()
    .map(formatProcessStep);

  const socialLinks = db
    .prepare('SELECT * FROM social_links WHERE active = 1 ORDER BY display_order ASC, created_at ASC')
    .all()
    .map(formatSocialLink);

  const navigation = db
    .prepare('SELECT * FROM navigation_items WHERE active = 1 ORDER BY display_order ASC, created_at ASC')
    .all()
    .map(formatNavigationItem);

  const now = new Date().toISOString();
  const updates = db
    .prepare('SELECT * FROM website_updates ORDER BY display_order ASC, created_at DESC')
    .all()
    .filter((row) => isUpdatePubliclyVisible(row, now))
    .map(formatWebsiteUpdate);

  res.set('Cache-Control', 'public, max-age=60');
  return res.json({
    ok: true,
    content: {
      hero: getSetting(db, 'hero'),
      site: settings.site ?? null,
      contact: settings.contact ?? null,
      cta: settings.cta ?? null,
      heroCta: settings.heroCta ?? null,
      footer: settings.footer ?? null,
      seo: settings.seo ?? null,
      sectionLabels: settings.sectionLabels ?? null,
      servicesContent: settings.servicesContent ?? null,
      services,
      testimonials,
      trustedCompanies,
      technologies,
      processSteps,
      socialLinks,
      navigation,
      updates,
    },
  });
});

contentRouter.get('/hero', (_req, res) => {
  const db = getDb();
  return res.json({ ok: true, hero: getSetting(db, 'hero') });
});

contentRouter.get('/services', (_req, res) => {
  const db = getDb();
  const services = db
    .prepare('SELECT * FROM services WHERE active = 1 ORDER BY display_order ASC')
    .all()
    .map(formatService);
  return res.json({ ok: true, services, content: getSetting(db, 'servicesContent') });
});

contentRouter.get('/testimonials', (_req, res) => {
  const db = getDb();
  const testimonials = db
    .prepare('SELECT * FROM testimonials WHERE published = 1 ORDER BY display_order ASC')
    .all()
    .map(formatTestimonial);
  return res.json({ ok: true, testimonials, label: getSetting(db, 'sectionLabels')?.testimonials });
});

contentRouter.get('/trusted-companies', (_req, res) => {
  const db = getDb();
  const companies = db
    .prepare('SELECT * FROM trusted_companies WHERE active = 1 ORDER BY display_order ASC')
    .all()
    .map(formatTrustedCompany);
  return res.json({ ok: true, companies, label: getSetting(db, 'sectionLabels')?.trustedCompanies });
});

contentRouter.get('/technologies', (_req, res) => {
  const db = getDb();
  const technologies = db
    .prepare('SELECT * FROM technologies WHERE active = 1 ORDER BY display_order ASC')
    .all()
    .map(formatTechnology);
  const labels = getSetting(db, 'sectionLabels');
  return res.json({
    ok: true,
    technologies,
    content: {
      eyebrow: labels?.technologiesEyebrow,
      title: labels?.technologiesTitle,
      subtitle: labels?.technologiesSubtitle,
    },
  });
});

contentRouter.get('/process', (_req, res) => {
  const db = getDb();
  const steps = db
    .prepare('SELECT * FROM process_steps WHERE active = 1 ORDER BY display_order ASC')
    .all()
    .map(formatProcessStep);
  const labels = getSetting(db, 'sectionLabels');
  return res.json({
    ok: true,
    steps,
    content: { eyebrow: labels?.processEyebrow, title: labels?.processTitle },
  });
});

contentRouter.get('/updates', (_req, res) => {
  const db = getDb();
  const now = new Date().toISOString();
  const updates = db
    .prepare('SELECT * FROM website_updates ORDER BY display_order ASC, created_at DESC')
    .all()
    .filter((row) => isUpdatePubliclyVisible(row, now))
    .map(formatWebsiteUpdate);
  return res.json({ ok: true, updates });
});

contentRouter.get('/settings', (_req, res) => {
  const db = getDb();
  const settings = getAllSettings(db);
  const { admin: _a, ...publicSettings } = settings;
  return res.json({
    ok: true,
    settings: {
      site: publicSettings.site,
      contact: publicSettings.contact,
      cta: publicSettings.cta,
      footer: publicSettings.footer,
      seo: publicSettings.seo,
    },
  });
});

contentRouter.get('/social-links', (_req, res) => {
  const db = getDb();
  const links = db
    .prepare('SELECT * FROM social_links WHERE active = 1 ORDER BY display_order ASC')
    .all()
    .map(formatSocialLink);
  return res.json({ ok: true, socialLinks: links });
});

contentRouter.get('/navigation', (_req, res) => {
  const db = getDb();
  const items = db
    .prepare('SELECT * FROM navigation_items WHERE active = 1 ORDER BY display_order ASC')
    .all()
    .map(formatNavigationItem);
  return res.json({ ok: true, navigation: items });
});

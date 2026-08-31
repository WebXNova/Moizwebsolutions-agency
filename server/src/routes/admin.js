import { Router } from 'express';
import { getDb } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';
import { getSetting } from '../cms/seed.js';
import { formatActivityLog } from '../cms/formatters.js';

export const adminRouter = Router();

adminRouter.use(requireAuth);

adminRouter.get('/dashboard', (_req, res) => {
  const db = getDb();
  const totalProjects = db.prepare('SELECT COUNT(*) AS count FROM projects').get().count;
  const featuredProjects = db
    .prepare('SELECT COUNT(*) AS count FROM projects WHERE featured = 1')
    .get().count;
  const publishedProjects = db
    .prepare('SELECT COUNT(*) AS count FROM projects WHERE published = 1')
    .get().count;
  const draftProjects = db
    .prepare('SELECT COUNT(*) AS count FROM projects WHERE published = 0')
    .get().count;
  const totalCategories = db.prepare('SELECT COUNT(*) AS count FROM categories').get().count;
  const totalServices = db.prepare('SELECT COUNT(*) AS count FROM services').get().count;
  const activeServices = db.prepare('SELECT COUNT(*) AS count FROM services WHERE active = 1').get().count;
  const totalTestimonials = db.prepare('SELECT COUNT(*) AS count FROM testimonials').get().count;
  const publishedTestimonials = db
    .prepare('SELECT COUNT(*) AS count FROM testimonials WHERE published = 1')
    .get().count;
  const totalCompanies = db.prepare('SELECT COUNT(*) AS count FROM trusted_companies').get().count;
  const totalTechnologies = db.prepare('SELECT COUNT(*) AS count FROM technologies').get().count;
  const totalUpdates = db.prepare('SELECT COUNT(*) AS count FROM website_updates').get().count;
  const publishedUpdates = db
    .prepare('SELECT COUNT(*) AS count FROM website_updates WHERE published = 1')
    .get().count;
  const draftUpdates = db
    .prepare('SELECT COUNT(*) AS count FROM website_updates WHERE published = 0')
    .get().count;
  const totalMedia = db.prepare('SELECT COUNT(*) AS count FROM media').get().count;

  const totalInquiries = db.prepare('SELECT COUNT(*) AS count FROM inquiries').get().count;
  const newInquiries = db
    .prepare("SELECT COUNT(*) AS count FROM inquiries WHERE status = 'new'")
    .get().count;
  const inquiriesToday = db
    .prepare("SELECT COUNT(*) AS count FROM inquiries WHERE created_at >= datetime('now', 'start of day')")
    .get().count;
  const inquiriesThisWeek = db
    .prepare("SELECT COUNT(*) AS count FROM inquiries WHERE created_at >= datetime('now', '-7 days')")
    .get().count;
  const inquiryStatusRows = db
    .prepare('SELECT status, COUNT(*) AS count FROM inquiries GROUP BY status')
    .all();
  const inquiryStatus = Object.fromEntries(inquiryStatusRows.map((row) => [row.status, row.count]));

  const missingLiveUrls = db
    .prepare("SELECT COUNT(*) AS count FROM projects WHERE live_url = '' OR live_url IS NULL")
    .get().count;
  const missingImages = db
    .prepare("SELECT COUNT(*) AS count FROM projects WHERE image_url = '' OR image_url IS NULL")
    .get().count;
  const missingAvatars = db
    .prepare("SELECT COUNT(*) AS count FROM testimonials WHERE avatar_url = '' OR avatar_url IS NULL")
    .get().count;

  const seo = getSetting(db, 'seo');
  const missingSeoTitle = !seo?.homeTitle ? 1 : 0;
  const missingSeoDescription = !seo?.homeDescription ? 1 : 0;

  const recentProjects = db
    .prepare(`
      SELECT p.id, p.title, p.slug, p.featured, p.published, p.display_order, p.updated_at,
             c.name AS category_name
      FROM projects p
      JOIN categories c ON c.id = p.category_id
      ORDER BY p.updated_at DESC
      LIMIT 5
    `)
    .all()
    .map((row) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      category: row.category_name,
      featured: Boolean(row.featured),
      published: Boolean(row.published),
      displayOrder: row.display_order,
      updatedAt: row.updated_at,
    }));

  const recentActivity = db
    .prepare('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 10')
    .all()
    .map(formatActivityLog);

  return res.json({
    ok: true,
    stats: {
      totalProjects,
      featuredProjects,
      publishedProjects,
      draftProjects,
      totalCategories,
      totalServices,
      activeServices,
      totalTestimonials,
      publishedTestimonials,
      totalCompanies,
      totalTechnologies,
      totalUpdates,
      publishedUpdates,
      draftUpdates,
      totalMedia,
      totalInquiries,
      newInquiries,
      inquiriesToday,
      inquiriesThisWeek,
      inquiryStatus,
    },
    health: {
      missingLiveUrls,
      missingImages,
      missingAvatars,
      missingSeoTitle,
      missingSeoDescription,
    },
    recentProjects,
    recentActivity,
  });
});

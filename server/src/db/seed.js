import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { env } from '../config/env.js';
import { slugify } from '../lib/slug.js';

/**
 * @param {import('better-sqlite3').Database} db
 */
export function seedDatabase(db) {
  const adminExists = db.prepare('SELECT COUNT(*) AS count FROM admin_users').get().count;
  if (adminExists === 0 && env.admin.email && env.admin.password) {
    const hash = bcrypt.hashSync(env.admin.password, 12);
    db.prepare(
      'INSERT INTO admin_users (id, email, password_hash, name, role, active) VALUES (?, ?, ?, ?, ?, ?)',
    ).run(randomUUID(), env.admin.email.toLowerCase(), hash, '', 'super_admin', 1);
  }

  // Idempotent and production-safe: demo categories + sample project are inserted
  // only into an empty categories table in development/test. Re-running init
  // never duplicates rows. Production starts empty rather than shipping demo work.
  const categoryCount = db.prepare('SELECT COUNT(*) AS count FROM categories').get().count;
  if (categoryCount > 0) return;
  if (env.isProduction) return;

  const categories = [
    { name: 'E-Commerce', slug: 'e-commerce' },
    { name: 'Product Interface', slug: 'product-interface' },
    { name: 'Identity & Web', slug: 'identity-web' },
    { name: 'Editorial Platform', slug: 'editorial-platform' },
    { name: 'Website Design', slug: 'website-design' },
    { name: 'Mobile App', slug: 'mobile-app' },
  ];

  const projects = [
    {
      title: 'MRB Classes',
      categorySlug: 'website-design',
      description:
        'Educational platform website delivering a clear class experience and professional online presence.',
      technologies: 'Website Design, Responsive Frontend',
      imageUrl: '/assets/work-commerce.svg',
      liveUrl: 'https://mrbclasses.com',
      featured: 1,
      displayOrder: 1,
    },
  ];

  const insertCategory = db.prepare(
    'INSERT INTO categories (id, name, slug) VALUES (?, ?, ?)',
  );
  const insertProject = db.prepare(`
    INSERT INTO projects (
      id, title, slug, category_id, description, technologies,
      image_url, live_url, featured, published, display_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const seedCatalog = db.transaction(() => {
    const categoryIds = {};
    for (const cat of categories) {
      const id = randomUUID();
      categoryIds[cat.slug] = id;
      insertCategory.run(id, cat.name, cat.slug);
    }

    for (const project of projects) {
      insertProject.run(
        randomUUID(),
        project.title,
        slugify(project.title),
        categoryIds[project.categorySlug],
        project.description,
        project.technologies,
        project.imageUrl,
        project.liveUrl,
        project.featured,
        1,
        project.displayOrder,
      );
    }
  });
  seedCatalog();
}

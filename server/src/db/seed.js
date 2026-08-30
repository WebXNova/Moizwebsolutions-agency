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
    db.prepare('INSERT INTO admin_users (id, email, password_hash) VALUES (?, ?, ?)').run(
      randomUUID(),
      env.admin.email,
      hash,
    );
  }

  const categoryCount = db.prepare('SELECT COUNT(*) AS count FROM categories').get().count;
  if (categoryCount > 0) return;

  const categories = [
    { name: 'E-Commerce', slug: 'e-commerce' },
    { name: 'Product Interface', slug: 'product-interface' },
    { name: 'Identity & Web', slug: 'identity-web' },
    { name: 'Editorial Platform', slug: 'editorial-platform' },
    { name: 'Website Design', slug: 'website-design' },
    { name: 'Mobile App', slug: 'mobile-app' },
  ];

  const insertCategory = db.prepare(
    'INSERT INTO categories (id, name, slug) VALUES (?, ?, ?)',
  );

  const categoryIds = {};
  for (const cat of categories) {
    const id = randomUUID();
    categoryIds[cat.slug] = id;
    insertCategory.run(id, cat.name, cat.slug);
  }

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

  const insertProject = db.prepare(`
    INSERT INTO projects (
      id, title, slug, category_id, description, technologies,
      image_url, live_url, featured, display_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const project of projects) {
    const id = randomUUID();
    const slug = slugify(project.title);
    insertProject.run(
      id,
      project.title,
      slug,
      categoryIds[project.categorySlug],
      project.description,
      project.technologies,
      project.imageUrl,
      project.liveUrl,
      project.featured,
      project.displayOrder,
    );
  }
}

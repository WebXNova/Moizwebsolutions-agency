import { initializeCmsSchema } from '../cms/schema.js';

/** @param {import('better-sqlite3').Database | import('./mysql.js').MysqlDatabase} db */
export function initializeSchema(db) {
  if (db.dialect === 'mysql') {
    initializeMysqlCoreSchema(db);
  } else {
    initializeSqliteCoreSchema(db);
  }
  initializeCmsSchema(db);
}

function initializeSqliteCoreSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      category_id TEXT NOT NULL REFERENCES categories(id),
      description TEXT NOT NULL,
      technologies TEXT NOT NULL DEFAULT '',
      image_url TEXT NOT NULL,
      live_url TEXT NOT NULL,
      featured INTEGER NOT NULL DEFAULT 0,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category_id);
    CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);
    CREATE INDEX IF NOT EXISTS idx_projects_order ON projects(display_order);

    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

function initializeMysqlCoreSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(191) NOT NULL UNIQUE,
      slug VARCHAR(191) NOT NULL UNIQUE,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS projects (
      id VARCHAR(36) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(191) NOT NULL UNIQUE,
      category_id VARCHAR(36) NOT NULL,
      description TEXT NOT NULL,
      technologies TEXT NOT NULL DEFAULT (''),
      image_url TEXT NOT NULL,
      live_url TEXT NOT NULL,
      featured TINYINT(1) NOT NULL DEFAULT 0,
      published TINYINT(1) NOT NULL DEFAULT 1,
      display_order INT NOT NULL DEFAULT 0,
      client VARCHAR(255) NOT NULL DEFAULT '',
      \`year\` INT NULL,
      github_url TEXT NOT NULL DEFAULT (''),
      seo_title VARCHAR(255) NOT NULL DEFAULT '',
      seo_description TEXT NOT NULL DEFAULT (''),
      seo_og_image TEXT NOT NULL DEFAULT (''),
      preview_object_position VARCHAR(64) NOT NULL DEFAULT 'center',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_projects_category (category_id),
      KEY idx_projects_featured (featured),
      KEY idx_projects_order (display_order),
      CONSTRAINT fk_projects_category FOREIGN KEY (category_id) REFERENCES categories(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS admin_users (
      id VARCHAR(36) PRIMARY KEY,
      email VARCHAR(191) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL DEFAULT '',
      role VARCHAR(32) NOT NULL DEFAULT 'super_admin',
      active TINYINT(1) NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
}

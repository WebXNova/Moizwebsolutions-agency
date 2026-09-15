/** @param {import('better-sqlite3').Database | import('../db/mysql.js').MysqlDatabase} db */
export function initializeCmsSchema(db) {
  if (db.dialect === 'mysql') {
    initializeMysqlCmsSchema(db);
  } else {
    initializeSqliteCmsSchema(db);
  }
  migrateProjectColumns(db);
  migrateAdminUserColumns(db);
}

function initializeSqliteCmsSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT '{}',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      icon TEXT NOT NULL DEFAULT 'design',
      label TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      details_json TEXT NOT NULL DEFAULT '[]',
      cta_text TEXT NOT NULL DEFAULT '',
      cta_url TEXT NOT NULL DEFAULT '',
      category_label TEXT NOT NULL DEFAULT '',
      active INTEGER NOT NULL DEFAULT 1,
      featured INTEGER NOT NULL DEFAULT 0,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS testimonials (
      id TEXT PRIMARY KEY,
      quote TEXT NOT NULL,
      author TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT '',
      company TEXT NOT NULL DEFAULT '',
      avatar_url TEXT NOT NULL DEFAULT '',
      verified INTEGER NOT NULL DEFAULT 0,
      featured INTEGER NOT NULL DEFAULT 0,
      published INTEGER NOT NULL DEFAULT 1,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS trusted_companies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      logo_url TEXT NOT NULL DEFAULT '',
      website_url TEXT NOT NULL DEFAULT '',
      logo_alt TEXT NOT NULL DEFAULT '',
      active INTEGER NOT NULL DEFAULT 1,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS technologies (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT '',
      logo_url TEXT NOT NULL DEFAULT '',
      color TEXT NOT NULL DEFAULT '',
      invert_on_dark INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      featured INTEGER NOT NULL DEFAULT 0,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS process_steps (
      id TEXT PRIMARY KEY,
      step_number INTEGER NOT NULL DEFAULT 1,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      icon TEXT NOT NULL DEFAULT 'discovery',
      active INTEGER NOT NULL DEFAULT 1,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS website_updates (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      short_description TEXT NOT NULL DEFAULT '',
      full_description TEXT NOT NULL DEFAULT '',
      image_url TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT 'announcement',
      cta_text TEXT NOT NULL DEFAULT '',
      cta_url TEXT NOT NULL DEFAULT '',
      published INTEGER NOT NULL DEFAULT 0,
      featured INTEGER NOT NULL DEFAULT 0,
      start_date TEXT,
      end_date TEXT,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS social_links (
      id TEXT PRIMARY KEY,
      platform TEXT NOT NULL,
      href TEXT NOT NULL DEFAULT '',
      label TEXT NOT NULL DEFAULT '',
      icon TEXT NOT NULL DEFAULT '',
      active INTEGER NOT NULL DEFAULT 1,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS navigation_items (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      href TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      is_system INTEGER NOT NULL DEFAULT 0,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS media (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      url TEXT NOT NULL,
      mime_type TEXT NOT NULL DEFAULT '',
      size_bytes INTEGER NOT NULL DEFAULT 0,
      alt_text TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      admin_id TEXT,
      admin_email TEXT NOT NULL DEFAULT '',
      action TEXT NOT NULL,
      resource_type TEXT NOT NULL DEFAULT '',
      resource_id TEXT,
      details TEXT NOT NULL DEFAULT '',
      ip TEXT NOT NULL DEFAULT '',
      success INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS inquiries (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL DEFAULT '',
      business TEXT NOT NULL DEFAULT '',
      website TEXT NOT NULL DEFAULT '',
      social TEXT NOT NULL DEFAULT '',
      services_json TEXT NOT NULL DEFAULT '[]',
      project_types_json TEXT NOT NULL DEFAULT '[]',
      description TEXT NOT NULL DEFAULT '',
      budget_currency TEXT NOT NULL DEFAULT '',
      budget_label TEXT NOT NULL DEFAULT '',
      timeline TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'new',
      email_status TEXT NOT NULL DEFAULT 'pending',
      confirmation_sent INTEGER NOT NULL DEFAULT 0,
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_services_order ON services(display_order);
    CREATE INDEX IF NOT EXISTS idx_testimonials_order ON testimonials(display_order);
    CREATE INDEX IF NOT EXISTS idx_trusted_companies_order ON trusted_companies(display_order);
    CREATE INDEX IF NOT EXISTS idx_technologies_order ON technologies(display_order);
    CREATE INDEX IF NOT EXISTS idx_process_steps_order ON process_steps(display_order);
    CREATE INDEX IF NOT EXISTS idx_website_updates_order ON website_updates(display_order);
    CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at);
    CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
    CREATE INDEX IF NOT EXISTS idx_activity_logs_resource ON activity_logs(resource_type);
    CREATE INDEX IF NOT EXISTS idx_media_created ON media(created_at);
    CREATE INDEX IF NOT EXISTS idx_inquiries_created ON inquiries(created_at);
    CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
    CREATE INDEX IF NOT EXISTS idx_inquiries_email ON inquiries(email);

    CREATE TABLE IF NOT EXISTS admin_sessions (
      id TEXT PRIMARY KEY,
      admin_id TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      expires_at TEXT NOT NULL,
      revoked_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin ON admin_sessions(admin_id);
  `);
}

function initializeMysqlCmsSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS site_settings (
      \`key\` VARCHAR(64) PRIMARY KEY,
      value LONGTEXT NOT NULL DEFAULT ('{}'),
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS services (
      id VARCHAR(36) PRIMARY KEY,
      slug VARCHAR(191) NOT NULL UNIQUE,
      icon VARCHAR(64) NOT NULL DEFAULT 'design',
      label VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL DEFAULT (''),
      details_json LONGTEXT NOT NULL DEFAULT ('[]'),
      cta_text VARCHAR(255) NOT NULL DEFAULT '',
      cta_url TEXT NOT NULL DEFAULT (''),
      category_label VARCHAR(255) NOT NULL DEFAULT '',
      active TINYINT(1) NOT NULL DEFAULT 1,
      featured TINYINT(1) NOT NULL DEFAULT 0,
      display_order INT NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_services_order (display_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS testimonials (
      id VARCHAR(36) PRIMARY KEY,
      quote TEXT NOT NULL,
      author VARCHAR(255) NOT NULL,
      role VARCHAR(255) NOT NULL DEFAULT '',
      company VARCHAR(255) NOT NULL DEFAULT '',
      avatar_url TEXT NOT NULL DEFAULT (''),
      verified TINYINT(1) NOT NULL DEFAULT 0,
      featured TINYINT(1) NOT NULL DEFAULT 0,
      published TINYINT(1) NOT NULL DEFAULT 1,
      display_order INT NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_testimonials_order (display_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS trusted_companies (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      logo_url TEXT NOT NULL DEFAULT (''),
      website_url TEXT NOT NULL DEFAULT (''),
      logo_alt VARCHAR(255) NOT NULL DEFAULT '',
      active TINYINT(1) NOT NULL DEFAULT 1,
      display_order INT NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_trusted_companies_order (display_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS technologies (
      id VARCHAR(36) PRIMARY KEY,
      slug VARCHAR(191) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(255) NOT NULL DEFAULT '',
      logo_url TEXT NOT NULL DEFAULT (''),
      color VARCHAR(64) NOT NULL DEFAULT '',
      invert_on_dark TINYINT(1) NOT NULL DEFAULT 0,
      active TINYINT(1) NOT NULL DEFAULT 1,
      featured TINYINT(1) NOT NULL DEFAULT 0,
      display_order INT NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_technologies_order (display_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS process_steps (
      id VARCHAR(36) PRIMARY KEY,
      step_number INT NOT NULL DEFAULT 1,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL DEFAULT (''),
      icon VARCHAR(64) NOT NULL DEFAULT 'discovery',
      active TINYINT(1) NOT NULL DEFAULT 1,
      display_order INT NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_process_steps_order (display_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS website_updates (
      id VARCHAR(36) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      short_description TEXT NOT NULL DEFAULT (''),
      full_description LONGTEXT NOT NULL DEFAULT (''),
      image_url TEXT NOT NULL DEFAULT (''),
      category VARCHAR(64) NOT NULL DEFAULT 'announcement',
      cta_text VARCHAR(255) NOT NULL DEFAULT '',
      cta_url TEXT NOT NULL DEFAULT (''),
      published TINYINT(1) NOT NULL DEFAULT 0,
      featured TINYINT(1) NOT NULL DEFAULT 0,
      start_date DATETIME NULL,
      end_date DATETIME NULL,
      display_order INT NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_website_updates_order (display_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS social_links (
      id VARCHAR(36) PRIMARY KEY,
      platform VARCHAR(64) NOT NULL,
      href TEXT NOT NULL DEFAULT (''),
      label VARCHAR(255) NOT NULL DEFAULT '',
      icon VARCHAR(64) NOT NULL DEFAULT '',
      active TINYINT(1) NOT NULL DEFAULT 1,
      display_order INT NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS navigation_items (
      id VARCHAR(36) PRIMARY KEY,
      label VARCHAR(255) NOT NULL,
      href VARCHAR(255) NOT NULL,
      active TINYINT(1) NOT NULL DEFAULT 1,
      is_system TINYINT(1) NOT NULL DEFAULT 0,
      display_order INT NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS media (
      id VARCHAR(36) PRIMARY KEY,
      filename VARCHAR(255) NOT NULL,
      url TEXT NOT NULL,
      mime_type VARCHAR(128) NOT NULL DEFAULT '',
      size_bytes INT NOT NULL DEFAULT 0,
      alt_text VARCHAR(255) NOT NULL DEFAULT '',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      KEY idx_media_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS activity_logs (
      id VARCHAR(36) PRIMARY KEY,
      admin_id VARCHAR(36) NULL,
      admin_email VARCHAR(191) NOT NULL DEFAULT '',
      action VARCHAR(64) NOT NULL,
      resource_type VARCHAR(64) NOT NULL DEFAULT '',
      resource_id VARCHAR(36) NULL,
      details TEXT NOT NULL DEFAULT (''),
      ip VARCHAR(64) NOT NULL DEFAULT '',
      success TINYINT(1) NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      KEY idx_activity_logs_created (created_at),
      KEY idx_activity_logs_action (action),
      KEY idx_activity_logs_resource (resource_type)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS inquiries (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(191) NOT NULL,
      phone VARCHAR(64) NOT NULL DEFAULT '',
      business VARCHAR(255) NOT NULL DEFAULT '',
      website TEXT NOT NULL DEFAULT (''),
      social TEXT NOT NULL DEFAULT (''),
      services_json LONGTEXT NOT NULL DEFAULT ('[]'),
      project_types_json LONGTEXT NOT NULL DEFAULT ('[]'),
      description LONGTEXT NOT NULL DEFAULT (''),
      budget_currency VARCHAR(16) NOT NULL DEFAULT '',
      budget_label VARCHAR(255) NOT NULL DEFAULT '',
      timeline VARCHAR(255) NOT NULL DEFAULT '',
      status VARCHAR(32) NOT NULL DEFAULT 'new',
      email_status VARCHAR(32) NOT NULL DEFAULT 'pending',
      confirmation_sent TINYINT(1) NOT NULL DEFAULT 0,
      notes TEXT NOT NULL DEFAULT (''),
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_inquiries_created (created_at),
      KEY idx_inquiries_status (status),
      KEY idx_inquiries_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS admin_sessions (
      id VARCHAR(36) PRIMARY KEY,
      admin_id VARCHAR(36) NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME NOT NULL,
      revoked_at DATETIME NULL,
      KEY idx_admin_sessions_admin (admin_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
}

/** @param {import('better-sqlite3').Database | import('../db/mysql.js').MysqlDatabase} db */
function migrateProjectColumns(db) {
  const columns = listColumns(db, 'projects');
  const additions = [
    ['published', 'INTEGER NOT NULL DEFAULT 1'],
    ['client', "TEXT NOT NULL DEFAULT ''"],
    ['year', 'INTEGER'],
    ['github_url', "TEXT NOT NULL DEFAULT ''"],
    ['seo_title', "TEXT NOT NULL DEFAULT ''"],
    ['seo_description', "TEXT NOT NULL DEFAULT ''"],
    ['seo_og_image', "TEXT NOT NULL DEFAULT ''"],
    ['preview_object_position', "TEXT NOT NULL DEFAULT 'center'"],
  ];
  for (const [name, definition] of additions) {
    if (!columns.includes(name)) {
      db.exec(`ALTER TABLE projects ADD COLUMN ${name} ${definition}`);
    }
  }
}

function listColumns(db, table) {
  if (db.dialect === 'mysql') {
    return db
      .prepare(
        'SELECT COLUMN_NAME AS name FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?',
      )
      .all(table)
      .map((column) => column.name);
  }
  return db.prepare(`PRAGMA table_info(${table})`).all().map((column) => column.name);
}

/** @param {import('better-sqlite3').Database | import('../db/mysql.js').MysqlDatabase} db */
function migrateAdminUserColumns(db) {
  const columns = listColumns(db, 'admin_users');
  const additions = [
    ['name', "TEXT NOT NULL DEFAULT ''"],
    ['role', "TEXT NOT NULL DEFAULT 'super_admin'"],
    ['active', 'INTEGER NOT NULL DEFAULT 1'],
  ];
  for (const [name, definition] of additions) {
    if (!columns.includes(name)) {
      db.exec(`ALTER TABLE admin_users ADD COLUMN ${name} ${definition}`);
    }
  }
}

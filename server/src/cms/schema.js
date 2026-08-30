/** @param {import('better-sqlite3').Database} db */
export function initializeCmsSchema(db) {
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

    CREATE INDEX IF NOT EXISTS idx_services_order ON services(display_order);
    CREATE INDEX IF NOT EXISTS idx_testimonials_order ON testimonials(display_order);
    CREATE INDEX IF NOT EXISTS idx_trusted_companies_order ON trusted_companies(display_order);
    CREATE INDEX IF NOT EXISTS idx_technologies_order ON technologies(display_order);
    CREATE INDEX IF NOT EXISTS idx_process_steps_order ON process_steps(display_order);
    CREATE INDEX IF NOT EXISTS idx_website_updates_order ON website_updates(display_order);
    CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at);
    CREATE INDEX IF NOT EXISTS idx_media_created ON media(created_at);
  `);

  migrateProjectColumns(db);
  migrateAdminUserColumns(db);
}

/** @param {import('better-sqlite3').Database} db */
function migrateProjectColumns(db) {
  const columns = db.prepare('PRAGMA table_info(projects)').all().map((c) => c.name);
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

/** @param {import('better-sqlite3').Database} db */
function migrateAdminUserColumns(db) {
  const columns = db.prepare('PRAGMA table_info(admin_users)').all().map((c) => c.name);
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

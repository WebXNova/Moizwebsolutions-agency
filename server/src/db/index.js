import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';
import { initializeSchema } from './schema.js';
import { seedDatabase } from './seed.js';
import { seedCmsContent } from '../cms/seed.js';

let db;

function openSqlite() {
  const dir = path.dirname(env.db.path);
  fs.mkdirSync(dir, { recursive: true });
  const sqlite = new Database(env.db.path);
  sqlite.dialect = 'sqlite';
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  sqlite.pragma('busy_timeout = 5000');
  return sqlite;
}

/**
 * @returns {import('better-sqlite3').Database | import('./mysql.js').MysqlDatabase}
 */
export function getDb() {
  if (!db) {
    if (env.db.host) {
      logger.warn('db.mysql_ignored', {
        detail: 'DB_HOST is set but MySQL is not a supported runtime. Using SQLite. Unset DB_HOST.',
      });
    }
    db = openSqlite();
    initializeSchema(db);
    seedDatabase(db);
    seedCmsContent(db);
  }
  return db;
}

export function closeDb() {
  if (!db) return;
  try {
    db.close();
  } catch {
    // already closed
  }
  db = null;
}

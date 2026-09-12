import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';
import { initializeSchema } from './schema.js';
import { seedDatabase } from './seed.js';
import { seedCmsContent } from '../cms/seed.js';
import { createMysqlDatabase } from './mysql.js';

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
      db = createMysqlDatabase(env.db);
      logger.info('db.mysql_connected', {
        host: env.db.host,
        port: env.db.port,
        database: env.db.name,
      });
    } else {
      db = openSqlite();
    }
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

import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { env } from '../config/env.js';
import { initializeSchema } from './schema.js';
import { seedDatabase } from './seed.js';
import { seedCmsContent } from '../cms/seed.js';

let db;

/**
 * @returns {import('better-sqlite3').Database}
 */
export function getDb() {
  if (!db) {
    const dir = path.dirname(env.db.path);
    fs.mkdirSync(dir, { recursive: true });
    db = new Database(env.db.path);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.pragma('busy_timeout = 5000');
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

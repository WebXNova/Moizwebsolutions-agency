import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../data/portfolio.db');
const db = new Database(dbPath);

const row = db
  .prepare('SELECT id, title, display_order FROM projects ORDER BY display_order ASC LIMIT 1')
  .get();

if (!row) {
  console.error('No projects found.');
  process.exit(1);
}

db.prepare(`
  UPDATE projects SET
    live_url = ?,
    title = ?,
    slug = ?,
    updated_at = datetime('now')
  WHERE id = ?
`).run('https://mrbclasses.com', 'MRB Classes', 'mrb-classes', row.id);

console.log(`Updated "${row.title}" → MRB Classes (https://mrbclasses.com)`);
db.close();

/**
 * Isolated test environment. Loaded via `node --import ./test/setup.mjs`.
 * Must run before any `src/` import so env.js reads these values.
 */
import { mkdtempSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const dir = mkdtempSync(path.join(os.tmpdir(), 'mws-p3-'));

process.env.NODE_ENV = 'test';
process.env.DB_PATH = path.join(dir, 'test.db');
delete process.env.DB_HOST;
process.env.JWT_SECRET = 'phase3-test-secret-key-32chars!!';
process.env.ADMIN_EMAIL = 'admin@example.com';
process.env.ADMIN_PASSWORD = 'testpass1234';
process.env.UPLOADS_DIR = path.join(dir, 'uploads');
process.env.UPLOADS_PUBLIC_PATH = '/uploads/projects';
process.env.ALLOWED_ORIGINS = '';
process.env.BACKUP_DIR = path.join(dir, 'backups');
process.env.BACKUP_KEEP = '3';
process.env.INQUIRY_RATE_LIMIT_MAX = '1000';
process.env.INQUIRY_RATE_LIMIT_GLOBAL_MAX = '10000';
process.env.LOGIN_RATE_LIMIT_MAX = '1000';
process.env.LOGIN_RATE_LIMIT_GLOBAL_MAX = '10000';
process.env.ADMIN_SECRET_PATH = 'test-admin-gate-path';

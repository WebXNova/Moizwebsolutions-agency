/**
 * Environment configuration for the Moiz Web Solutions inquiry API.
 *
 * Every secret (SMTP host, user, password) is read here and nowhere else, so
 * credentials never travel further than the process that needs them. Nothing in
 * this file may be imported by the Vite client.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(__dirname, '../../');

/**
 * @param {string} name
 * @param {string} [fallback]
 */
function read(name, fallback = '') {
  const value = process.env[name];
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

/**
 * @param {string} name
 * @param {boolean} fallback
 */
function readBool(name, fallback) {
  const value = read(name);
  if (!value) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

/**
 * @param {string} name
 * @param {number} fallback
 */
function readInt(name, fallback) {
  const parsed = Number.parseInt(read(name), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * @param {string} name
 * @returns {string[]}
 */
function readList(name) {
  return read(name)
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

const smtpPort = readInt('SMTP_PORT', 587);
const nodeEnv = read('NODE_ENV', 'development');
const isProduction = nodeEnv === 'production';

const jwtSecret = read('JWT_SECRET');
const adminEmail = read('ADMIN_EMAIL', 'admin@moizwebsolutions.com');
const adminPassword = read('ADMIN_PASSWORD', 'changeme123');

/** Documented placeholders that must never be used as production secrets. */
const WEAK_JWT_SECRETS = new Set([
  'dev-only-change-in-production',
  'replace-with-a-long-random-string',
  'changeme',
  'secret',
]);

const WEAK_ADMIN_PASSWORDS = new Set(['changeme123', 'changeme', 'password', 'admin']);

export const env = {
  nodeEnv,
  isProduction,
  port: readInt('PORT', 8787),
  /** Bind address. Production defaults to loopback; set LISTEN_HOST=0.0.0.0 for PaaS/containers. */
  listenHost: read('LISTEN_HOST', isProduction ? '127.0.0.1' : ''),
  /** Number of reverse proxies in front of the API; 0 disables `trust proxy`. */
  trustProxy: readInt('TRUST_PROXY', 0),

  /** Browser origins allowed to call the API. Empty list = same-origin only. */
  allowedOrigins: readList('ALLOWED_ORIGINS'),

  smtp: {
    host: read('SMTP_HOST'),
    port: smtpPort,
    // Implicit TLS on 465, STARTTLS everywhere else.
    secure: readBool('SMTP_SECURE', smtpPort === 465),
    user: read('SMTP_USER'),
    pass: read('SMTP_PASS'),
  },

  mail: {
    /** Verified sending identity. Must be a mailbox the SMTP account may send as. */
    fromAddress: read('MAIL_FROM_ADDRESS') || read('SMTP_USER'),
    fromName: read('MAIL_FROM_NAME', 'Moiz Web Solutions Website'),
    /** Where project briefs are delivered. The client can never influence this. */
    businessEmail: read('BUSINESS_EMAIL', 'moizwebsolutions@gmail.com'),
    businessName: read('BUSINESS_NAME', 'Moiz Web Solutions'),
    /** Public site URL used in email footers; optional. */
    siteUrl: read('SITE_URL'),
    /** Timezone used to render the human-readable submission timestamp. */
    timezone: read('MAIL_TIMEZONE', 'Asia/Karachi'),
    sendClientConfirmation: readBool('SEND_CLIENT_CONFIRMATION', true),
  },

  rateLimit: {
    windowMs: readInt('INQUIRY_RATE_LIMIT_WINDOW_MS', 10 * 60 * 1000),
    maxPerIp: readInt('INQUIRY_RATE_LIMIT_MAX', 5),
    maxGlobal: readInt('INQUIRY_RATE_LIMIT_GLOBAL_MAX', 120),
    loginWindowMs: readInt('LOGIN_RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
    loginMaxPerIp: readInt('LOGIN_RATE_LIMIT_MAX', 8),
    loginMaxPerEmail: readInt('LOGIN_RATE_LIMIT_EMAIL_MAX', 5),
    loginMaxGlobal: readInt('LOGIN_RATE_LIMIT_GLOBAL_MAX', 80),
  },

  db: {
    path: read('DB_PATH', path.join(serverRoot, 'data', 'portfolio.db')),
  },

  jwt: {
    // Production refuses to start without a real secret (see collectAuthConfigProblems).
    secret: jwtSecret || (isProduction ? '' : 'dev-only-change-in-production'),
    expiresIn: read('JWT_EXPIRES_IN', '7d'),
    secretFromEnv: Boolean(jwtSecret),
  },

  admin: {
    email: adminEmail,
    password: adminPassword,
  },

  uploads: {
    dir: read('UPLOADS_DIR', path.join(serverRoot, 'uploads', 'projects')),
    publicPath: read('UPLOADS_PUBLIC_PATH', '/uploads/projects'),
    maxBytes: readInt('UPLOAD_MAX_BYTES', 5 * 1024 * 1024),
  },

  backup: {
    dir: read('BACKUP_DIR', path.join(serverRoot, 'backups')),
    keep: Math.max(1, readInt('BACKUP_KEEP', 14)),
  },
};

/**
 * Configuration problems that make sending impossible.
 * Public inquiry still persists the lead and records email_status=failed.
 *
 * @returns {string[]}
 */
export function collectMailConfigProblems() {
  const problems = [];
  if (!env.smtp.host) problems.push('SMTP_HOST is not set');
  if (!env.smtp.user) problems.push('SMTP_USER is not set');
  if (!env.smtp.pass) problems.push('SMTP_PASS is not set');
  if (!env.mail.fromAddress) problems.push('MAIL_FROM_ADDRESS is not set');
  if (!env.mail.businessEmail) problems.push('BUSINESS_EMAIL is not set');
  // Disposable capture inboxes must never be used as production transport.
  if (env.isProduction && /(?:^|\.)ethereal\.email$/i.test(env.smtp.host)) {
    problems.push('SMTP_HOST points at a disposable mailbox, which cannot deliver to BUSINESS_EMAIL');
  }
  return problems;
}

export const isMailConfigured = () => collectMailConfigProblems().length === 0;

/**
 * Secrets that must never ship to production as documented placeholders.
 * Development may use a local fallback JWT so `npm run dev` still boots.
 *
 * @returns {string[]}
 */
export function collectAuthConfigProblems() {
  const problems = [];
  if (!isProduction) return problems;

  if (!jwtSecret) problems.push('JWT_SECRET is not set');
  else if (jwtSecret.length < 32) problems.push('JWT_SECRET must be at least 32 characters');
  else if (WEAK_JWT_SECRETS.has(jwtSecret)) problems.push('JWT_SECRET uses a documented placeholder');

  if (adminPassword && WEAK_ADMIN_PASSWORDS.has(adminPassword)) {
    problems.push('ADMIN_PASSWORD uses a documented placeholder');
  }

  return problems;
}

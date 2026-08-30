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

export const env = {
  nodeEnv: read('NODE_ENV', 'development'),
  isProduction: read('NODE_ENV', 'development') === 'production',
  port: readInt('PORT', 8787),
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
  },

  db: {
    path: read('DB_PATH', path.join(serverRoot, 'data', 'portfolio.db')),
  },

  jwt: {
    secret: read('JWT_SECRET', 'dev-only-change-in-production'),
    expiresIn: read('JWT_EXPIRES_IN', '7d'),
  },

  admin: {
    email: read('ADMIN_EMAIL', 'admin@moizwebsolutions.com'),
    password: read('ADMIN_PASSWORD', 'changeme123'),
  },

  uploads: {
    dir: read('UPLOADS_DIR', path.join(serverRoot, 'uploads', 'projects')),
    publicPath: read('UPLOADS_PUBLIC_PATH', '/uploads/projects'),
    maxBytes: readInt('UPLOAD_MAX_BYTES', 5 * 1024 * 1024),
  },
};

/**
 * Configuration problems that make sending impossible. The route turns a
 * non-empty result into a 503 instead of pretending the email went out.
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

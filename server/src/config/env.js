/**
 * Environment configuration for the Moiz Web Solutions inquiry API.
 *
 * Every secret (SMTP host, user, password) is read here and nowhere else, so
 * credentials never travel further than the process that needs them. Nothing in
 * this file may be imported by the Vite client.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { durationToMs } from '../lib/duration.js';
import { validatePassword } from '../lib/passwordPolicy.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(__dirname, '../../');

const PRODUCTION_JWT_MAX_MS = 24 * 60 * 60 * 1000;

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
const nodeEnv = read('NODE_ENV', 'development').toLowerCase();
const isProduction = nodeEnv === 'production';

const jwtSecret = read('JWT_SECRET');
const adminEmail = read('ADMIN_EMAIL', isProduction ? '' : 'admin@moizwebsolutions.com');
const adminPassword = read('ADMIN_PASSWORD', isProduction ? '' : 'changeme123');
const adminSecretPath = read('ADMIN_SECRET_PATH');

/** Documented placeholders that must never be used as production secrets. */
const WEAK_JWT_SECRETS = new Set([
  'dev-only-change-in-production',
  'replace-with-a-long-random-string',
  'changeme',
  'secret',
]);

const WEAK_ADMIN_PASSWORDS = new Set(['changeme123', 'changeme', 'password', 'admin']);

export const ADMIN_SECRET_MIN_LENGTH = 12;
export const ADMIN_SECRET_MAX_LENGTH = 64;

/** Public site paths and common probes that must never be the admin gate. */
const RESERVED_ADMIN_SECRET_PATHS = new Set([
  'admin',
  'login',
  'logout',
  'dashboard',
  'api',
  'uploads',
  'assets',
  'portfolio',
  'contact',
  'privacy',
  'terms',
  'refund',
  'cms',
  'static',
  'public',
  'server',
  'client',
  'backups',
  'health',
  'settings',
  'projects',
  'inquiries',
  'users',
  'media',
  'preview',
  'home',
  'about',
  'blog',
  'index',
  'wp-admin',
  'administrator',
]);

const WEAK_ADMIN_SECRET_PATHS = new Set([
  'admin',
  'login',
  'admin-login',
  'secret',
  '123456',
  'password',
  'changeme',
  'dashboard',
  'cms',
  'panel',
  'portal',
  'private',
  'hidden',
  'mws-admin',
  'moiz',
  'moizweb',
  'moizwebsolutions',
  'letmein',
  'default',
]);

export const env = {
  nodeEnv,
  isProduction,
  port: readInt('PORT', 8787),
  /** Bind address. Production defaults to loopback; set LISTEN_HOST=0.0.0.0 for PaaS/containers. */
  listenHost: read('LISTEN_HOST', isProduction ? '127.0.0.1' : ''),
  /** Number of reverse proxies in front of the API; 0 disables `trust proxy`. */
  trustProxy: readInt('TRUST_PROXY', isProduction ? 1 : 0),

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
    uploadWindowMs: readInt('UPLOAD_RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
    uploadMaxPerKey: readInt('UPLOAD_RATE_LIMIT_MAX', 20),
    resendWindowMs: readInt('RESEND_RATE_LIMIT_WINDOW_MS', 10 * 60 * 1000),
    resendMaxPerKey: readInt('RESEND_RATE_LIMIT_MAX', 5),
  },

  db: {
    host: read('DB_HOST'),
    port: readInt('DB_PORT', 3306),
    name: read('DB_NAME'),
    user: read('DB_USER'),
    password: read('DB_PASSWORD'),
    path: read('DB_PATH', path.join(serverRoot, 'data', 'portfolio.db')),
  },

  jwt: {
    // Production refuses to start without a real secret (see collectAuthConfigProblems).
    secret: jwtSecret || (isProduction ? '' : 'dev-only-change-in-production'),
    expiresIn: read('JWT_EXPIRES_IN', '12h'),
    secretFromEnv: Boolean(jwtSecret),
  },

  /** Public list safety cap. Response shape stays a plain array for the frontend. */
  publicListLimit: Math.min(500, Math.max(1, readInt('PUBLIC_LIST_LIMIT', 200))),

  admin: {
    email: adminEmail,
    password: adminPassword,
  },

  /**
   * URL segment that unlocks the existing /admin SPA. Never a substitute for JWT.
   * Empty in development disables the Express HTML gate (Vite still serves /admin).
   */
  adminSecret: {
    path: adminSecretPath,
  },

  uploads: {
    dir: read('UPLOADS_DIR', path.join(serverRoot, 'uploads', 'projects')),
    publicPath: read('UPLOADS_PUBLIC_PATH', '/uploads/projects'),
    maxBytes: readInt('UPLOAD_MAX_BYTES', 5 * 1024 * 1024),
  },

  backup: {
    dir: read('BACKUP_DIR', path.join(serverRoot, 'backups')),
    keep: Math.max(1, readInt('BACKUP_KEEP', 14)),
    /** Used to encrypt off-site copies. Never log this value. */
    passphrase: read('BACKUP_PASSPHRASE'),
    /** Directory outside this VPS disk if possible (rclone/sshfs/USB mount). */
    offsiteDir: read('BACKUP_OFFSITE_DIR'),
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
 * Pure production-secret checks. Used by startup validation and tests.
 *
 * @param {{
 *   isProduction: boolean;
 *   jwtSecret: string;
 *   jwtExpiresIn: string;
 *   adminPassword: string;
 *   adminEmail?: string;
 *   allowDevJwtFallback?: boolean;
 * }} input
 * @returns {string[]}
 */
export function evaluateAuthConfig(input) {
  const problems = [];
  if (!input.isProduction) return problems;

  if (!input.jwtSecret) problems.push('JWT_SECRET is not set');
  else if (input.jwtSecret.length < 32) problems.push('JWT_SECRET must be at least 32 characters');
  else if (WEAK_JWT_SECRETS.has(input.jwtSecret)) problems.push('JWT_SECRET uses a documented placeholder');
  else if (input.jwtSecret === 'dev-only-change-in-production') {
    problems.push('JWT_SECRET uses a development fallback');
  }

  if (input.allowDevJwtFallback) {
    problems.push('Development JWT fallback cannot be used in production');
  }

  const expiresMs = durationToMs(input.jwtExpiresIn);
  if (input.jwtExpiresIn && expiresMs == null) {
    problems.push('JWT_EXPIRES_IN must be a duration such as 12h, 15m, or 3600');
  } else if (expiresMs != null && expiresMs > PRODUCTION_JWT_MAX_MS) {
    problems.push('JWT_EXPIRES_IN cannot exceed 24h in production');
  }

  if (!input.adminPassword) {
    // Empty is fine when an admin already exists; seed will no-op.
  } else if (WEAK_ADMIN_PASSWORDS.has(input.adminPassword)) {
    problems.push('ADMIN_PASSWORD uses a documented placeholder');
  } else {
    const policyError = validatePassword(input.adminPassword, { email: input.adminEmail || '' });
    if (policyError) problems.push('ADMIN_PASSWORD does not meet the password policy');
  }

  return problems;
}

/**
 * Secret admin URL path. Production fails closed when unset or guessable.
 *
 * @param {{ isProduction: boolean; secretPath: string }} input
 * @returns {string[]}
 */
export function evaluateAdminSecretConfig(input) {
  const problems = [];
  const value = typeof input.secretPath === 'string' ? input.secretPath.trim() : '';

  if (!value) {
    if (input.isProduction) problems.push('ADMIN_SECRET_PATH is not set');
    return problems;
  }

  if (value.length < ADMIN_SECRET_MIN_LENGTH) {
    problems.push(`ADMIN_SECRET_PATH must be at least ${ADMIN_SECRET_MIN_LENGTH} characters`);
  }
  if (value.length > ADMIN_SECRET_MAX_LENGTH) {
    problems.push(`ADMIN_SECRET_PATH must be at most ${ADMIN_SECRET_MAX_LENGTH} characters`);
  }
  if (!/^[A-Za-z0-9_-]+$/.test(value)) {
    problems.push('ADMIN_SECRET_PATH may only contain letters, digits, underscore, and hyphen');
  }
  if (!/[A-Za-z]/.test(value)) {
    problems.push('ADMIN_SECRET_PATH must contain a letter');
  }
  if (new Set(value).size < 3) {
    problems.push('ADMIN_SECRET_PATH does not have enough unique characters');
  }
  if (RESERVED_ADMIN_SECRET_PATHS.has(value.toLowerCase())) {
    problems.push('ADMIN_SECRET_PATH collides with a public or reserved path');
  }
  if (WEAK_ADMIN_SECRET_PATHS.has(value.toLowerCase())) {
    problems.push('ADMIN_SECRET_PATH uses an obvious default');
  }

  return problems;
}

/**
 * Secrets that must never ship to production as documented placeholders.
 * Development may use a local fallback JWT so `npm run dev` still boots.
 *
 * @returns {string[]}
 */
export function collectAuthConfigProblems() {
  return [
    ...evaluateAuthConfig({
      isProduction,
      jwtSecret,
      jwtExpiresIn: env.jwt.expiresIn,
      adminPassword,
      adminEmail,
      allowDevJwtFallback: isProduction && !jwtSecret,
    }),
    ...evaluateAdminSecretConfig({
      isProduction,
      secretPath: adminSecretPath,
    }),
  ];
}

/**
 * MySQL is not a supported runtime. SQLite is the production database.
 *
 * @param {{ isProduction: boolean; dbHost: string }} input
 * @returns {string[]}
 */
export function evaluateMysqlGuard(input) {
  if (input.dbHost && input.isProduction) {
    return ['DB_HOST is set; production uses SQLite. Unset DB_HOST.'];
  }
  return [];
}

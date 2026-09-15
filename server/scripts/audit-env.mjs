/**
 * Report whether required env keys are present. Never prints secret values.
 *
 *   node --env-file-if-exists=.env scripts/audit-env.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectMailConfigProblems, env, evaluateAuthConfig, evaluateAdminSecretConfig, evaluateMysqlGuard } from '../src/config/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env');
const envFileExists = fs.existsSync(envPath);

function flag(value) {
  return value ? 'YES' : 'NO';
}

const jwtProblems = evaluateAuthConfig({
  isProduction: true,
  jwtSecret: env.jwt.secretFromEnv ? env.jwt.secret : '',
  jwtExpiresIn: env.jwt.expiresIn,
  adminPassword: env.admin.password,
  adminEmail: env.admin.email,
  allowDevJwtFallback: !env.jwt.secretFromEnv,
});

const adminSecretProblems = evaluateAdminSecretConfig({
  isProduction: true,
  secretPath: env.adminSecret.path,
});

const mysql = evaluateMysqlGuard({ isProduction: true, dbHost: env.db.host });
const mailProblems = collectMailConfigProblems();

const jwtOk = env.jwt.secretFromEnv && !jwtProblems.some((item) => item.includes('JWT_SECRET') || item.includes('fallback'));
const adminPasswordOk =
  Boolean(env.admin.password) && !jwtProblems.some((item) => item.includes('ADMIN_PASSWORD'));
const adminSecretOk = Boolean(env.adminSecret.path) && adminSecretProblems.length === 0;

console.log('JWT_SECRET configured:', flag(jwtOk));
console.log('Admin password configured:', flag(adminPasswordOk));
console.log('Admin secret configured:', flag(adminSecretOk));
console.log('DB_HOST present:', flag(Boolean(env.db.host)));
console.log('SMTP configured:', flag(mailProblems.length === 0));
console.log('NODE_ENV:', env.nodeEnv);
console.log('TRUST_PROXY:', env.trustProxy);
console.log('LISTEN_HOST:', env.listenHost || '(all-interfaces)');
console.log('ALLOWED_ORIGINS count:', env.allowedOrigins.length);
console.log('.env file exists:', flag(envFileExists));
if (mysql.length) console.log('MySQL guard (production):', mysql[0]);
if (envFileExists && env.nodeEnv !== 'production') {
  console.log('NOTE: this process is not in production mode; production systemd forces NODE_ENV=production.');
}

import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { describeError, logger } from '../lib/logger.js';

/** @type {import('nodemailer').Transporter | null} */
let transporter = null;

/**
 * Runtime transport state. `configured` means the env vars exist.
 * `verified` means SMTP actually authenticated. Those are not the same thing.
 *
 * @type {{
 *   verified: boolean;
 *   lastError: { code?: string; message: string } | null;
 *   lastVerifiedAt: string | null;
 * }}
 */
const transportState = {
  verified: false,
  lastError: null,
  lastVerifiedAt: null,
};

function isDisposableSmtp(host) {
  return /(?:^|\.)ethereal\.email$/i.test(host || '');
}

function recordError(error) {
  const described = describeError(error);
  transportState.verified = false;
  transportState.lastError = {
    code: described.code,
    message: described.message,
  };
  return described;
}

function recordSuccess() {
  transportState.verified = true;
  transportState.lastError = null;
  transportState.lastVerifiedAt = new Date().toISOString();
}

/**
 * Public health snapshot. Host/port only — never user, password, or URLs
 * that might embed credentials.
 */
export function getMailHealth() {
  const configured =
    Boolean(env.smtp.host) &&
    Boolean(env.smtp.user) &&
    Boolean(env.smtp.pass) &&
    Boolean(env.mail.fromAddress) &&
    Boolean(env.mail.businessEmail);

  const disposable = isDisposableSmtp(env.smtp.host);

  let status = 'missing_config';
  if (configured && disposable) status = 'disposable';
  else if (configured && transportState.verified) status = 'ready';
  else if (configured && transportState.lastError) status = 'verify_failed';
  else if (configured) status = 'unverified';

  return {
    configured,
    transportReady: configured && transportState.verified && !disposable,
    deliversToRealInbox: configured && !disposable,
    status,
    host: env.smtp.host || null,
    port: env.smtp.port || null,
    lastError: transportState.lastError,
    lastVerifiedAt: transportState.lastVerifiedAt,
  };
}

/**
 * Nodemailer: port 465 uses TLS immediately; 587 uses STARTTLS (`secure: false`).
 * An explicit SMTP_SECURE wins when set.
 */
function smtpOptions() {
  const { host, port, secure, user, pass } = env.smtp;

  return {
    host,
    port,
    secure,
    requireTLS: !secure && port === 587,
    auth: { user, pass },
    pool: true,
    maxConnections: 2,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  };
}

/**
 * Lazily creates the shared SMTP transport. Credentials come from the process
 * environment only; nothing in this module is reachable from the browser.
 */
export function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport(smtpOptions());
  return transporter;
}

/**
 * Replaces the transport — used by the local delivery test so it can point at
 * a throwaway SMTP account without touching production configuration.
 *
 * @param {import('nodemailer').Transporter | null} next
 */
export function setTransporter(next) {
  transporter = next;
  transportState.verified = false;
  transportState.lastError = null;
  transportState.lastVerifiedAt = null;
}

/** Confirms the SMTP credentials actually authenticate. */
export async function verifyTransport() {
  try {
    await getTransporter().verify();
    recordSuccess();

    if (isDisposableSmtp(env.smtp.host)) {
      logger.warn('server.smtp_disposable', {
        host: env.smtp.host,
        detail:
          'This SMTP captures mail for preview. It does not deliver to BUSINESS_EMAIL.',
      });
    } else {
      logger.info('server.smtp_verified', { host: env.smtp.host, port: env.smtp.port });
    }

    return true;
  } catch (error) {
    const described = recordError(error);
    logger.error('server.smtp_verify_failed', { error: described });
    return false;
  }
}

/**
 * @param {import('nodemailer').SendMailOptions} message
 */
export async function sendMail(message) {
  try {
    const info = await getTransporter().sendMail({
      from: { name: env.mail.fromName, address: env.mail.fromAddress },
      ...message,
    });

    const accepted = Array.isArray(info.accepted) ? info.accepted : [];
    const rejected = Array.isArray(info.rejected) ? info.rejected : [];
    if (accepted.length === 0 && rejected.length > 0) {
      const error = new Error('The mail server did not accept the message.');
      /** @type {Error & { code?: string }} */ (error).code = 'EENVELOPE';
      throw error;
    }

    recordSuccess();

    if (isDisposableSmtp(env.smtp.host)) {
      logger.warn('inquiry.smtp_disposable_capture', {
        previewUrl: nodemailer.getTestMessageUrl(info) || undefined,
        detail: 'Captured by disposable SMTP — not delivered to the business inbox.',
      });
    }

    return info;
  } catch (error) {
    recordError(error);
    throw error;
  }
}

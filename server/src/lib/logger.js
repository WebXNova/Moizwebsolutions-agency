import { env } from '../config/env.js';

/**
 * Minimal structured logger.
 *
 * Operational fields only — never log SMTP credentials, and never log the
 * client's message body or contact details beyond what is needed to trace a
 * delivery problem back to an inquiry id.
 */

export function redactSecrets(value) {
  let text = String(value ?? '');
  for (const secret of [
    env.smtp.pass,
    env.smtp.user,
    env.jwt.secret,
    env.admin.password,
    env.adminSecret.path,
    env.backup.passphrase,
  ]) {
    if (secret && secret.length >= 3) text = text.split(secret).join('[redacted]');
  }
  return text;
}

/**
 * @param {'info' | 'warn' | 'error'} level
 * @param {string} message
 * @param {Record<string, unknown>} [fields]
 */
function write(level, message, fields) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    msg: message,
    ...fields,
  };

  const line = redactSecrets(JSON.stringify(entry));
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

export const logger = {
  /** @type {(message: string, fields?: Record<string, unknown>) => void} */
  info: (message, fields) => write('info', message, fields),
  /** @type {(message: string, fields?: Record<string, unknown>) => void} */
  warn: (message, fields) => write('warn', message, fields),
  /** @type {(message: string, fields?: Record<string, unknown>) => void} */
  error: (message, fields) => write('error', message, fields),
};

/**
 * Reduces an unknown thrown value to something safe to log.
 *
 * @param {unknown} error
 */
export function describeError(error) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: redactSecrets(error.message),
      // Nodemailer/SMTP surface machine-readable codes that are useful in logs.
      code: /** @type {{ code?: string }} */ (error).code,
      command: /** @type {{ command?: string }} */ (error).command,
      responseCode: /** @type {{ responseCode?: number }} */ (error).responseCode,
    };
  }
  return { name: 'UnknownError', message: redactSecrets(error) };
}

export const MIN_PASSWORD_LENGTH = 10;
export const MAX_PASSWORD_LENGTH = 200;

const COMMON_PASSWORDS = new Set([
  'password',
  'password1',
  'password12',
  'password123',
  'changeme',
  'changeme1',
  'changeme12',
  'changeme123',
  'admin',
  'admin123',
  'admin1234',
  'administrator',
  'letmein',
  'qwerty123',
  'qwerty1234',
  'welcome1',
  'welcome12',
  'welcome123',
  'moizwebsolutions',
]);

/**
 * Backend password policy. Intentionally simple so operators can still type it.
 *
 * @param {unknown} password
 * @param {{ email?: string }} [options]
 * @returns {string | null} error message, or null when acceptable
 */
export function validatePassword(password, options = {}) {
  if (typeof password !== 'string' || !password) {
    return 'Password is required.';
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return 'Password is too long.';
  }
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    return 'Choose a less common password.';
  }

  const email = typeof options.email === 'string' ? options.email.trim().toLowerCase() : '';
  const local = email.split('@')[0] || '';
  if (local.length >= 4 && password.toLowerCase().includes(local)) {
    return 'Password must not contain your email name.';
  }

  return null;
}

import { isSafeHttpUrl } from './safeUrl.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TRUE_TOKENS = ['1', 'true', 'yes', 'on'];
const FALSE_TOKENS = ['0', 'false', 'no', 'off'];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * @param {string} value
 */
export function isValidUrl(value) {
  return isSafeHttpUrl(value);
}

/**
 * @param {string} value
 */
export function normalizeUrl(value) {
  const trimmed = value.trim();
  if (!isValidUrl(trimmed)) return null;
  return trimmed;
}

/**
 * @param {unknown} value
 */
export function asString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * Coerce a CMS/API boolean.
 *
 * Fallback is used only when the value is absent:
 * `undefined`, `null`, or `''`.
 *
 * Present values are coerced, never replaced by fallback:
 * - boolean → itself
 * - '1' | 'true' | 'yes' | 'on' → true
 * - '0' | 'false' | 'no' | 'off' → false
 * - other non-empty strings → false
 * - numbers → Boolean(value) (so 0 is false, 1 is true)
 *
 * Callers that must preserve existing row state should check
 * `body.field !== undefined` before calling asBool, then pass the
 * existing DB value instead of relying on fallback.
 *
 * @param {unknown} value
 * @param {boolean} [fallback=false]
 */
export function asBool(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const token = value.trim().toLowerCase();
    if (TRUE_TOKENS.includes(token)) return true;
    if (FALSE_TOKENS.includes(token)) return false;
    return false;
  }
  return Boolean(value);
}

/**
 * @param {unknown} value
 * @param {number} [fallback=0]
 */
export function asInt(value, fallback = 0) {
  if (value === undefined || value === null || value === '') return fallback;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * Login, create, and update all use this rule so identity comparison is case-insensitive.
 *
 * @param {unknown} value
 */
export function normalizeEmail(value) {
  return asString(value).toLowerCase();
}

/**
 * @param {unknown} value
 */
export function isValidEmail(value) {
  const email = normalizeEmail(value);
  return Boolean(email) && EMAIL_PATTERN.test(email) && email.length <= 254;
}

/**
 * Accepts YYYY-MM-DD (HTML date inputs) or a leading ISO date.
 * Empty string / null / undefined → null.
 *
 * @param {unknown} value
 * @returns {string | null | undefined} undefined means invalid
 */
export function asDate(value) {
  if (value === undefined || value === null || value === '') return null;
  const raw = asString(value);
  if (!raw) return null;
  const day = raw.slice(0, 10);
  if (!ISO_DATE.test(day)) return undefined;
  const parsed = new Date(`${day}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return undefined;
  if (parsed.toISOString().slice(0, 10) !== day) return undefined;
  return day;
}

/**
 * Optional http(s) URL. Empty → ''. Invalid → null.
 *
 * @param {unknown} value
 */
export function asOptionalUrl(value) {
  const raw = asString(value);
  if (!raw) return '';
  return normalizeUrl(raw);
}

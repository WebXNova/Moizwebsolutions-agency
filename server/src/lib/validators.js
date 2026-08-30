const URL_PATTERN =
  /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$/;

/**
 * @param {string} value
 */
export function isValidUrl(value) {
  if (!value || typeof value !== 'string') return false;
  try {
    const url = new URL(value.trim());
    if (!['http:', 'https:'].includes(url.protocol)) return false;
    return URL_PATTERN.test(value.trim());
  } catch {
    return false;
  }
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
 * @param {unknown} value
 */
export function asBool(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
  }
  return Boolean(value);
}

/**
 * @param {unknown} value
 * @param {number} fallback
 */
export function asInt(value, fallback = 0) {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

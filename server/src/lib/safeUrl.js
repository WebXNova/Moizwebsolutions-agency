const DANGEROUS_SCHEME = /^(?:javascript|vbscript|data|file|about|blob):/i;
const WHITESPACE = /[\s\u0000\u200b]+/g;

/**
 * @param {unknown} value
 * @returns {string}
 */
function normalizeCandidate(value) {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * Decode once so `%6aavascript:` / `java%09script:` style probes are visible.
 *
 * @param {string} value
 */
function decodeOnce(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * True when a value is a dangerous URL scheme, including `/javascript:` paths.
 *
 * @param {unknown} value
 */
export function isDangerousUrl(value) {
  const raw = normalizeCandidate(value);
  if (!raw) return false;

  const variants = [raw, decodeOnce(raw)];
  for (const variant of variants) {
    const compact = variant.replace(WHITESPACE, '');
    const lowered = compact.toLowerCase();
    if (DANGEROUS_SCHEME.test(lowered)) return true;
    if (DANGEROUS_SCHEME.test(lowered.replace(/^\/+/, ''))) return true;
    if (lowered.startsWith('/javascript:') || lowered.startsWith('/vbscript:') || lowered.startsWith('/data:')) {
      return true;
    }
  }
  return false;
}

/**
 * Absolute http(s) URL. Rejects credentials, javascript:, data:, vbscript:.
 *
 * @param {unknown} value
 */
export function isSafeHttpUrl(value) {
  const raw = normalizeCandidate(value);
  if (!raw || isDangerousUrl(raw)) return false;
  try {
    const url = new URL(raw);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    if (url.username || url.password) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Same-origin path or in-page hash. Protocol-relative URLs are rejected.
 *
 * @param {unknown} value
 */
export function isSafeRelativePath(value) {
  const raw = normalizeCandidate(value);
  if (!raw || isDangerousUrl(raw)) return false;
  if (raw.startsWith('//')) return false;
  if (raw.includes('\\')) return false;
  if (!raw.startsWith('/') && !raw.startsWith('#')) return false;
  if (/^[a-z][a-z0-9+.-]*:/i.test(raw.slice(1))) return false;
  return true;
}

/**
 * Navigation / CTA href: http(s) or a site path / hash.
 *
 * @param {unknown} value
 */
export function isSafeHref(value) {
  return isSafeHttpUrl(value) || isSafeRelativePath(value);
}

/**
 * Image, avatar, logo, and similar asset URLs.
 *
 * @param {unknown} value
 */
export function isSafeAssetUrl(value) {
  return isSafeHref(value);
}

/**
 * Optional URL field. Empty → ''. Invalid → null.
 *
 * @param {unknown} value
 * @param {{ allowRelative?: boolean }} [options]
 * @returns {string | null}
 */
export function asSafeOptionalUrl(value, options = {}) {
  const raw = normalizeCandidate(value);
  if (!raw) return '';
  if (options.allowRelative) {
    return isSafeHref(raw) ? raw : null;
  }
  return isSafeHttpUrl(raw) ? raw : null;
}

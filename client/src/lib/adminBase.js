const PUBLIC_FIRST_SEGMENTS = new Set(['portfolio', 'contact', 'privacy', 'terms', 'refund']);

/** Guessable first segments that must never mount the admin UI. */
const BLOCKED_ADMIN_SEGMENTS = new Set([
  'admin',
  'login',
  'dashboard',
  'cms',
  'api',
  'uploads',
  'assets',
]);

/**
 * @param {string} [pathname]
 */
export function firstPathSegment(pathname = typeof window === 'undefined' ? '' : window.location.pathname) {
  return String(pathname || '')
    .split('/')
    .filter(Boolean)[0] || '';
}

/**
 * Router basename for the gated admin UI. Empty on the public site.
 * The secret is never stored here — it is whatever first URL segment already loaded.
 *
 * @param {string} [pathname]
 */
export function getAdminBase(pathname = typeof window === 'undefined' ? '' : window.location.pathname) {
  const first = firstPathSegment(pathname);
  if (!first || PUBLIC_FIRST_SEGMENTS.has(first) || BLOCKED_ADMIN_SEGMENTS.has(first)) {
    return '';
  }
  return `/${first}`;
}

export function adminLoginHref() {
  const base = getAdminBase();
  return base ? `${base}/login` : '/';
}

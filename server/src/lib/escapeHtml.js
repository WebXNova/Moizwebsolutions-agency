const HTML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/**
 * Escapes a value for interpolation into HTML email markup. Every client
 * supplied string passes through this before it reaches a template, so markup
 * typed into the brief renders as literal text.
 *
 * @param {unknown} value
 * @returns {string}
 */
export function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/[&<>"']/g, (char) => HTML_ENTITIES[char] ?? char);
}

/**
 * Escapes a multi-line value and converts newlines into `<br />` so the
 * project description keeps its paragraphing inside the email.
 *
 * @param {unknown} value
 * @returns {string}
 */
export function escapeHtmlMultiline(value) {
  return escapeHtml(value).replace(/\r\n|\r|\n/g, '<br />');
}

/**
 * Returns the value as an `https`/`http` URL when it is safe to render as a
 * link, otherwise `null` so the caller falls back to plain escaped text. This
 * blocks `javascript:` and `data:` URLs from becoming clickable.
 *
 * @param {string} value
 * @returns {string | null}
 */
export function safeHttpUrl(value) {
  if (!value) return null;
  const candidate = /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`;

  try {
    const url = new URL(candidate);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url.toString();
  } catch {
    return null;
  }
}

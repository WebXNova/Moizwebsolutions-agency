/**
 * Where the inquiry API lives.
 *
 * Empty means "same origin", which is what the Vite dev proxy and a
 * single-domain deployment both want. Set `VITE_API_BASE_URL` only when the API
 * is hosted separately (e.g. the site on Netlify, the API on Render).
 *
 * Only public, non-secret values belong in `VITE_*`. SMTP credentials live in
 * `server/.env` and never reach the browser.
 */
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

export const apiConfig = {
  baseUrl: rawBaseUrl.replace(/\/+$/, ''),
  /** Give SMTP handshakes room to finish before the UI gives up. */
  timeoutMs: 25_000,
};

/**
 * @param {string} path Leading-slash path, e.g. `/api/project-inquiry`
 */
export function apiUrl(path) {
  return `${apiConfig.baseUrl}${path}`;
}

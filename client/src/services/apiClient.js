import { apiConfig, apiUrl } from '@/config/api';

const AUTH_KEY = 'mws-admin-token';

/**
 * @returns {string | null}
 */
export function getAuthToken() {
  return sessionStorage.getItem(AUTH_KEY);
}

/** @param {string} token */
export function setAuthToken(token) {
  sessionStorage.setItem(AUTH_KEY, token);
}

export function clearAuthToken() {
  sessionStorage.removeItem(AUTH_KEY);
}

/**
 * @param {string} path
 * @param {RequestInit & { auth?: boolean }} [options]
 */
export async function apiRequest(path, options = {}) {
  const { auth = false, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers);

  if (!headers.has('Accept')) headers.set('Accept', 'application/json');

  if (auth) {
    const token = getAuthToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort('timeout'), apiConfig.timeoutMs);
  if (fetchOptions.signal) {
    fetchOptions.signal.addEventListener('abort', () => controller.abort(fetchOptions.signal?.reason), {
      once: true,
    });
  }

  try {
    const response = await fetch(apiUrl(path), {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });

    const contentType = response.headers.get('content-type') ?? '';
    const payload = contentType.includes('application/json')
      ? await response.json().catch(() => null)
      : null;

    if (!response.ok || payload?.ok === false) {
      const error = new Error(payload?.message || 'Request failed.');
      error.code = payload?.code || 'request_failed';
      error.status = response.status;
      error.errors = payload?.errors;
      throw error;
    }

    return payload;
  } finally {
    clearTimeout(timer);
  }
}

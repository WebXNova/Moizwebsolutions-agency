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
      if (auth && response.status === 401) {
        clearAuthToken();
        if (
          typeof window !== 'undefined' &&
          window.location.pathname.startsWith('/admin') &&
          !window.location.pathname.startsWith('/admin/login')
        ) {
          window.location.assign('/admin/login');
        }
      }
      const error = new Error(payload?.message || 'Request failed.');
      error.code = payload?.code || 'request_failed';
      error.status = response.status;
      error.errors = payload?.errors;
      throw error;
    }

    return payload;
  } catch (error) {
    if (error?.name === 'AbortError' || error?.name === 'TimeoutError') {
      const timeout = new Error(
        'The API did not respond. From the client folder, start it with npm run dev:api.',
      );
      timeout.code = 'api_unavailable';
      timeout.status = 503;
      throw timeout;
    }
    if (error?.code === 'ECONNREFUSED' || error?.message === 'Failed to fetch') {
      const unavailable = new Error(
        'The API server is not running. From the client folder, start it with npm run dev:api.',
      );
      unavailable.code = 'api_unavailable';
      unavailable.status = 503;
      throw unavailable;
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

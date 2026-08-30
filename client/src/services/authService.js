import {
  apiRequest,
  clearAuthToken,
  getAuthToken,
  setAuthToken,
} from '@/services/apiClient';

/**
 * @param {string} email
 * @param {string} password
 */
export async function login(email, password) {
  const payload = await apiRequest('/api/admin/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  setAuthToken(payload.token);
  return payload.admin;
}

export async function getCurrentAdmin() {
  if (!getAuthToken()) return null;
  try {
    const payload = await apiRequest('/api/admin/auth/me', { auth: true });
    return payload.admin;
  } catch {
    clearAuthToken();
    return null;
  }
}

export function logout() {
  clearAuthToken();
}

export async function getDashboard() {
  return apiRequest('/api/admin/dashboard', { auth: true });
}

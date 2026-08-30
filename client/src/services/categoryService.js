import { apiRequest } from '@/services/apiClient';

export async function getCategories() {
  const payload = await apiRequest('/api/categories');
  return payload.categories;
}

/** @param {string} name */
export async function createCategory(name) {
  const payload = await apiRequest('/api/categories', {
    method: 'POST',
    auth: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  return payload.category;
}

/**
 * @param {string} id
 * @param {string} name
 */
export async function updateCategory(id, name) {
  const payload = await apiRequest(`/api/categories/${id}`, {
    method: 'PUT',
    auth: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  return payload.category;
}

/** @param {string} id */
export async function deleteCategory(id) {
  await apiRequest(`/api/categories/${id}`, { method: 'DELETE', auth: true });
}

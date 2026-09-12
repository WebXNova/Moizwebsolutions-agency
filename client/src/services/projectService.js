import { apiRequest } from '@/services/apiClient';

/**
 * @param {{ featured?: boolean; categoryId?: string }} [params]
 */
export async function getProjects(params = {}) {
  const search = new URLSearchParams();
  if (params.featured) search.set('featured', 'true');
  if (params.categoryId) search.set('categoryId', params.categoryId);
  if (params.includeUnpublished) search.set('includeUnpublished', 'true');
  const qs = search.toString();
  const payload = await apiRequest(`/api/projects${qs ? `?${qs}` : ''}`, {
    auth: Boolean(params.includeUnpublished),
  });
  return payload.projects;
}

/** @param {string} id */
export async function getProject(id) {
  const payload = await apiRequest(`/api/projects/${id}`, { auth: true });
  return payload.project;
}

/** @param {Record<string, unknown>} data */
export async function createProject(data) {
  const payload = await apiRequest('/api/projects', {
    method: 'POST',
    auth: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return payload.project;
}

/**
 * @param {string} id
 * @param {Record<string, unknown>} data
 */
export async function updateProject(id, data) {
  const payload = await apiRequest(`/api/projects/${id}`, {
    method: 'PUT',
    auth: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return payload.project;
}

/** @param {string} id */
export async function deleteProject(id) {
  await apiRequest(`/api/projects/${id}`, { method: 'DELETE', auth: true });
}

/** @param {File} file */
export async function uploadProjectImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  const payload = await apiRequest('/api/admin/uploads/project-image', {
    method: 'POST',
    auth: true,
    body: formData,
  });
  return payload.url;
}

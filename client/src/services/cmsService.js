import { apiRequest } from '@/services/apiClient';

const authOpts = { auth: true };
const jsonOpts = (method, body) => ({
  method,
  auth: true,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

// ─── Public content ───────────────────────────────────────────────────────────

export async function getSiteContent() {
  const payload = await apiRequest('/api/content');
  return payload.content;
}

// ─── Settings & Hero ──────────────────────────────────────────────────────────

export async function getAdminSettings() {
  const payload = await apiRequest('/api/admin/cms/settings', authOpts);
  return payload.settings;
}

export async function updateSetting(key, value) {
  const payload = await apiRequest(`/api/admin/cms/settings/${key}`, jsonOpts('PUT', value));
  return payload.settings;
}

export async function getHero() {
  const payload = await apiRequest('/api/admin/cms/hero', authOpts);
  return payload.hero;
}

export async function updateHero(data) {
  const payload = await apiRequest('/api/admin/cms/hero', jsonOpts('PUT', data));
  return payload.hero;
}

// ─── Services ─────────────────────────────────────────────────────────────────

export async function getAdminServices() {
  const payload = await apiRequest('/api/admin/cms/services', authOpts);
  return payload.services;
}

export async function createService(data) {
  const payload = await apiRequest('/api/admin/cms/services', jsonOpts('POST', data));
  return payload.service;
}

export async function updateService(id, data) {
  const payload = await apiRequest(`/api/admin/cms/services/${id}`, jsonOpts('PUT', data));
  return payload.service;
}

export async function deleteService(id) {
  await apiRequest(`/api/admin/cms/services/${id}`, { method: 'DELETE', ...authOpts });
}

export async function reorderServices(ids) {
  await apiRequest('/api/admin/cms/services/reorder', jsonOpts('PUT', { ids }));
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

export async function getAdminTestimonials() {
  const payload = await apiRequest('/api/admin/cms/testimonials', authOpts);
  return payload.testimonials;
}

export async function createTestimonial(data) {
  const payload = await apiRequest('/api/admin/cms/testimonials', jsonOpts('POST', data));
  return payload.testimonial;
}

export async function updateTestimonial(id, data) {
  const payload = await apiRequest(`/api/admin/cms/testimonials/${id}`, jsonOpts('PUT', data));
  return payload.testimonial;
}

export async function deleteTestimonial(id) {
  await apiRequest(`/api/admin/cms/testimonials/${id}`, { method: 'DELETE', ...authOpts });
}

export async function reorderTestimonials(ids) {
  await apiRequest('/api/admin/cms/testimonials/reorder', jsonOpts('PUT', { ids }));
}

// ─── Trusted Companies ────────────────────────────────────────────────────────

export async function getAdminCompanies() {
  const payload = await apiRequest('/api/admin/cms/trusted-companies', authOpts);
  return payload.companies;
}

export async function createCompany(data) {
  const payload = await apiRequest('/api/admin/cms/trusted-companies', jsonOpts('POST', data));
  return payload.company;
}

export async function updateCompany(id, data) {
  const payload = await apiRequest(`/api/admin/cms/trusted-companies/${id}`, jsonOpts('PUT', data));
  return payload.company;
}

export async function deleteCompany(id) {
  await apiRequest(`/api/admin/cms/trusted-companies/${id}`, { method: 'DELETE', ...authOpts });
}

export async function reorderCompanies(ids) {
  await apiRequest('/api/admin/cms/trusted-companies/reorder', jsonOpts('PUT', { ids }));
}

// ─── Technologies ─────────────────────────────────────────────────────────────

export async function getAdminTechnologies() {
  const payload = await apiRequest('/api/admin/cms/technologies', authOpts);
  return payload.technologies;
}

export async function createTechnology(data) {
  const payload = await apiRequest('/api/admin/cms/technologies', jsonOpts('POST', data));
  return payload.technology;
}

export async function updateTechnology(id, data) {
  const payload = await apiRequest(`/api/admin/cms/technologies/${id}`, jsonOpts('PUT', data));
  return payload.technology;
}

export async function deleteTechnology(id) {
  await apiRequest(`/api/admin/cms/technologies/${id}`, { method: 'DELETE', ...authOpts });
}

export async function reorderTechnologies(ids) {
  await apiRequest('/api/admin/cms/technologies/reorder', jsonOpts('PUT', { ids }));
}

// ─── Process Steps ────────────────────────────────────────────────────────────

export async function getAdminProcessSteps() {
  const payload = await apiRequest('/api/admin/cms/process-steps', authOpts);
  return payload.steps;
}

export async function createProcessStep(data) {
  const payload = await apiRequest('/api/admin/cms/process-steps', jsonOpts('POST', data));
  return payload.step;
}

export async function updateProcessStep(id, data) {
  const payload = await apiRequest(`/api/admin/cms/process-steps/${id}`, jsonOpts('PUT', data));
  return payload.step;
}

export async function deleteProcessStep(id) {
  await apiRequest(`/api/admin/cms/process-steps/${id}`, { method: 'DELETE', ...authOpts });
}

export async function reorderProcessSteps(ids) {
  await apiRequest('/api/admin/cms/process-steps/reorder', jsonOpts('PUT', { ids }));
}

// ─── Website Updates ──────────────────────────────────────────────────────────

export async function getAdminUpdates() {
  const payload = await apiRequest('/api/admin/cms/updates', authOpts);
  return payload.updates;
}

export async function createUpdate(data) {
  const payload = await apiRequest('/api/admin/cms/updates', jsonOpts('POST', data));
  return payload.update;
}

export async function updateWebsiteUpdate(id, data) {
  const payload = await apiRequest(`/api/admin/cms/updates/${id}`, jsonOpts('PUT', data));
  return payload.update;
}

export async function deleteUpdate(id) {
  await apiRequest(`/api/admin/cms/updates/${id}`, { method: 'DELETE', ...authOpts });
}

// ─── Social Links ─────────────────────────────────────────────────────────────

export async function getAdminSocialLinks() {
  const payload = await apiRequest('/api/admin/cms/social-links', authOpts);
  return payload.socialLinks;
}

export async function createSocialLink(data) {
  const payload = await apiRequest('/api/admin/cms/social-links', jsonOpts('POST', data));
  return payload.socialLink;
}

export async function updateSocialLink(id, data) {
  const payload = await apiRequest(`/api/admin/cms/social-links/${id}`, jsonOpts('PUT', data));
  return payload.socialLink;
}

export async function deleteSocialLink(id) {
  await apiRequest(`/api/admin/cms/social-links/${id}`, { method: 'DELETE', ...authOpts });
}

// ─── Navigation ───────────────────────────────────────────────────────────────

export async function getAdminNavigation() {
  const payload = await apiRequest('/api/admin/cms/navigation', authOpts);
  return payload.navigation;
}

export async function updateNavigationItem(id, data) {
  const payload = await apiRequest(`/api/admin/cms/navigation/${id}`, jsonOpts('PUT', data));
  return payload.item;
}

// ─── Media ────────────────────────────────────────────────────────────────────

export async function getMedia({ search = '', page = 1, limit = 24 } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.set('search', search);
  const payload = await apiRequest(`/api/admin/cms/media?${params}`, authOpts);
  return { media: payload.media, pagination: payload.pagination };
}

export async function deleteMedia(id) {
  await apiRequest(`/api/admin/cms/media/${id}`, { method: 'DELETE', ...authOpts });
}

/** @param {File} file @param {string} [altText] */
export async function uploadMedia(file, altText = '') {
  const formData = new FormData();
  formData.append('image', file);
  if (altText) formData.append('altText', altText);
  const payload = await apiRequest('/api/admin/uploads/media', {
    method: 'POST',
    auth: true,
    body: formData,
  });
  return payload;
}

// ─── Activity Logs ────────────────────────────────────────────────────────────

export async function getActivityLogs({ page = 1, limit = 50 } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  const payload = await apiRequest(`/api/admin/cms/activity-logs?${params}`, authOpts);
  return { logs: payload.logs, pagination: payload.pagination };
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getAdminUsers() {
  const payload = await apiRequest('/api/admin/cms/users', authOpts);
  return payload.users;
}

export async function createAdminUser(data) {
  const payload = await apiRequest('/api/admin/cms/users', jsonOpts('POST', data));
  return payload.user;
}

export async function updateAdminUser(id, data) {
  await apiRequest(`/api/admin/cms/users/${id}`, jsonOpts('PUT', data));
}

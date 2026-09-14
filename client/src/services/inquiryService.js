import { apiRequest } from '@/services/apiClient';

const authOpts = { auth: true };
const jsonOpts = (method, body) => ({
  method,
  auth: true,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export async function getInquiries({ page = 1, limit = 20, search = '', status = '' } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.set('search', search);
  if (status) params.set('status', status);
  const payload = await apiRequest(`/api/admin/inquiries?${params}`, authOpts);
  return { inquiries: payload.inquiries, pagination: payload.pagination };
}

export async function getInquiry(id) {
  const payload = await apiRequest(`/api/admin/inquiries/${id}`, authOpts);
  return payload.inquiry;
}

export async function updateInquiry(id, data) {
  const payload = await apiRequest(`/api/admin/inquiries/${id}`, jsonOpts('PUT', data));
  return payload.inquiry;
}

import { createApp } from '../src/app.js';
import { getDb } from '../src/db/index.js';

export { getDb };

export async function startServer() {
  const app = createApp();
  const server = await new Promise((resolve) => {
    const httpServer = app.listen(0, '127.0.0.1', () => resolve(httpServer));
  });
  const { port } = server.address();
  return { server, base: `http://127.0.0.1:${port}` };
}

export function stopServer(server) {
  return new Promise((resolve) => server.close(resolve));
}

export async function api(base, pathname, options = {}) {
  const response = await fetch(`${base}${pathname}`, {
    ...options,
    headers: {
      ...(options.body && typeof options.body === 'string'
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...options.headers,
    },
  });
  const payload = await response.json().catch(() => null);
  return { status: response.status, payload };
}

export async function http(base, pathname, options = {}) {
  const response = await fetch(`${base}${pathname}`, {
    redirect: 'manual',
    ...options,
    headers: {
      ...(options.body && typeof options.body === 'string'
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...options.headers,
    },
  });
  const text = await response.text().catch(() => '');
  let payload = null;
  try {
    payload = JSON.parse(text);
  } catch {
    payload = null;
  }
  return {
    status: response.status,
    headers: response.headers,
    text,
    payload,
    location: response.headers.get('location') || '',
    setCookie: response.headers.get('set-cookie') || '',
  };
}

export async function loginAs(
  base,
  email = process.env.ADMIN_EMAIL,
  password = process.env.ADMIN_PASSWORD,
) {
  return api(base, '/api/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

export const validInquiry = {
  name: 'Test Client',
  email: 'client@example.com',
  phone: '+1 555 0100',
  business: 'Acme Co',
  website: 'https://acme.example',
  social: '',
  services: ['web-development'],
  projectTypes: { 'web-development': ['Business website'] },
  description: 'We need a new marketing site for the studio launch.',
  currency: 'USD',
  budget: 'usd-1500-3000',
  timeline: '2-4-weeks',
};

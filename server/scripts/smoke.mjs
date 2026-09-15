/**
 * Non-destructive smoke checks against a running API.
 *
 *   SMOKE_BASE_URL=http://127.0.0.1:8787 npm run smoke
 *
 * Does not log in or mutate CMS data unless SMOKE_ADMIN_EMAIL / SMOKE_ADMIN_PASSWORD
 * are set (then it only calls GET /api/admin/dashboard).
 */
const base = (process.env.SMOKE_BASE_URL || 'http://127.0.0.1:8787').replace(/\/+$/, '');

async function check(pathname, options = {}) {
  const response = await fetch(`${base}${pathname}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });
  const payload = await response.json().catch(() => null);
  return { status: response.status, payload, requestId: response.headers.get('x-request-id') };
}

let failed = 0;

function assert(ok, label) {
  if (ok) console.log(`ok  ${label}`);
  else {
    failed += 1;
    console.error(`FAIL  ${label}`);
  }
}

const live = await check('/api/health/live');
assert(live.status === 200 && live.payload?.ok === true, 'liveness');

const health = await check('/api/health');
assert(health.status === 200 && health.payload?.ok === true, 'readiness');
assert(health.payload?.mailHost == null && health.payload?.mailLastError == null, 'health has no SMTP internals');
assert(typeof health.payload?.uploads === 'string', 'health reports uploads');

const content = await check('/api/content');
assert(content.status === 200 && content.payload?.ok === true && content.payload.content, 'public content');

const projects = await check('/api/projects');
assert(projects.status === 200 && Array.isArray(projects.payload?.projects), 'public projects');

const inquiry = await check('/api/project-inquiry', {
  method: 'POST',
  body: JSON.stringify({ name: 'A', email: 'not-an-email' }),
});
assert(inquiry.status === 422, 'invalid inquiry rejected');

const adminDenied = await check('/api/admin/dashboard');
assert(adminDenied.status === 401, 'admin dashboard requires auth');

const inquiriesDenied = await check('/api/admin/inquiries');
assert(inquiriesDenied.status === 401, 'inquiry PII requires auth');

const liveHeaders = await fetch(`${base}/api/health/live`);
assert(liveHeaders.headers.get('x-frame-options') === 'DENY', 'clickjacking header');
assert(liveHeaders.headers.get('content-security-policy')?.includes('frame-ancestors'), 'csp frame-ancestors');

const adminEmail = process.env.SMOKE_ADMIN_EMAIL;
const adminPassword = process.env.SMOKE_ADMIN_PASSWORD;
if (adminEmail && adminPassword) {
  const login = await check('/api/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: adminEmail, password: adminPassword }),
  });
  assert(login.status === 200 && login.payload?.token, 'admin login');
  if (login.payload?.token) {
    const dash = await check('/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${login.payload.token}` },
    });
    assert(dash.status === 200 && dash.payload?.ok === true, 'admin dashboard');
  }
}

console.log(failed === 0 ? '\nsmoke ok' : `\n${failed} smoke check(s) failed`);
process.exit(failed === 0 ? 0 : 1);

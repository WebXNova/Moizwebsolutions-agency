/**
 * End-to-end check for the project inquiry endpoint.
 *
 * Boots the real Express app, posts a full brief through `POST
 * /api/project-inquiry`, and exercises the validation, honeypot and rate-limit
 * paths. Nothing is stubbed except, optionally, the SMTP account.
 *
 *   npm run test:email            # uses server/.env — delivers to BUSINESS_EMAIL
 *   npm run test:email -- --ethereal   # disposable inbox, prints a preview URL
 *
 * The rendered business email is also written to `server/.preview/` so the
 * markup can be opened in a browser without waiting for a delivery.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import nodemailer from 'nodemailer';

const useEthereal = process.argv.includes('--ethereal') || !process.env.SMTP_HOST;

if (useEthereal) {
  const account = await nodemailer.createTestAccount();
  process.env.SMTP_HOST = account.smtp.host;
  process.env.SMTP_PORT = String(account.smtp.port);
  process.env.SMTP_SECURE = String(account.smtp.secure);
  process.env.SMTP_USER = account.user;
  process.env.SMTP_PASS = account.pass;
  process.env.MAIL_FROM_ADDRESS ||= account.user;
  process.env.BUSINESS_EMAIL ||= 'moizwebsolutions@gmail.com';
  console.log(`\nUsing a disposable Ethereal mailbox (${account.user}).`);
  console.log('Inbox: https://ethereal.email/login');
  console.log(`  user: ${account.user}`);
  console.log(`  pass: ${account.pass}\n`);
}

process.env.ALLOWED_ORIGINS ||= 'http://localhost:5173';

const { createApp } = await import('../src/app.js');
const { env } = await import('../src/config/env.js');
const { renderBusinessInquiryEmail } = await import('../src/email/templates/businessInquiry.js');
const { renderClientConfirmationEmail } = await import(
  '../src/email/templates/clientConfirmation.js'
);
const { normalizeInquiry } = await import('../src/inquiry/normalizeInquiry.js');

const sentMessages = [];
const { getTransporter } = await import('../src/email/mailer.js');
const transporter = getTransporter();
const originalSendMail = transporter.sendMail.bind(transporter);
transporter.sendMail = async (message) => {
  const info = await originalSendMail(message);
  sentMessages.push({ message, info });
  return info;
};

const app = createApp();
const server = app.listen(0);
await new Promise((resolve) => server.once('listening', resolve));
const base = `http://127.0.0.1:${server.address().port}`;

const VALID_BRIEF = {
  services: ['web-development', 'graphic-design', 'branding'],
  projectTypes: {
    'web-development': ['E-commerce', 'Dashboard'],
    'graphic-design': ['Logo', 'Social media'],
    branding: ['Brand identity'],
  },
  description:
    'We sell handmade leather goods from Lahore and need a proper storefront.\n\nRight now everything runs through Instagram DMs, which does not scale. We want product pages, a cart, COD plus card payments, and an admin dashboard for stock.\n\nWe also need a refreshed logo and a set of social templates: <script>alert("xss")</script> & "quoted" text should stay literal.',
  currency: 'PKR',
  budget: 'pkr-100-200k',
  timeline: '2-4-weeks',
  name: 'Ahmed Raza',
  business: 'Kaarigar Leather Co.',
  email: 'ahmed.raza@kaarigarleather.pk',
  phone: '+92 300 1234567',
  website: 'kaarigarleather.pk',
  social: 'https://instagram.com/kaarigarleather',
  company: '',
};

let failures = 0;

function addressOf(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return addressOf(value[0]);
  return value.address ?? '';
}

/**
 * @param {string} label
 * @param {boolean} condition
 * @param {string} [detail]
 */
function assert(label, condition, detail = '') {
  if (condition) {
    console.log(`  PASS  ${label}`);
  } else {
    failures += 1;
    console.error(`  FAIL  ${label}${detail ? ` — ${detail}` : ''}`);
  }
}

/**
 * @param {unknown} body
 */
async function post(body) {
  const response = await fetch(`${base}/api/project-inquiry`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'http://localhost:5173' },
    body: JSON.stringify(body),
  });
  return { status: response.status, json: await response.json() };
}

console.log('Test 1 — complete brief delivers to the business inbox');
const submitted = await post(VALID_BRIEF);
assert('responds 201', submitted.status === 201, `got ${submitted.status}`);
assert('returns ok:true', submitted.json.ok === true);
assert(
  'returns a well-formed inquiry id',
  /^MWS-\d{8}-[0-9A-HJKMNP-TV-Z]{4}$/.test(submitted.json.inquiryId ?? ''),
  submitted.json.inquiryId,
);
assert('returns a server timestamp', Boolean(submitted.json.submittedAtLabel));

const businessMail = sentMessages[0]?.message;
const inquiryId = submitted.json.inquiryId;

assert('business email addressed to BUSINESS_EMAIL', addressOf(businessMail?.to) === env.mail.businessEmail, String(businessMail?.to));
assert(
  'Reply-To is the client, not the business',
  addressOf(businessMail?.replyTo) === VALID_BRIEF.email,
  JSON.stringify(businessMail?.replyTo),
);
assert(
  'subject carries name, services and inquiry id',
  businessMail?.subject?.includes('Ahmed Raza') &&
    businessMail?.subject?.includes('Web Development') &&
    businessMail?.subject?.includes(inquiryId),
  businessMail?.subject,
);

const html = businessMail?.html ?? '';
const text = businessMail?.text ?? '';

const expectedInBody = [
  ['client name', 'Ahmed Raza'],
  ['business name', 'Kaarigar Leather Co.'],
  ['client email', 'ahmed.raza@kaarigarleather.pk'],
  ['phone', '+92 300 1234567'],
  ['website', 'kaarigarleather.pk'],
  ['social link', 'instagram.com/kaarigarleather'],
  ['service: Web Development', 'Web Development'],
  ['service: Graphic Design', 'Graphic Design'],
  ['service: Branding', 'Branding'],
  ['project type: E-commerce', 'E-commerce'],
  ['project type: Logo', 'Logo'],
  ['budget range', 'PKR 100,000'],
  ['currency', 'PKR'],
  ['timeline', '2'],
  ['inquiry id', inquiryId],
];

for (const [label, needle] of expectedInBody) {
  assert(`HTML contains ${label}`, html.includes(needle));
  assert(`plain text contains ${label}`, text.includes(needle));
}

assert('HTML keeps the full description', html.includes('handmade leather goods'));
assert(
  'script tag from the description is escaped, not live',
  html.includes('&lt;script&gt;') && !html.includes('<script>alert'),
);
assert('description newlines become <br />', html.includes('<br />'));
assert('HTML includes the full client information block', html.includes('Client information'));
assert('HTML includes the client email as a mailto', html.includes('mailto:ahmed.raza@kaarigarleather.pk'));

console.log('\nTest 2 — invalid client email is rejected server-side');
const badEmail = await post({ ...VALID_BRIEF, email: 'ahmed[at]kaarigar' });
assert('responds 422', badEmail.status === 422, `got ${badEmail.status}`);
assert('flags the email field', Boolean(badEmail.json.errors?.email));
assert('sent no email', sentMessages.length === (env.mail.sendClientConfirmation ? 2 : 1));

console.log('\nTest 3 — unknown catalog ids are rejected, not echoed into the email');
const forged = await post({ ...VALID_BRIEF, services: ['web-development', 'free-money'] });
assert('responds 422', forged.status === 422, `got ${forged.status}`);
assert('flags the services field', Boolean(forged.json.errors?.services));

const forgedBudget = await post({ ...VALID_BRIEF, budget: 'pkr-one-billion' });
assert('rejects an unknown budget id', forgedBudget.status === 422);

console.log('\nTest 4 — honeypot submissions are dropped');
const bot = await post({ ...VALID_BRIEF, company: 'https://spam.example' });
assert('responds 400', bot.status === 400, `got ${bot.status}`);
assert('uses a generic message', bot.json.code === 'rejected');

console.log('\nTest 5 — missing required fields are reported per field');
const empty = await post({ services: [], description: '', currency: 'PKR', name: '', email: '' });
assert('responds 422', empty.status === 422);
assert('flags name', Boolean(empty.json.errors?.name));
assert('flags email', Boolean(empty.json.errors?.email));
assert('flags services', Boolean(empty.json.errors?.services));
assert('flags description', Boolean(empty.json.errors?.description));

console.log('\nTest 6 — rate limiting blocks a flood without leaking internals');
let limited = null;
for (let attempt = 0; attempt < env.rateLimit.maxPerIp + 3; attempt += 1) {
  const response = await post(VALID_BRIEF);
  if (response.status === 429) {
    limited = response;
    break;
  }
}
assert('eventually responds 429', limited?.status === 429);
assert('returns rate_limited code', limited?.json.code === 'rate_limited');
assert('response mentions no SMTP internals', !JSON.stringify(limited?.json ?? {}).toLowerCase().includes('smtp'));

console.log('\nTest 7 — client confirmation is a separate message to the visitor');
if (env.mail.sendClientConfirmation) {
  const confirmation = sentMessages[1]?.message;
  assert('addressed to the client', addressOf(confirmation?.to) === VALID_BRIEF.email);
  assert('replies back to the business', addressOf(confirmation?.replyTo) === env.mail.businessEmail);
  assert('quotes the inquiry id', confirmation?.subject?.includes(inquiryId));
  assert(
    'is not addressed to the business inbox',
    addressOf(confirmation?.to) !== env.mail.businessEmail,
  );
} else {
  console.log('  SKIP  SEND_CLIENT_CONFIRMATION is off');
}

console.log('\nDelivered messages:');
for (const { message, info } of sentMessages) {
  const to = typeof message.to === 'string' ? message.to : message.to?.address;
  const preview = nodemailer.getTestMessageUrl(info);
  console.log(`  → ${to}  ${message.subject}`);
  if (preview) console.log(`    preview: ${preview}`);
}

// Rebuilds the exact same message through a stream transport so the raw MIME —
// From, To, Reply-To, encoding, both body parts — can be inspected offline.
const rawDir = path.resolve(import.meta.dirname, '../.preview');
await mkdir(rawDir, { recursive: true });
const mimeBuilder = nodemailer.createTransport({ streamTransport: true, buffer: true });

for (const [index, { message }] of sentMessages.slice(0, 2).entries()) {
  const built = await mimeBuilder.sendMail({
    from: { name: env.mail.fromName, address: env.mail.fromAddress },
    ...message,
  });
  const name = index === 0 ? 'business-inquiry.eml' : 'client-confirmation.eml';
  await writeFile(path.join(rawDir, name), built.message, 'utf8');
}

// Written for eyeballing the markup in a browser.
const previewDir = rawDir;
const sample = normalizeInquiry(VALID_BRIEF);
if (sample.ok) {
  const meta = {
    inquiryId: inquiryId ?? 'MWS-00000000-TEST',
    submittedAtLabel: submitted.json.submittedAtLabel ?? '',
    businessName: env.mail.businessName,
    businessEmail: env.mail.businessEmail,
    siteUrl: env.mail.siteUrl,
  };
  const business = renderBusinessInquiryEmail(sample.data, meta);
  const confirmation = renderClientConfirmationEmail(sample.data, meta);

  await writeFile(path.join(previewDir, 'business-inquiry.html'), business.html, 'utf8');
  await writeFile(path.join(previewDir, 'business-inquiry.txt'), business.text, 'utf8');
  await writeFile(path.join(previewDir, 'client-confirmation.html'), confirmation.html, 'utf8');
  console.log(`\nRendered previews written to ${previewDir}`);
}

server.close();
transporter.close?.();

console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);

/**
 * Checks whether SMTP env vars exist and whether the transport can authenticate.
 * Prints host/port/status only — never the password or full connection URL.
 *
 *   npm run verify:smtp
 */
import { collectMailConfigProblems, env } from '../src/config/env.js';
import { getMailHealth, setTransporter, verifyTransport } from '../src/email/mailer.js';

const problems = collectMailConfigProblems();
if (problems.length > 0) {
  console.log('mailStatus: missing_config');
  for (const problem of problems) console.log(`  - ${problem}`);
  console.log('\nExpected variables:');
  console.log('  SMTP_HOST');
  console.log('  SMTP_PORT          (587 STARTTLS, or 465 implicit TLS)');
  console.log('  SMTP_SECURE        (blank = auto from port)');
  console.log('  SMTP_USER');
  console.log('  SMTP_PASS');
  console.log('  MAIL_FROM_ADDRESS  (optional; defaults to SMTP_USER)');
  console.log('  MAIL_FROM_NAME     (optional)');
  console.log('  BUSINESS_EMAIL');
  process.exit(1);
}

const verified = await verifyTransport();
const health = getMailHealth();

console.log(`mailConfigured:          ${health.configured}`);
console.log(`mailTransportReady:      ${health.transportReady}`);
console.log(`mailDeliversToRealInbox: ${health.deliversToRealInbox}`);
console.log(`mailStatus:              ${health.status}`);
console.log(`mailHost:                ${health.host}`);
console.log(`mailPort:                ${health.port}`);
console.log(`from:                    ${env.mail.fromName} <${env.mail.fromAddress}>`);
console.log(`to:                      ${env.mail.businessEmail}`);
if (health.lastError) {
  console.log(`lastError.code:          ${health.lastError.code ?? ''}`);
  console.log(`lastError.message:       ${health.lastError.message}`);
}

setTransporter(null);
process.exit(verified && health.deliversToRealInbox ? 0 : 1);

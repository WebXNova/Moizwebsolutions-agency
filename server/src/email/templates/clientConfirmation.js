import { escapeHtml } from '../../lib/escapeHtml.js';

/**
 * Receipt sent back to the visitor after the brief reaches the business inbox.
 *
 * Intentionally short and free of marketing: it confirms what was received and
 * hands over the inquiry id, nothing more.
 */

const BRAND = {
  yellow: '#FFC20E',
  yellowSoft: '#FFF9E6',
  ink: '#111111',
  inkMuted: '#6E6E6E',
  inkFaint: '#9A9A9A',
  blue: '#1D4ED8',
  hairline: '#E7E7E3',
  page: '#F4F4F2',
};

const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

/**
 * @param {string} label
 * @param {string} value
 */
function summaryRow(label, value) {
  return `
    <tr>
      <td width="120" valign="top" style="padding:0 12px 10px 0;font-family:${FONT};font-size:10px;line-height:18px;letter-spacing:1.4px;text-transform:uppercase;color:${BRAND.inkFaint};">${escapeHtml(label)}</td>
      <td valign="top" style="padding:0 0 10px 0;font-family:${FONT};font-size:14px;line-height:20px;color:${BRAND.ink};">${escapeHtml(value)}</td>
    </tr>`;
}

/**
 * @param {import('../../inquiry/normalizeInquiry.js').NormalizedInquiry} inquiry
 * @param {{ inquiryId: string; submittedAtLabel: string; businessName: string; businessEmail: string; siteUrl?: string }} meta
 */
export function renderClientConfirmationEmail(inquiry, meta) {
  const { client, serviceTitles, budget, timeline } = inquiry;
  const firstName = client.name.split(/\s+/)[0] || client.name;

  const rows = [
    summaryRow('Services', serviceTitles.join(', ')),
    summaryRow('Budget', budget.rangeLabel ? `${budget.currency} — ${budget.rangeLabel}` : 'Not specified'),
    summaryRow('Timeline', timeline || 'Not specified'),
    summaryRow('Inquiry ID', meta.inquiryId),
    summaryRow('Submitted', meta.submittedAtLabel),
  ].join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<title>We received your project request</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.page};">
<div style="display:none;font-size:1px;color:${BRAND.page};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">Your project brief reached ${escapeHtml(meta.businessName)} — reference ${escapeHtml(meta.inquiryId)}.</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.page};">
  <tr>
    <td align="center" style="padding:24px 12px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;background-color:#FFFFFF;border:1px solid ${BRAND.hairline};">
        <tr><td style="height:4px;background-color:${BRAND.yellow};font-size:0;line-height:0;">&nbsp;</td></tr>

        <tr>
          <td style="padding:30px 32px 0 32px;">
            <p style="margin:0;font-family:${FONT};font-size:10px;line-height:14px;letter-spacing:2.2px;text-transform:uppercase;color:${BRAND.inkMuted};">${escapeHtml(meta.businessName)}</p>
            <h1 style="margin:10px 0 0 0;font-family:${FONT};font-size:23px;line-height:30px;font-weight:700;letter-spacing:-0.4px;color:${BRAND.ink};">We received your project request</h1>
            <p style="margin:14px 0 0 0;font-family:${FONT};font-size:14px;line-height:23px;color:${BRAND.inkMuted};">Hi ${escapeHtml(firstName)}, thanks for the detail — your brief is with us and we reply to every enquiry within two working days.</p>
          </td>
        </tr>

        <tr>
          <td style="padding:24px 32px 0 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FAFAF8;border:1px solid ${BRAND.hairline};">
              <tr>
                <td style="padding:18px 20px 8px 20px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:22px 32px 0 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.yellowSoft};border-left:3px solid ${BRAND.yellow};">
              <tr>
                <td style="padding:16px 18px;">
                  <p style="margin:0;font-family:${FONT};font-size:10px;line-height:14px;letter-spacing:1.4px;text-transform:uppercase;color:${BRAND.inkMuted};">Need to add something?</p>
                  <p style="margin:6px 0 0 0;font-family:${FONT};font-size:14px;line-height:21px;color:${BRAND.ink};">Reply to this email and quote <strong>${escapeHtml(meta.inquiryId)}</strong>, or write to <a href="mailto:${escapeHtml(meta.businessEmail)}" style="color:${BRAND.blue};text-decoration:underline;">${escapeHtml(meta.businessEmail)}</a>.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:24px 32px 30px 32px;">
            <p style="margin:0;font-family:${FONT};font-size:14px;line-height:23px;color:${BRAND.inkMuted};">Talk soon,<br />${escapeHtml(meta.businessName)}</p>
          </td>
        </tr>

        <tr>
          <td style="padding:16px 32px;background-color:#FAFAF8;border-top:1px solid ${BRAND.hairline};">
            <p style="margin:0;font-family:${FONT};font-size:11px;line-height:17px;color:${BRAND.inkFaint};">This is an automated confirmation for a project brief submitted on the ${escapeHtml(meta.businessName)} website${meta.siteUrl ? ` (${escapeHtml(meta.siteUrl)})` : ''}.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  const text = [
    `${meta.businessName.toUpperCase()} — WE RECEIVED YOUR PROJECT REQUEST`,
    '',
    `Hi ${firstName},`,
    '',
    'Thanks for the detail — your project brief is with us and we reply to every enquiry within two working days.',
    '',
    `Services:   ${serviceTitles.join(', ')}`,
    `Budget:     ${budget.rangeLabel ? `${budget.currency} — ${budget.rangeLabel}` : 'Not specified'}`,
    `Timeline:   ${timeline || 'Not specified'}`,
    `Inquiry ID: ${meta.inquiryId}`,
    `Submitted:  ${meta.submittedAtLabel}`,
    '',
    `Need to add something? Reply to this email quoting ${meta.inquiryId}, or write to ${meta.businessEmail}.`,
    '',
    'Talk soon,',
    meta.businessName,
  ].join('\n');

  return {
    subject: `We received your project request — ${meta.inquiryId}`,
    html,
    text,
  };
}

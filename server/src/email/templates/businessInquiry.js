import { escapeHtml, escapeHtmlMultiline, safeHttpUrl } from '../../lib/escapeHtml.js';
import { summarizeServices } from '../../inquiry/normalizeInquiry.js';

/**
 * Internal project-lead notification sent to the Moiz Web Solutions inbox.
 *
 * Deliberately conservative markup: nested tables, inline styles, no flexbox,
 * no grid, no web fonts, no background images. Every dynamic value is escaped
 * before it reaches the markup.
 */

const BRAND = {
  yellow: '#FFC20E',
  yellowSoft: '#FFF9E6',
  ink: '#111111',
  inkSoft: '#3F3F3F',
  inkMuted: '#6E6E6E',
  inkFaint: '#9A9A9A',
  blue: '#1D4ED8',
  hairline: '#E7E7E3',
  page: '#F4F4F2',
};

const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

const LABEL_STYLE = `font-family:${FONT};font-size:10px;line-height:16px;letter-spacing:1.4px;text-transform:uppercase;color:${BRAND.inkFaint};padding:0 0 4px 0;`;
const VALUE_STYLE = `font-family:${FONT};font-size:14px;line-height:21px;color:${BRAND.ink};padding:0 0 14px 0;`;

/**
 * @param {string} title
 */
function sectionHeading(title) {
  return `
    <tr>
      <td style="padding:26px 0 12px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="20" style="padding:0;"><div style="height:2px;width:20px;background-color:${BRAND.yellow};font-size:0;line-height:0;">&nbsp;</div></td>
            <td style="padding:0 0 0 10px;font-family:${FONT};font-size:11px;line-height:14px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:${BRAND.ink};">${escapeHtml(title)}</td>
          </tr>
        </table>
      </td>
    </tr>`;
}

function divider() {
  return `
    <tr>
      <td style="padding:6px 0 0 0;">
        <div style="height:1px;background-color:${BRAND.hairline};font-size:0;line-height:0;">&nbsp;</div>
      </td>
    </tr>`;
}

/**
 * @param {string} label
 * @param {string} valueHtml
 */
function detailRow(label, valueHtml) {
  return `
    <tr><td style="${LABEL_STYLE}">${escapeHtml(label)}</td></tr>
    <tr><td style="${VALUE_STYLE}">${valueHtml}</td></tr>`;
}

/**
 * Renders a URL as a link when it is a safe http(s) address, plain text if not.
 *
 * @param {string} value
 */
function linkOrText(value) {
  const href = safeHttpUrl(value);
  if (!href) return escapeHtml(value);
  return `<a href="${escapeHtml(href)}" style="color:${BRAND.blue};text-decoration:underline;">${escapeHtml(value)}</a>`;
}

/**
 * @param {import('../../inquiry/normalizeInquiry.js').NormalizedInquiry} inquiry
 * @param {{ inquiryId: string; submittedAtLabel: string; businessName: string; siteUrl?: string }} meta
 */
export function renderBusinessInquiryEmail(inquiry, meta) {
  const { client, serviceTitles, projectTypeGroups, description, budget, timeline } = inquiry;

  const contactRows = [
    ['Name', escapeHtml(client.name)],
    ['Business / brand', client.business ? escapeHtml(client.business) : '—'],
    [
      'Email',
      `<a href="mailto:${escapeHtml(client.email)}" style="color:${BRAND.blue};text-decoration:underline;font-weight:600;">${escapeHtml(client.email)}</a>`,
    ],
    ['WhatsApp / phone', client.phone ? escapeHtml(client.phone) : '—'],
    ['Website', client.website ? linkOrText(client.website) : '—'],
    ['Social / profile', client.social ? linkOrText(client.social) : '—'],
  ];

  const serviceItems = serviceTitles
    .map(
      (title) => `
        <tr>
          <td width="14" valign="top" style="padding:0 0 8px 0;font-family:${FONT};font-size:14px;line-height:21px;color:${BRAND.yellow};">&bull;</td>
          <td valign="top" style="padding:0 0 8px 0;font-family:${FONT};font-size:14px;line-height:21px;color:${BRAND.ink};">${escapeHtml(title)}</td>
        </tr>`,
    )
    .join('');

  const projectTypeRows = projectTypeGroups
    .map(
      (group) => `
        <tr><td style="${LABEL_STYLE}">${escapeHtml(group.title)}</td></tr>
        <tr><td style="${VALUE_STYLE}">${escapeHtml(group.values.join(', '))}</td></tr>`,
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<title>New project inquiry</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.page};">
<div style="display:none;font-size:1px;color:${BRAND.page};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(client.name)} &mdash; ${escapeHtml(summarizeServices(serviceTitles))} &mdash; ${escapeHtml(meta.inquiryId)}</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.page};">
  <tr>
    <td align="center" style="padding:24px 12px;">

      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;background-color:#FFFFFF;border:1px solid ${BRAND.hairline};">
        <tr>
          <td style="height:4px;background-color:${BRAND.yellow};font-size:0;line-height:0;">&nbsp;</td>
        </tr>

        <tr>
          <td style="padding:30px 32px 0 32px;">
            <p style="margin:0;font-family:${FONT};font-size:10px;line-height:14px;letter-spacing:2.2px;text-transform:uppercase;color:${BRAND.inkMuted};">${escapeHtml(meta.businessName)}</p>
            <h1 style="margin:10px 0 0 0;font-family:${FONT};font-size:24px;line-height:30px;font-weight:700;letter-spacing:-0.4px;color:${BRAND.ink};">New project inquiry</h1>
            <p style="margin:8px 0 0 0;font-family:${FONT};font-size:13px;line-height:20px;color:${BRAND.inkMuted};">${escapeHtml(summarizeServices(serviceTitles))}</p>
            <p style="margin:14px 0 0 0;">
              <span style="display:inline-block;font-family:${FONT};font-size:11px;line-height:16px;letter-spacing:1px;font-weight:700;color:${BRAND.ink};background-color:${BRAND.yellowSoft};border:1px solid ${BRAND.yellow};padding:5px 10px;">${escapeHtml(meta.inquiryId)}</span>
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding:22px 32px 0 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.yellowSoft};border-left:3px solid ${BRAND.yellow};">
              <tr>
                <td style="padding:16px 18px;">
                  <p style="margin:0;font-family:${FONT};font-size:10px;line-height:14px;letter-spacing:1.4px;text-transform:uppercase;color:${BRAND.inkMuted};">Reply to client</p>
                  <p style="margin:6px 0 0 0;font-family:${FONT};font-size:17px;line-height:24px;font-weight:700;color:${BRAND.ink};">${escapeHtml(client.name)}</p>
                  <p style="margin:4px 0 0 0;font-family:${FONT};font-size:15px;line-height:22px;">
                    <a href="mailto:${escapeHtml(client.email)}" style="color:${BRAND.blue};text-decoration:underline;font-weight:600;">${escapeHtml(client.email)}</a>
                  </p>
                  <p style="margin:8px 0 0 0;font-family:${FONT};font-size:12px;line-height:18px;color:${BRAND.inkMuted};">Hitting Reply on this email goes straight to the client.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:0 32px 32px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">

              ${sectionHeading('Client information')}
              <tr>
                <td style="padding:4px 0 0 0;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                    ${contactRows.map(([label, value]) => detailRow(String(label), String(value))).join('')}
                  </table>
                </td>
              </tr>
              ${divider()}

              ${sectionHeading('Services requested')}
              <tr>
                <td style="padding:4px 0 0 0;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${serviceItems}</table>
                </td>
              </tr>
              ${divider()}

              ${projectTypeRows ? sectionHeading('Project type') : ''}
              ${projectTypeRows ? `<tr><td style="padding:4px 0 0 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${projectTypeRows}</table></td></tr>` : ''}
              ${projectTypeRows ? divider() : ''}

              ${sectionHeading('Project description')}
              <tr>
                <td style="padding:4px 0 0 0;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FAFAF8;border:1px solid ${BRAND.hairline};">
                    <tr>
                      <td style="padding:16px 18px;font-family:${FONT};font-size:14px;line-height:23px;color:${BRAND.inkSoft};">${escapeHtmlMultiline(description)}</td>
                    </tr>
                  </table>
                </td>
              </tr>
              ${divider()}

              ${sectionHeading('Budget &amp; timeline')}
              <tr>
                <td style="padding:4px 0 0 0;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                    ${detailRow('Currency', escapeHtml(budget.currency))}
                    ${detailRow('Budget range', escapeHtml(budget.rangeLabel || 'Not specified'))}
                    ${detailRow('Preferred timeline', escapeHtml(timeline || 'Not specified'))}
                  </table>
                </td>
              </tr>
              ${divider()}

              ${sectionHeading('Submission details')}
              <tr>
                <td style="padding:4px 0 0 0;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                    ${detailRow('Inquiry ID', escapeHtml(meta.inquiryId))}
                    ${detailRow('Submitted', escapeHtml(meta.submittedAtLabel))}
                    ${detailRow('Source', escapeHtml(meta.siteUrl || `${meta.businessName} portfolio website`))}
                  </table>
                </td>
              </tr>

            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:16px 32px;background-color:#FAFAF8;border-top:1px solid ${BRAND.hairline};">
            <p style="margin:0;font-family:${FONT};font-size:11px;line-height:17px;color:${BRAND.inkFaint};">Sent automatically by the ${escapeHtml(meta.businessName)} website project brief form.</p>
          </td>
        </tr>
      </table>

    </td>
  </tr>
</table>
</body>
</html>`;

  const rule = '='.repeat(50);
  const thin = '-'.repeat(50);

  const textLines = [
    rule,
    meta.businessName.toUpperCase(),
    'NEW PROJECT INQUIRY',
    meta.inquiryId,
    rule,
    '',
    'CLIENT INFORMATION',
    '',
    `Name:              ${client.name}`,
    `Business / brand:  ${client.business || '—'}`,
    `Email:             ${client.email}`,
    `WhatsApp / phone:  ${client.phone || '—'}`,
    `Website:           ${client.website || '—'}`,
    `Social / profile:  ${client.social || '—'}`,
    '',
    thin,
    '',
    'SERVICES REQUESTED',
    '',
    ...serviceTitles.map((title) => `  • ${title}`),
    '',
    thin,
    '',
    'PROJECT TYPE',
    '',
    ...(projectTypeGroups.length > 0
      ? projectTypeGroups.map((group) => `  ${group.title}: ${group.values.join(', ')}`)
      : ['  Not specified']),
    '',
    thin,
    '',
    'PROJECT DESCRIPTION',
    '',
    description,
    '',
    thin,
    '',
    'BUDGET',
    '',
    `Currency: ${budget.currency}`,
    `Range:    ${budget.rangeLabel || 'Not specified'}`,
    '',
    thin,
    '',
    'PREFERRED TIMELINE',
    '',
    timeline || 'Not specified',
    '',
    thin,
    '',
    'SUBMISSION DETAILS',
    '',
    `Inquiry ID: ${meta.inquiryId}`,
    `Submitted:  ${meta.submittedAtLabel}`,
    `Source:     ${meta.siteUrl || `${meta.businessName} portfolio website`}`,
    '',
    rule,
    '',
    `Reply to this email to reach ${client.name} at ${client.email}.`,
  ];

  return {
    subject: `New project inquiry — ${client.name} — ${summarizeServices(serviceTitles)} (${meta.inquiryId})`,
    html,
    text: textLines.join('\n'),
  };
}

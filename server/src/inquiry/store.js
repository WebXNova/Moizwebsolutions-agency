import { getDb } from '../db/index.js';

export const INQUIRY_STATUSES = [
  'new',
  'contacted',
  'qualified',
  'proposal',
  'won',
  'lost',
  'archived',
];

export const EMAIL_STATUSES = ['pending', 'sent', 'failed'];

/**
 * @param {Record<string, unknown>} row
 */
export function formatInquiry(row) {
  let services = [];
  let projectTypes = [];
  try {
    services = JSON.parse(row.services_json || '[]');
  } catch {
    services = [];
  }
  try {
    projectTypes = JSON.parse(row.project_types_json || '[]');
  } catch {
    projectTypes = [];
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    business: row.business,
    website: row.website,
    social: row.social,
    services,
    projectTypes,
    description: row.description,
    budgetCurrency: row.budget_currency,
    budgetLabel: row.budget_label,
    timeline: row.timeline,
    status: row.status,
    emailStatus: row.email_status,
    confirmationSent: Boolean(row.confirmation_sent),
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Rebuild the normalized inquiry shape used by email templates.
 *
 * @param {Record<string, unknown>} row
 */
export function rowToNormalizedInquiry(row) {
  const formatted = formatInquiry(row);
  const services = Array.isArray(formatted.services) ? formatted.services : [];
  const projectTypeGroups = Array.isArray(formatted.projectTypes) ? formatted.projectTypes : [];

  return {
    client: {
      name: formatted.name,
      business: formatted.business,
      email: formatted.email,
      phone: formatted.phone,
      website: formatted.website,
      social: formatted.social,
    },
    services,
    serviceTitles: services.map((service) => service.title).filter(Boolean),
    projectTypeGroups,
    projectTypeSummary: projectTypeGroups
      .map((group) => `${group.title} — ${(group.values || []).join(', ')}`)
      .join(' · '),
    description: formatted.description,
    budget: {
      currency: formatted.budgetCurrency,
      rangeLabel: formatted.budgetLabel,
    },
    timeline: formatted.timeline,
  };
}

/**
 * @param {import('better-sqlite3').Database} db
 * @param {{
 *   id: string;
 *   inquiry: import('./normalizeInquiry.js').NormalizedInquiry;
 *   emailStatus?: string;
 *   confirmationSent?: boolean;
 * }} payload
 */
export function insertInquiry(db, { id, inquiry, emailStatus = 'pending', confirmationSent = false }) {
  db.prepare(`
    INSERT INTO inquiries (
      id, name, email, phone, business, website, social,
      services_json, project_types_json, description,
      budget_currency, budget_label, timeline,
      status, email_status, confirmation_sent
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?)
  `).run(
    id,
    inquiry.client.name,
    inquiry.client.email,
    inquiry.client.phone,
    inquiry.client.business,
    inquiry.client.website,
    inquiry.client.social,
    JSON.stringify(inquiry.services),
    JSON.stringify(inquiry.projectTypeGroups),
    inquiry.description,
    inquiry.budget.currency,
    inquiry.budget.rangeLabel,
    inquiry.timeline,
    EMAIL_STATUSES.includes(emailStatus) ? emailStatus : 'pending',
    confirmationSent ? 1 : 0,
  );
}

/**
 * @param {import('better-sqlite3').Database} db
 * @param {string} id
 * @param {{ emailStatus: string; confirmationSent: boolean }} update
 */
export function updateInquiryEmailStatus(db, id, { emailStatus, confirmationSent }) {
  db.prepare(`
    UPDATE inquiries
    SET email_status = ?, confirmation_sent = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(
    EMAIL_STATUSES.includes(emailStatus) ? emailStatus : 'failed',
    confirmationSent ? 1 : 0,
    id,
  );
}

/**
 * @param {string} id
 */
export function getInquiryById(id) {
  return getDb().prepare('SELECT * FROM inquiries WHERE id = ?').get(id) ?? null;
}

import { Router } from 'express';
import { collectMailConfigProblems, env } from '../config/env.js';
import { getDb } from '../db/index.js';
import { sendMail } from '../email/mailer.js';
import { renderBusinessInquiryEmail } from '../email/templates/businessInquiry.js';
import { formatSubmittedAt } from '../inquiry/inquiryId.js';
import {
  EMAIL_STATUSES,
  INQUIRY_STATUSES,
  formatInquiry,
  getInquiryById,
  rowToNormalizedInquiry,
  updateInquiryEmailStatus,
} from '../inquiry/store.js';
import { logActivity, getClientIp } from '../cms/activity.js';
import { requireAuth, requireWrite } from '../middleware/auth.js';
import { asInt, asString } from '../lib/validators.js';
import { describeError, logger } from '../lib/logger.js';

export const inquiriesRouter = Router();

inquiriesRouter.use(requireAuth);

function audit(req, action, resourceId, details = '') {
  logActivity({
    admin: req.admin,
    action,
    resourceType: 'inquiry',
    resourceId,
    details,
    ip: getClientIp(req),
  });
}

function parseDateBound(value, endOfDay) {
  const raw = asString(value);
  if (!raw) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return endOfDay ? `${raw} 23:59:59` : `${raw} 00:00:00`;
  }
  const parsed = Date.parse(raw);
  if (!Number.isFinite(parsed)) return '';
  return new Date(parsed).toISOString();
}

inquiriesRouter.get('/', (req, res) => {
  const db = getDb();
  const search = asString(req.query.search).toLowerCase();
  const status = asString(req.query.status).toLowerCase();
  const emailStatus = asString(req.query.emailStatus).toLowerCase();
  const from = parseDateBound(req.query.from, false);
  const to = parseDateBound(req.query.to, true);
  const page = Math.max(1, asInt(req.query.page, 1));
  const limit = Math.min(100, Math.max(1, asInt(req.query.limit, 20)));
  const offset = (page - 1) * limit;

  const where = [];
  const params = [];

  if (search) {
    where.push(
      `(lower(name) LIKE ? OR lower(email) LIKE ? OR lower(business) LIKE ? OR lower(id) LIKE ?)`,
    );
    const like = `%${search}%`;
    params.push(like, like, like, like);
  }
  if (status && INQUIRY_STATUSES.includes(status)) {
    where.push('status = ?');
    params.push(status);
  }
  if (emailStatus && EMAIL_STATUSES.includes(emailStatus)) {
    where.push('email_status = ?');
    params.push(emailStatus);
  }
  if (from) {
    where.push('created_at >= ?');
    params.push(from);
  }
  if (to) {
    where.push('created_at <= ?');
    params.push(to);
  }

  const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
  const total = db.prepare(`SELECT COUNT(*) AS count FROM inquiries ${whereSql}`).get(...params).count;
  const rows = db
    .prepare(
      `SELECT * FROM inquiries ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    )
    .all(...params, limit, offset);

  return res.json({
    ok: true,
    inquiries: rows.map(formatInquiry),
    pagination: { page, limit, total },
  });
});

inquiriesRouter.get('/:id', (req, res) => {
  const row = getInquiryById(req.params.id);
  if (!row) {
    return res.status(404).json({ ok: false, code: 'not_found', message: 'Inquiry not found.' });
  }
  return res.json({ ok: true, inquiry: formatInquiry(row) });
});

inquiriesRouter.put('/:id', requireWrite, (req, res) => {
  const db = getDb();
  const existing = getInquiryById(req.params.id);
  if (!existing) {
    return res.status(404).json({ ok: false, code: 'not_found', message: 'Inquiry not found.' });
  }

  const nextStatus =
    req.body?.status !== undefined ? asString(req.body.status).toLowerCase() : existing.status;
  if (!INQUIRY_STATUSES.includes(nextStatus)) {
    return res.status(400).json({
      ok: false,
      code: 'validation_failed',
      message: 'That inquiry status is not recognised.',
    });
  }

  const notes =
    req.body?.notes !== undefined ? asString(req.body.notes).slice(0, 4000) : existing.notes;

  db.prepare(`
    UPDATE inquiries
    SET status = ?, notes = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(nextStatus, notes, req.params.id);

  if (nextStatus !== existing.status) {
    let action = 'inquiry_status_changed';
    if (nextStatus === 'archived') action = 'inquiry_archived';
    if (existing.status === 'archived' && nextStatus !== 'archived') action = 'inquiry_reopened';
    audit(req, action, req.params.id, `${existing.status} → ${nextStatus}`);
  }

  const row = getInquiryById(req.params.id);
  return res.json({ ok: true, inquiry: formatInquiry(row) });
});

inquiriesRouter.post('/:id/resend', requireWrite, async (req, res) => {
  const row = getInquiryById(req.params.id);
  if (!row) {
    return res.status(404).json({ ok: false, code: 'not_found', message: 'Inquiry not found.' });
  }

  const problems = collectMailConfigProblems();
  if (problems.length > 0) {
    logger.error('inquiry.resend_mail_unconfigured', { inquiryId: row.id, problems });
    return res.status(503).json({
      ok: false,
      code: 'email_unavailable',
      message: 'Email is not configured, so the notification could not be resent.',
    });
  }

  const inquiry = rowToNormalizedInquiry(row);
  const submittedAt = row.created_at ? new Date(row.created_at) : new Date();
  const submittedAtLabel = formatSubmittedAt(
    Number.isNaN(submittedAt.getTime()) ? new Date() : submittedAt,
    env.mail.timezone,
  );
  const businessEmail = env.mail.businessEmail;
  const clientIsBusiness = inquiry.client.email.toLowerCase() === businessEmail.toLowerCase();

  const businessMessage = renderBusinessInquiryEmail(inquiry, {
    inquiryId: row.id,
    submittedAtLabel,
    businessName: env.mail.businessName,
    siteUrl: env.mail.siteUrl,
  });

  try {
    await sendMail({
      to: businessEmail,
      subject: businessMessage.subject,
      text: businessMessage.text,
      html: businessMessage.html,
      replyTo: clientIsBusiness
        ? undefined
        : { name: inquiry.client.name, address: inquiry.client.email },
      headers: { 'X-MWS-Inquiry-Id': row.id },
    });
  } catch (error) {
    logger.error('inquiry.resend_failed', {
      inquiryId: row.id,
      error: describeError(error),
    });
    updateInquiryEmailStatus(getDb(), row.id, {
      emailStatus: 'failed',
      confirmationSent: Boolean(row.confirmation_sent),
    });
    return res.status(502).json({
      ok: false,
      code: 'send_failed',
      message: 'The notification could not be sent.',
    });
  }

  updateInquiryEmailStatus(getDb(), row.id, {
    emailStatus: 'sent',
    confirmationSent: Boolean(row.confirmation_sent),
  });
  audit(req, 'inquiry_notification_resent', row.id);
  const updated = getInquiryById(row.id);
  return res.json({ ok: true, inquiry: formatInquiry(updated) });
});

inquiriesRouter.delete('/:id', (_req, res) => {
  return res.status(405).json({
    ok: false,
    code: 'not_allowed',
    message: 'Inquiries cannot be deleted. Archive them instead.',
  });
});

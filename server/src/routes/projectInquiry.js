import { Router } from 'express';
import { collectMailConfigProblems, env } from '../config/env.js';
import { getDb } from '../db/index.js';
import { sendMail } from '../email/mailer.js';
import { renderBusinessInquiryEmail } from '../email/templates/businessInquiry.js';
import { renderClientConfirmationEmail } from '../email/templates/clientConfirmation.js';
import { createInquiryId, formatSubmittedAt } from '../inquiry/inquiryId.js';
import { normalizeInquiry } from '../inquiry/normalizeInquiry.js';
import { insertInquiry, updateInquiryEmailStatus } from '../inquiry/store.js';
import { describeError, logger } from '../lib/logger.js';
import { createRateLimiter } from '../lib/rateLimit.js';

const limiter = createRateLimiter({
  windowMs: env.rateLimit.windowMs,
  maxPerKey: env.rateLimit.maxPerIp,
  maxGlobal: env.rateLimit.maxGlobal,
});

export const projectInquiryRouter = Router();

function persistInquiry(db, inquiry, submittedAt) {
  let inquiryId = createInquiryId(submittedAt, env.mail.timezone);
  try {
    insertInquiry(db, { id: inquiryId, inquiry, emailStatus: 'pending', confirmationSent: false });
    return inquiryId;
  } catch (error) {
    if (typeof error?.code === 'string' && error.code.startsWith('SQLITE_CONSTRAINT')) {
      inquiryId = createInquiryId(submittedAt, env.mail.timezone);
      insertInquiry(db, { id: inquiryId, inquiry, emailStatus: 'pending', confirmationSent: false });
      return inquiryId;
    }
    throw error;
  }
}

projectInquiryRouter.post('/project-inquiry', async (req, res) => {
  const key = req.ip ?? 'unknown';
  const limit = limiter.check(key);

  if (!limit.allowed) {
    logger.warn('inquiry.rate_limited', { scope: limit.scope });
    res.set('Retry-After', String(limit.retryAfterSeconds));
    return res.status(429).json({
      ok: false,
      code: 'rate_limited',
      message: 'Too many project briefs from this connection. Please try again shortly.',
      retryAfterSeconds: limit.retryAfterSeconds,
    });
  }

  // Hidden field no human can see or tab into; only automation fills it in.
  const honeypot = typeof req.body?.company === 'string' ? req.body.company.trim() : '';
  if (honeypot) {
    logger.warn('inquiry.honeypot_triggered');
    return res.status(400).json({
      ok: false,
      code: 'rejected',
      message: 'This submission could not be accepted.',
    });
  }

  const result = normalizeInquiry(req.body);
  if (!result.ok) {
    limiter.refund(key);
    return res.status(422).json({
      ok: false,
      code: 'validation_failed',
      message: 'Some details are missing or invalid.',
      errors: result.errors,
    });
  }

  const inquiry = result.data;
  const submittedAt = new Date();
  const submittedAtLabel = formatSubmittedAt(submittedAt, env.mail.timezone);
  const db = getDb();

  let inquiryId;
  try {
    inquiryId = persistInquiry(db, inquiry, submittedAt);
  } catch (error) {
    logger.error('inquiry.persist_failed', { error: describeError(error) });
    return res.status(500).json({
      ok: false,
      code: 'server_error',
      message: 'We could not save your project brief right now.',
    });
  }

  logger.info('inquiry.persisted', {
    inquiryId,
    services: inquiry.services.length,
    hasBudget: Boolean(inquiry.budget.rangeLabel),
    hasTimeline: Boolean(inquiry.timeline),
  });

  const problems = collectMailConfigProblems();
  if (problems.length > 0) {
    logger.error('inquiry.mail_unconfigured', { inquiryId, problems });
    updateInquiryEmailStatus(db, inquiryId, { emailStatus: 'failed', confirmationSent: false });
    return res.status(201).json({
      ok: true,
      inquiryId,
      submittedAt: submittedAt.toISOString(),
      submittedAtLabel,
      confirmationSent: false,
    });
  }

  const businessEmail = env.mail.businessEmail;
  const clientIsBusiness = inquiry.client.email.toLowerCase() === businessEmail.toLowerCase();

  const businessMessage = renderBusinessInquiryEmail(inquiry, {
    inquiryId,
    submittedAtLabel,
    businessName: env.mail.businessName,
    siteUrl: env.mail.siteUrl,
  });

  let emailStatus = 'failed';
  try {
    await sendMail({
      to: businessEmail,
      subject: businessMessage.subject,
      text: businessMessage.text,
      html: businessMessage.html,
      replyTo: clientIsBusiness
        ? undefined
        : { name: inquiry.client.name, address: inquiry.client.email },
      headers: { 'X-MWS-Inquiry-Id': inquiryId },
    });
    emailStatus = 'sent';
    logger.info('inquiry.business_email_sent', { inquiryId });
  } catch (error) {
    logger.error('inquiry.business_email_failed', {
      inquiryId,
      error: describeError(error),
    });
  }

  let confirmationSent = false;
  if (emailStatus === 'sent' && env.mail.sendClientConfirmation && !clientIsBusiness) {
    const confirmation = renderClientConfirmationEmail(inquiry, {
      inquiryId,
      submittedAtLabel,
      businessName: env.mail.businessName,
      businessEmail,
      siteUrl: env.mail.siteUrl,
    });

    try {
      await sendMail({
        to: { name: inquiry.client.name, address: inquiry.client.email },
        subject: confirmation.subject,
        text: confirmation.text,
        html: confirmation.html,
        replyTo: { name: env.mail.businessName, address: businessEmail },
        headers: { 'X-MWS-Inquiry-Id': inquiryId, 'Auto-Submitted': 'auto-replied' },
      });
      confirmationSent = true;
    } catch (error) {
      logger.warn('inquiry.client_confirmation_failed', {
        inquiryId,
        error: describeError(error),
      });
    }
  }

  updateInquiryEmailStatus(db, inquiryId, { emailStatus, confirmationSent });

  return res.status(201).json({
    ok: true,
    inquiryId,
    submittedAt: submittedAt.toISOString(),
    submittedAtLabel,
    confirmationSent,
  });
});

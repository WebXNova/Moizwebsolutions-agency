import { Router } from 'express';
import { collectMailConfigProblems, env } from '../config/env.js';
import { sendMail } from '../email/mailer.js';
import { renderBusinessInquiryEmail } from '../email/templates/businessInquiry.js';
import { renderClientConfirmationEmail } from '../email/templates/clientConfirmation.js';
import { createInquiryId, formatSubmittedAt } from '../inquiry/inquiryId.js';
import { normalizeInquiry } from '../inquiry/normalizeInquiry.js';
import { describeError, logger } from '../lib/logger.js';
import { createRateLimiter } from '../lib/rateLimit.js';

const limiter = createRateLimiter({
  windowMs: env.rateLimit.windowMs,
  maxPerKey: env.rateLimit.maxPerIp,
  maxGlobal: env.rateLimit.maxGlobal,
});

export const projectInquiryRouter = Router();

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

  const problems = collectMailConfigProblems();
  if (problems.length > 0) {
    limiter.refund(key);
    // Details stay in the server log; the visitor only learns it is unavailable.
    logger.error('inquiry.mail_unconfigured', { problems });
    return res.status(503).json({
      ok: false,
      code: 'email_unavailable',
      message: 'Our email service is temporarily unavailable.',
    });
  }

  const inquiry = result.data;
  const submittedAt = new Date();
  const inquiryId = createInquiryId(submittedAt, env.mail.timezone);
  const submittedAtLabel = formatSubmittedAt(submittedAt, env.mail.timezone);

  const businessEmail = env.mail.businessEmail;
  // Guards against the business replying to itself if someone submits the
  // studio's own address as their contact email.
  const clientIsBusiness = inquiry.client.email.toLowerCase() === businessEmail.toLowerCase();

  const businessMessage = renderBusinessInquiryEmail(inquiry, {
    inquiryId,
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
      // Sending identity stays the verified business mailbox; only Reply-To
      // points at the visitor.
      replyTo: clientIsBusiness
        ? undefined
        : { name: inquiry.client.name, address: inquiry.client.email },
      headers: { 'X-MWS-Inquiry-Id': inquiryId },
    });
  } catch (error) {
    logger.error('inquiry.business_email_failed', {
      inquiryId,
      error: describeError(error),
    });
    return res.status(502).json({
      ok: false,
      code: 'send_failed',
      message: 'We could not deliver your project brief right now.',
    });
  }

  logger.info('inquiry.business_email_sent', {
    inquiryId,
    services: inquiry.services.length,
    hasBudget: Boolean(inquiry.budget.rangeLabel),
    hasTimeline: Boolean(inquiry.timeline),
  });

  // The visitor's receipt is a nice-to-have: a failure here must not turn a
  // delivered brief into an error on screen.
  let confirmationSent = false;
  if (env.mail.sendClientConfirmation && !clientIsBusiness) {
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

  return res.status(201).json({
    ok: true,
    inquiryId,
    submittedAt: submittedAt.toISOString(),
    submittedAtLabel,
    confirmationSent,
  });
});

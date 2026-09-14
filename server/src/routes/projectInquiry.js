import { Router } from 'express';
import { env } from '../config/env.js';
import { getDb } from '../db/index.js';
import { createInquiryId, formatSubmittedAt } from '../inquiry/inquiryId.js';
import { normalizeInquiry } from '../inquiry/normalizeInquiry.js';
import { insertInquiry } from '../inquiry/store.js';
import { isDuplicateKeyError } from '../lib/dbErrors.js';
import { createIdempotencyStore, inquiryIdempotencyKey } from '../lib/idempotency.js';
import { describeError, logger } from '../lib/logger.js';
import { createRateLimiter } from '../lib/rateLimit.js';

const limiter = createRateLimiter({
  windowMs: env.rateLimit.windowMs,
  maxPerKey: env.rateLimit.maxPerIp,
  maxGlobal: env.rateLimit.maxGlobal,
});

const idempotency = createIdempotencyStore({ ttlMs: 5 * 60 * 1000 });

export const projectInquiryRouter = Router();

function persistInquiry(db, inquiry, submittedAt) {
  let inquiryId = createInquiryId(submittedAt, env.mail.timezone);
  try {
    insertInquiry(db, { id: inquiryId, inquiry, emailStatus: 'pending', confirmationSent: false });
    return inquiryId;
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      inquiryId = createInquiryId(submittedAt, env.mail.timezone);
      insertInquiry(db, { id: inquiryId, inquiry, emailStatus: 'pending', confirmationSent: false });
      return inquiryId;
    }
    throw error;
  }
}

function inquiryResponse({ inquiryId, submittedAt, submittedAtLabel }) {
  return {
    ok: true,
    inquiryId,
    submittedAt: submittedAt.toISOString(),
    submittedAtLabel,
    confirmationSent: false,
    emailStatus: 'pending',
    notificationSent: false,
  };
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
  const headerKey = typeof req.get('Idempotency-Key') === 'string' ? req.get('Idempotency-Key').trim() : '';
  const replayKey = headerKey || inquiryIdempotencyKey(key, inquiry);

  const payload = await idempotency
    .remember(replayKey, async () => {
      const submittedAt = new Date();
      const submittedAtLabel = formatSubmittedAt(submittedAt, env.mail.timezone);
      const db = getDb();

      let inquiryId;
      try {
        inquiryId = persistInquiry(db, inquiry, submittedAt);
      } catch (error) {
        logger.error('inquiry.persist_failed', { error: describeError(error) });
        const fail = new Error('persist_failed');
        fail.status = 500;
        throw fail;
      }

      logger.info('inquiry.persisted', {
        inquiryId,
        services: inquiry.services.length,
        hasBudget: Boolean(inquiry.budget.rangeLabel),
        hasTimeline: Boolean(inquiry.timeline),
      });

      return inquiryResponse({ inquiryId, submittedAt, submittedAtLabel });
    })
    .catch((error) => {
      if (error?.status === 500 || error?.message === 'persist_failed') {
        return { error: true, status: 500 };
      }
      throw error;
    });

  if (payload?.error) {
    return res.status(500).json({
      ok: false,
      code: 'server_error',
      message: 'We could not save your project brief right now.',
    });
  }

  return res.status(201).json(payload);
});

import { apiConfig, apiUrl } from '@/config/api';

/**
 * The only place the UI talks to the inquiry API.
 *
 * Components call `sendProjectInquiry(form)` and get back a settled result —
 * they never see fetch, status codes or provider details, so swapping the email
 * backend later means changing this file alone.
 */

const ENDPOINT = '/api/project-inquiry';

/** Messages are written for a visitor, never echoing server internals. */
const MESSAGES = {
  offline: 'You appear to be offline. Reconnect and try again — your brief is still here.',
  network:
    'We could not reach our server. Check your connection and try again — nothing has been lost.',
  timeout: 'That took longer than expected. Please try again — your brief is still here.',
  rate_limited: 'That is a few briefs in a row. Please wait a moment and try again.',
  email_unavailable:
    'Our email service is temporarily unavailable. Please try again shortly or send your brief over WhatsApp.',
  validation_failed: 'Some details need another look before we can send your brief.',
  send_failed: 'We could not send your project brief right now. Please try again.',
  unknown: 'Something went wrong while sending your project brief. Please try again.',
};

export class ProjectInquiryError extends Error {
  /**
   * @param {string} code
   * @param {string} message
   * @param {{ fieldErrors?: Record<string, string> }} [options]
   */
  constructor(code, message, options = {}) {
    super(message);
    this.name = 'ProjectInquiryError';
    this.code = code;
    this.fieldErrors = options.fieldErrors ?? {};
  }
}

/**
 * Shapes the wizard state into the request body. Only ids and free text are
 * sent; the server resolves every label from its own catalog.
 *
 * @param {import('@/lib/buildProjectInquiryMessage').InquiryForm} form
 * @param {string} [honeypot]
 */
export function buildInquiryRequest(form, honeypot = '') {
  return {
    services: form.services ?? [],
    projectTypes: form.projectTypes ?? {},
    description: form.description?.trim() ?? '',
    currency: form.currency ?? '',
    budget: form.budget ?? '',
    timeline: form.timeline ?? '',
    name: form.name?.trim() ?? '',
    business: form.business?.trim() ?? '',
    email: form.email?.trim() ?? '',
    phone: form.phone?.trim() ?? '',
    website: form.website?.trim() ?? '',
    social: form.social?.trim() ?? '',
    company: honeypot,
  };
}

/**
 * Delivers the project brief to the Moiz Web Solutions inbox.
 *
 * Resolves only when the server confirms the email was accepted, so the caller
 * can never show success for a message that did not go out.
 *
 * @param {import('@/lib/buildProjectInquiryMessage').InquiryForm} form
 * @param {{ honeypot?: string; signal?: AbortSignal }} [options]
 * @returns {Promise<{ inquiryId: string; submittedAt: string; submittedAtLabel: string; confirmationSent: boolean }>}
 */
export async function sendProjectInquiry(form, options = {}) {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new ProjectInquiryError('offline', MESSAGES.offline);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort('timeout'), apiConfig.timeoutMs);
  options.signal?.addEventListener('abort', () => controller.abort(options.signal?.reason), {
    once: true,
  });

  /** @type {Response} */
  let response;
  try {
    response = await fetch(apiUrl(ENDPOINT), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(buildInquiryRequest(form, options.honeypot)),
      signal: controller.signal,
    });
  } catch (error) {
    if (controller.signal.aborted && controller.signal.reason === 'timeout') {
      throw new ProjectInquiryError('timeout', MESSAGES.timeout);
    }
    if (controller.signal.aborted) throw error;
    throw new ProjectInquiryError('network', MESSAGES.network);
  } finally {
    clearTimeout(timer);
  }

  const contentType = response.headers.get('content-type') ?? '';
  const payload = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : null;

  if (!response.ok || !payload?.ok) {
    const code =
      payload?.code ?? (response.status >= 500 || response.status === 404 ? 'email_unavailable' : 'unknown');
    throw new ProjectInquiryError(code, MESSAGES[code] ?? MESSAGES.unknown, {
      fieldErrors: payload?.errors,
    });
  }

  return {
    inquiryId: payload.inquiryId,
    submittedAt: payload.submittedAt,
    submittedAtLabel: payload.submittedAtLabel,
    confirmationSent: Boolean(payload.confirmationSent),
  };
}

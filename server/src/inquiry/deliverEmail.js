import { collectMailConfigProblems, env } from '../config/env.js';
import { sendMail } from '../email/mailer.js';
import { renderBusinessInquiryEmail } from '../email/templates/businessInquiry.js';
import { renderClientConfirmationEmail } from '../email/templates/clientConfirmation.js';
import { describeError, logger } from '../lib/logger.js';
import { updateInquiryEmailStatus } from './store.js';

/**
 * Attempt delivery through the existing nodemailer SMTP transport.
 * Never deletes the inquiry row. Records sent or failed from the transport result.
 *
 * @param {import('better-sqlite3').Database} db
 * @param {import('./normalizeInquiry.js').NormalizedInquiry} inquiry
 * @param {string} inquiryId
 * @param {string} submittedAtLabel
 * @returns {Promise<{ emailStatus: 'sent' | 'failed'; confirmationSent: boolean }>}
 */
export async function deliverInquiryEmail(db, inquiry, inquiryId, submittedAtLabel) {
  const problems = collectMailConfigProblems();
  if (problems.length > 0) {
    logger.error('inquiry.mail_unconfigured', { inquiryId, problems });
    updateInquiryEmailStatus(db, inquiryId, { emailStatus: 'failed', confirmationSent: false });
    return { emailStatus: 'failed', confirmationSent: false };
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
  return { emailStatus, confirmationSent };
}

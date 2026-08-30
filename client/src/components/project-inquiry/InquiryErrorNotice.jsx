import { GhostAction } from '@/components/project-inquiry/InquiryActions';
import { AlertIcon, MailIcon, WhatsAppIcon } from '@/lib/icons';

/**
 * Failure state for the review screen.
 *
 * Shown instead of the success screen when the server did not accept the brief.
 * The wizard keeps every answer behind it, so the offered routes out are retry
 * or an alternate channel — never "start again".
 *
 * @param {{
 *   message: string;
 *   whatsappHref?: string;
 *   mailtoHref?: string;
 * }} props
 */
export function InquiryErrorNotice({ message, whatsappHref, mailtoHref }) {
  return (
    <div
      role="alert"
      className="mb-6 rounded-lg border border-danger/35 bg-danger/[0.06] p-5 motion-safe:animate-fade-up motion-reduce:animate-none"
    >
      <div className="flex items-start gap-3">
        <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
        <div className="min-w-0">
          <p className="text-[0.8125rem] font-medium text-ink">
            We couldn&rsquo;t send your project brief
          </p>
          <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-muted">{message}</p>
          <p className="mt-1.5 text-[0.75rem] leading-relaxed text-ink-faint">
            Everything you entered is still here &mdash; nothing was lost.
          </p>

          {whatsappHref || mailtoHref ? (
            <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
              {whatsappHref ? (
                <GhostAction
                  href={whatsappHref}
                  icon={<WhatsAppIcon className="h-3.5 w-3.5" />}
                  className="w-full sm:w-auto"
                >
                  Send via WhatsApp
                </GhostAction>
              ) : null}

              {mailtoHref ? (
                <GhostAction
                  href={mailtoHref}
                  icon={<MailIcon className="h-3.5 w-3.5" />}
                  className="w-full sm:w-auto"
                >
                  Open in email app
                </GhostAction>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

import { inquiryContent } from '@/data/projectInquiry';
import { GhostAction } from '@/components/project-inquiry/InquiryActions';
import { summarizeInquiry } from '@/lib/buildProjectInquiryMessage';
import { CheckIcon, WhatsAppIcon } from '@/lib/icons';
import { cn } from '@/lib/cn';

/**
 * Shown after the inquiry API confirms the brief was saved.
 *
 * @param {{
 *   form: import('@/lib/buildProjectInquiryMessage').InquiryForm;
 *   receipt: { inquiryId: string; submittedAtLabel: string; confirmationSent?: boolean } | null;
 *   whatsappHref?: string;
 *   onClose: () => void;
 * }} props
 */
export function ProjectSuccess({ form, receipt, whatsappHref, onClose }) {
  const { serviceTitles, budget, timeline } = summarizeInquiry(form);

  const facts = [
    ['Services', serviceTitles.join(', ')],
    ['Budget', budget || 'Not specified'],
    ['Timeline', timeline || 'Not specified'],
    ['Submitted', receipt?.submittedAtLabel],
  ].filter(([, value]) => Boolean(value));

  return (
    <div className="mx-auto max-w-xl text-center">
      <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full border border-brand-yellow/35 motion-safe:animate-success-ring motion-reduce:animate-none"
        />
        <span
          aria-hidden="true"
          className="absolute inset-2 rounded-full bg-brand-yellow/12 motion-safe:animate-success-ring motion-reduce:animate-none"
          style={{ animationDelay: '90ms' }}
        />
        <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-brand-yellow text-brand-ink motion-safe:animate-check-pop motion-reduce:animate-none">
          <CheckIcon className="h-4 w-4" />
        </span>
      </div>

      <h3 className="mt-7 text-[1.375rem] font-semibold tracking-[-0.02em] text-ink sm:text-[1.625rem]">
        {inquiryContent.successTitle}
      </h3>
      <p className="mx-auto mt-3 max-w-md text-[0.8125rem] leading-relaxed text-gray-700 dark:text-neutral-300">
        {inquiryContent.successSubtitle}
      </p>

      {receipt?.inquiryId ? (
        <p className="mt-5">
          <span className="block text-[0.5625rem] uppercase tracking-[0.18em] text-gray-600 dark:text-neutral-400">
            Inquiry ID
          </span>
          <span className="mt-2 inline-block rounded-sm border border-brand-yellow bg-brand-yellow/15 px-3 py-1.5 font-mono text-[0.75rem] font-semibold tracking-[0.08em] text-ink">
            {receipt.inquiryId}
          </span>
        </p>
      ) : null}

      <dl className="mt-8 divide-y divide-hairline rounded-lg border border-hairline bg-panel-soft text-left">
        {facts.map(([label, value], index) => (
          <div
            key={label}
            style={{ animationDelay: `${120 + index * 70}ms` }}
            className={cn(
              'flex flex-col gap-1 px-5 py-3.5 sm:flex-row sm:items-baseline sm:gap-6',
              'motion-safe:animate-fade-up motion-reduce:animate-none',
            )}
          >
            <dt className="shrink-0 text-[0.5625rem] uppercase tracking-[0.16em] text-gray-600 dark:text-neutral-400 sm:w-28">
              {label}
            </dt>
            <dd className="break-words text-[0.8125rem] text-ink">{value}</dd>
          </div>
        ))}
      </dl>

      {receipt?.confirmationSent ? (
        <p className="mx-auto mt-5 max-w-md text-[0.75rem] leading-relaxed text-gray-700 dark:text-neutral-300">
          {inquiryContent.confirmationNote}
        </p>
      ) : null}

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        {whatsappHref ? (
          <GhostAction
            href={whatsappHref}
            icon={<WhatsAppIcon className="h-3.5 w-3.5" />}
            className="w-full sm:w-auto"
          >
            Send via WhatsApp
          </GhostAction>
        ) : null}

        <GhostAction onClick={onClose} className="w-full sm:w-auto">
          Close
        </GhostAction>
      </div>
    </div>
  );
}

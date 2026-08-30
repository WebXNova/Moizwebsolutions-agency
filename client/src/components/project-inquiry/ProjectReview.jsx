import { summarizeInquiry } from '@/lib/buildProjectInquiryMessage';
import { cn } from '@/lib/cn';

/**
 * @param {{
 *   form: import('@/lib/buildProjectInquiryMessage').InquiryForm;
 *   onEditStep: (index: number) => void;
 * }} props
 */
export function ProjectReview({ form, onEditStep }) {
  const { serviceTitles, projectTypeGroups, budget, timeline } = summarizeInquiry(form);

  const blocks = [
    {
      label: 'Services',
      step: 0,
      span: 'lg:col-span-2',
      content: (
        <div className="flex flex-wrap gap-2">
          {serviceTitles.map((title) => (
            <span
              key={title}
              className="rounded-full border border-brand-yellow/45 bg-brand-yellow/10 px-3 py-1.5 text-[0.6875rem] font-medium text-ink"
            >
              {title}
            </span>
          ))}
        </div>
      ),
    },
    {
      label: 'Project',
      step: 1,
      span: 'lg:col-span-2',
      content: (
        <div className="space-y-3">
          {projectTypeGroups.length > 0 ? (
            <p className="text-[0.75rem] leading-relaxed text-ink-muted">
              {projectTypeGroups
                .map((group) => `${group.title} — ${group.values.join(', ')}`)
                .join(' · ')}
            </p>
          ) : null}
          <p className="text-[0.8125rem] leading-[1.75] whitespace-pre-line text-ink-soft">
            {form.description}
          </p>
        </div>
      ),
    },
    {
      label: 'Budget & timeline',
      step: 1,
      content: (
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div>
            <dt className="text-[0.5625rem] uppercase tracking-[0.16em] text-ink-faint">
              Budget ({form.currency})
            </dt>
            <dd className="mt-1.5 text-[0.8125rem] text-ink">{budget || 'Not specified'}</dd>
          </div>
          <div>
            <dt className="text-[0.5625rem] uppercase tracking-[0.16em] text-ink-faint">
              Timeline
            </dt>
            <dd className="mt-1.5 text-[0.8125rem] text-ink">{timeline || 'Not specified'}</dd>
          </div>
        </dl>
      ),
    },
    {
      label: 'Contact',
      step: 2,
      content: (
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            ['Name', form.name],
            ['Business', form.business],
            ['Email', form.email],
            ['WhatsApp / phone', form.phone],
            ['Website', form.website],
            ['Profile link', form.social],
          ]
            .filter(([, value]) => Boolean(value))
            .map(([label, value]) => (
              <div key={label}>
                <dt className="text-[0.5625rem] uppercase tracking-[0.16em] text-ink-faint">
                  {label}
                </dt>
                <dd className="mt-1.5 break-words text-[0.8125rem] text-ink">{value}</dd>
              </div>
            ))}
        </dl>
      ),
    },
  ];

  return (
    <div className="mx-auto grid max-w-4xl grid-cols-1 gap-3 lg:grid-cols-2">
      {blocks.map((block, index) => (
        <section
          key={block.label}
          style={{ animationDelay: `${index * 70}ms` }}
          className={cn(
            'rounded-lg border border-hairline bg-panel-soft p-5',
            'motion-safe:animate-fade-up motion-reduce:animate-none',
            block.span,
          )}
        >
          <div className="mb-3.5 flex items-center justify-between gap-4">
            <h4 className="text-[0.625rem] font-medium uppercase tracking-[0.18em] text-ink-muted">
              {block.label}
            </h4>
            <button
              type="button"
              onClick={() => onEditStep(block.step)}
              className="text-[0.625rem] uppercase tracking-[0.12em] text-brand-blue underline decoration-brand-blue/30 decoration-1 underline-offset-4 transition-colors hover:decoration-brand-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow"
            >
              Edit
            </button>
          </div>
          {block.content}
        </section>
      ))}
    </div>
  );
}

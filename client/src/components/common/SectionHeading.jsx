import { cn } from '@/lib/cn';

/**
 * Editorial section heading: a small tracked eyebrow, a light display title
 * and an optional muted subtitle placed opposite the title on wide screens.
 *
 * @param {{
 *   eyebrow?: string;
 *   title?: string;
 *   subtitle?: string;
 *   className?: string;
 *   align?: 'left' | 'center';
 * }} props
 */
export function SectionHeading({ eyebrow, title, subtitle, className, align = 'left' }) {
  return (
    <div
      className={cn(
        align === 'center' && 'text-center',
        subtitle && align === 'left'
          ? 'grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-8'
          : null,
        className,
      )}
    >
      <div className={cn(align === 'left' && subtitle && 'lg:col-span-7')}>
        {eyebrow ? (
          <p className="text-meta uppercase tracking-[0.22em] text-muted-foreground">{eyebrow}</p>
        ) : null}
        {title ? (
          <h2
            className={cn(
              'max-w-[14ch] whitespace-pre-line text-section font-light leading-[1.04] tracking-[-0.035em] text-foreground',
              eyebrow && 'mt-5',
            )}
          >
            {title}
          </h2>
        ) : null}
      </div>
      {subtitle ? (
        <p
          className={cn(
            'max-w-[26rem] text-body leading-[1.8] text-secondary-foreground lg:col-span-4 lg:col-start-9',
            align === 'center' && 'mx-auto',
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

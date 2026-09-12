import { TestimonialStarRow } from '@/components/testimonials/TestimonialStarRow';
import { REVIEW_CTA_CLASS } from '@/components/testimonials/reviewCta';
import { cn } from '@/lib/cn';

/**
 * @param {{
 *   intro: import('@/data/testimonialSlider').TestimonialIntroContent;
 *   onLeaveReview: () => void;
 * }} props
 */
export function TestimonialIntroCard({ intro, onLeaveReview }) {
  return (
    <article className="flex h-full min-w-0 flex-col rounded-3xl bg-white p-6 shadow-[0_16px_40px_-18px_rgb(0_0_0_/_0.12)] sm:p-8 dark:bg-surface-elevated">
      <h3 className="max-w-[18ch] font-display text-[1.25rem] font-bold leading-[1.25] tracking-[-0.03em] text-brand-ink dark:text-foreground sm:text-[1.6rem]">
        {intro.heading}
      </h3>

      <p className="mt-6 break-words font-serif text-[clamp(1.65rem,2.4vw,2.25rem)] font-medium italic leading-[1.05] tracking-[-0.03em] text-foreground">
        {intro.brand}
        <sup className="ml-0.5 align-super font-sans text-[0.7rem] font-semibold not-italic tracking-normal">
          ®
        </sup>
      </p>

      <div className="mt-8 flex items-center gap-3 sm:mt-10">
        <div className="flex shrink-0">
          {intro.avatars.map((src, index) => (
            <img
              key={`${src}-${index}`}
              src={src}
              alt=""
              width={36}
              height={36}
              loading="lazy"
              decoding="async"
              className={cn(
                'h-9 w-9 rounded-full border-2 border-white object-cover dark:border-surface-elevated',
                index > 0 && '-ml-2.5',
              )}
            />
          ))}
        </div>
        <div className="min-w-0">
          <TestimonialStarRow size="md" />
          <p className="mt-1 text-[0.75rem] leading-snug text-secondary-foreground">{intro.proofLabel}</p>
        </div>
      </div>

      <button type="button" onClick={onLeaveReview} className={cn(REVIEW_CTA_CLASS, 'mt-8 w-full')}>
        {intro.ctaLabel}
      </button>
    </article>
  );
}

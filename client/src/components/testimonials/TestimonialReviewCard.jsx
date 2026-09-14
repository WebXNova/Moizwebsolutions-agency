import { TestimonialStarRow } from '@/components/testimonials/TestimonialStarRow';

/**
 * @param {{
 *   review: import('@/data/testimonialSlider').TestimonialReview;
 * }} props
 */
export function TestimonialReviewCard({ review }) {
  return (
    <article className="flex h-[22.5rem] w-[min(18.75rem,calc(100vw-2.5rem))] shrink-0 flex-col rounded-3xl bg-white p-6 shadow-[0_16px_40px_-18px_rgb(0_0_0_/_0.12)] sm:h-[24rem] sm:w-[20.5rem] sm:p-8 dark:bg-surface-elevated">
      <blockquote className="font-display text-[1.15rem] font-semibold leading-[1.35] tracking-[-0.028em] text-foreground sm:text-[1.25rem]">
        {review.quote}
      </blockquote>

      <TestimonialStarRow className="mt-5" />

      <footer className="mt-auto flex items-center gap-3">
        <img
          src={review.avatar}
          alt=""
          width={40}
          height={40}
          loading="lazy"
          decoding="async"
          className="h-10 w-10 shrink-0 rounded-full object-cover"
        />
        <div className="min-w-0">
          <p className="truncate text-[0.9375rem] font-semibold tracking-[-0.015em] text-foreground">
            {review.name}
          </p>
          <p className="truncate text-[0.8125rem] text-secondary-foreground">{review.company}</p>
        </div>
      </footer>
    </article>
  );
}

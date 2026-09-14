import { TestimonialReviewCard } from '@/components/testimonials/TestimonialReviewCard';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/cn';

/**
 * @param {{
 *   reviews: import('@/data/testimonialSlider').TestimonialReview[];
 *   duplicate?: boolean;
 * }} props
 */
function ReviewSet({ reviews, duplicate = false }) {
  return (
    <div
      aria-hidden={duplicate || undefined}
      inert={duplicate || undefined}
      className="flex shrink-0 items-stretch gap-5 pr-5 sm:gap-6 sm:pr-6"
    >
      {reviews.map((review) => (
        <TestimonialReviewCard
          key={duplicate ? `${review.id}-loop` : review.id}
          review={review}
        />
      ))}
    </div>
  );
}

/**
 * Infinite review marquee for the right column. The track is two identical
 * sets; a 50% translate loops without a gap. Hover pauses immediately.
 *
 * @param {{
 *   reviews: import('@/data/testimonialSlider').TestimonialReview[];
 *   revealed?: boolean;
 * }} props
 */
export function TestimonialSlider({ reviews, revealed = true }) {
  const reduceMotion = useReducedMotion();
  const duration = `${Math.max(28, reviews.length * 7)}s`;

  if (!reviews.length) return null;

  if (reduceMotion) {
    return (
      <div className="flex gap-5 overflow-x-auto pb-2">
        <ReviewSet reviews={reviews} />
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="Client reviews"
      className={cn(
        'group/slider w-full max-w-full overflow-hidden py-3',
        '[mask-image:linear-gradient(to_right,transparent_0%,#000_8%,#000_92%,transparent_100%)]',
        '[-webkit-mask-image:linear-gradient(to_right,transparent_0%,#000_8%,#000_92%,transparent_100%)]',
        revealed ? 'motion-safe:animate-reveal-up' : 'motion-safe:opacity-0',
      )}
    >
      <div
        className={cn(
          'flex w-max',
          '[--marquee-from:0] [--marquee-to:-50%]',
          revealed && 'motion-safe:animate-tech-marquee motion-reduce:animate-none',
          'hover-capable:group-hover/slider:[animation-play-state:paused]',
          'group-focus-within/slider:[animation-play-state:paused]',
        )}
        style={{ '--marquee-duration': duration }}
      >
        <ReviewSet reviews={reviews} />
        <ReviewSet reviews={reviews} duplicate />
      </div>
    </div>
  );
}

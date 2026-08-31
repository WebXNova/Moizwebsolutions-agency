import { Link } from 'react-router-dom';
import { FeatureCard } from '@/components/features/FeatureCard';
import { BoltIcon, CheckIcon } from '@/lib/icons';
import { cn } from '@/lib/cn';
import { useMagnetic } from '@/hooks/useMagnetic';

/**
 * @param {{
 *   content: typeof import('@/data/featureHighlights').featureHighlightsContent;
 *   revealed?: boolean;
 *   delay?: number;
 *   className?: string;
 * }} props
 */
export function FocusCard({ content, revealed = false, delay = 0, className }) {
  const { ref, onPointerMove, onPointerLeave, onBlur } = useMagnetic({ strength: 0.1 });

  return (
    <FeatureCard
      variant="accent"
      revealed={revealed}
      delay={delay}
      className={cn('lg:min-h-[22rem]', className)}
    >
      <svg
        viewBox="0 0 100 100"
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 top-1/2 h-[130%] w-[78%] -translate-y-1/2 text-white/[0.08]"
      >
        <path
          d="M22 18 82 82M82 18 22 82"
          fill="none"
          stroke="currentColor"
          strokeWidth="16"
          strokeLinecap="round"
        />
      </svg>

      <h3 className="relative max-w-[14.5rem] font-display text-[1.45rem] font-semibold leading-[1.2] tracking-[-0.03em] text-white sm:text-[1.55rem]">
        {content.focusHeading}
        <span className="mt-1 block font-medium text-white/90">{content.focusSubheading}</span>
      </h3>

      <ul className="relative mt-6 flex flex-col gap-3">
        {content.advantages.map((item) => (
          <li key={item} className="flex items-center gap-2.5 text-[0.9375rem] font-medium text-white">
            <span
              aria-hidden="true"
              className={cn(
                'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20',
                'transition-transform duration-300 ease-out motion-safe:group-hover:translate-x-0.5',
              )}
            >
              <CheckIcon className="h-3.5 w-3.5 text-white" />
            </span>
            {item}
          </li>
        ))}
      </ul>

      <Link
        ref={ref}
        to={content.ctaHref}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onBlur={onBlur}
        className={cn(
          'group/cta relative isolate mt-auto inline-flex w-full items-center justify-center gap-2 overflow-hidden',
          'rounded-xl bg-white px-4 py-3.5 text-[0.9375rem] font-semibold text-brand-ink',
          'transition-[transform,box-shadow] duration-300 ease-out will-change-transform',
          'hover:shadow-[0_10px_24px_-14px_rgb(255_255_255_/_0.8)]',
          'motion-safe:active:scale-[0.98] motion-reduce:active:scale-100',
          'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white',
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-0 -translate-x-full skew-x-[-14deg]',
            'bg-gradient-to-r from-transparent via-brand-yellow/45 to-transparent',
            'motion-safe:group-hover/cta:animate-cta-shine motion-reduce:hidden',
          )}
        />
        <BoltIcon
          aria-hidden="true"
          className="relative h-4 w-4 transition-transform duration-300 ease-out motion-safe:group-hover/cta:-translate-y-0.5"
        />
        <span className="relative">{content.ctaLabel}</span>
      </Link>
    </FeatureCard>
  );
}

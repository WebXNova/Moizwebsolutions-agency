import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { useMagnetic } from '@/hooks/useMagnetic';

/**
 * Yellow CTA matching the portfolio reference design.
 */
export function ExploreAllCTA() {
  const { ref, onPointerMove, onPointerLeave, onBlur } = useMagnetic({ strength: 0.14 });

  return (
    <div className="flex justify-center">
      <Link
        ref={/** @type {import('react').Ref<HTMLAnchorElement>} */ (ref)}
        to="/portfolio"
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onBlur={onBlur}
        className={cn(
          'group relative isolate inline-block overflow-hidden rounded-sm bg-brand-yellow px-10 py-4',
          'text-cta font-semibold uppercase tracking-[0.14em] text-brand-ink',
          'transition-colors will-change-transform hover:bg-brand-yellow-deep',
          'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring',
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-0 -translate-x-full skew-x-[-14deg]',
            'bg-gradient-to-r from-transparent via-white/50 to-transparent',
            'motion-safe:group-hover:animate-cta-shine motion-reduce:hidden',
          )}
        />
        <span className="relative">Explore All Success Stories</span>
      </Link>
    </div>
  );
}

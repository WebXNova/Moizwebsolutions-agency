import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { useMagnetic } from '@/hooks/useMagnetic';

/**
 * Yellow CTA for the new Our Works section only.
 * Magnetic follow + shine sweep — label and destination unchanged.
 */
export function NewPortfolioCTA() {
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
          'group relative isolate inline-block max-w-full overflow-hidden rounded-sm bg-brand-yellow px-5 py-3.5 text-center sm:px-10 sm:py-4',
          'text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-brand-ink sm:text-[0.75rem] sm:tracking-[0.14em]',
          'transition-[background-color,opacity] will-change-transform hover:bg-brand-yellow-deep hover:opacity-85',
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

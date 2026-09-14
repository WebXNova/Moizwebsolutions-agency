import { cn } from '@/lib/cn';

/**
 * Editorial typographic “sticker” — clean brand-blue marker (no underline).
 *
 * @param {{
 *   children: import('react').ReactNode;
 *   className?: string;
 *   delayMs?: number;
 *   reduced?: boolean;
 * }} props
 */
export function HeroMark({ children, className, delayMs = 0, reduced = false }) {
  return (
    <span
      className={cn(
        'hero-mark relative mx-[0.02em] inline-block max-w-full align-baseline sm:mx-[0.06em]',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'hero-mark-fill absolute inset-y-[0.08em] -inset-x-[0.1em] -z-0 sm:-inset-x-[0.18em]',
          'origin-left rounded-[0.18em] bg-brand-blue',
          'shadow-[0_10px_28px_-16px_rgb(37_99_235_/_0.55)]',
          'rotate-[-1.4deg] skew-x-[-2deg]',
          !reduced && 'motion-safe:animate-hero-mark-draw',
        )}
        style={!reduced ? { animationDelay: `${delayMs}ms` } : undefined}
      />
      <span
        className={cn(
          'relative z-[1] px-[0.22em] py-[0.02em] font-medium text-white',
          !reduced && 'motion-safe:animate-hero-mark-text',
        )}
        style={!reduced ? { animationDelay: `${delayMs + 90}ms` } : undefined}
      >
        {children}
      </span>
    </span>
  );
}

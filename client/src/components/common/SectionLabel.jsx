import { cn } from '@/lib/cn';

/**
 * Centered section label flanked by hairline rules — matches the editorial
 * band headings used in the trusted-companies and testimonials sections.
 *
 * @param {{
 *   children: import('react').ReactNode;
 *   className?: string;
 *   uppercase?: boolean;
 *   motion?: boolean;
 *   active?: boolean;
 *   reduced?: boolean;
 * }} props
 */
export function SectionLabel({
  children,
  className,
  uppercase = true,
  motion = false,
  active = false,
  reduced = false,
}) {
  const play = motion && active && !reduced;
  const pending = motion && !active && !reduced;

  return (
    <div
      className={cn(
        'flex items-center justify-center gap-3 py-7 sm:gap-4 sm:py-9 md:gap-6 md:py-11',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'h-px w-6 origin-left bg-current/15 sm:w-16 md:w-24 lg:w-32',
          play && 'animate-line-reveal',
          pending && 'scale-x-0',
        )}
        style={play ? { animationDelay: '40ms' } : undefined}
      />
      <h2
        className={cn(
          'min-w-0 max-w-[min(100%,14rem)] text-center text-[0.625rem] font-bold tracking-[0.16em] text-current/75 sm:max-w-none sm:text-[0.6875rem] sm:tracking-[0.22em]',
          uppercase && 'uppercase',
          motion && 'overflow-hidden',
        )}
      >
        {motion ? (
          <span
            className={cn(
              'block',
              play && 'animate-band-heading',
              pending && 'translate-y-[0.75em] opacity-0',
            )}
            style={play ? { animationDelay: '120ms' } : undefined}
          >
            {children}
          </span>
        ) : (
          children
        )}
      </h2>
      <span
        aria-hidden="true"
        className={cn(
          'h-px w-6 origin-left bg-current/15 sm:w-16 md:w-24 lg:w-32',
          play && 'animate-line-reveal',
          pending && 'scale-x-0',
        )}
        style={play ? { animationDelay: '210ms' } : undefined}
      />
    </div>
  );
}

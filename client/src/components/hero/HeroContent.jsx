import { HeroCTA } from '@/components/hero/HeroCTA';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/cn';

/**
 * @param {{
 *   titleLines: string[];
 *   paragraph: string;
 *   cta: { label: string };
 *   onCtaClick?: () => void;
 * }} props
 */
export function HeroContent({ titleLines, paragraph, cta, onCtaClick }) {
  const reduced = usePrefersReducedMotion();

  return (
    <div>
      <h1
        aria-label={titleLines.join(' ')}
        className={cn(
          'max-w-[12ch] font-light leading-[0.95] tracking-[-0.035em] text-foreground',
          'text-[clamp(2.45rem,6.4vw,5.5rem)] sm:max-w-[13ch] md:max-w-[14ch]',
        )}
      >
        {titleLines.map((line, lineIndex) => {
          const isLast = lineIndex === titleLines.length - 1;

          return (
            <span key={`${line}-${lineIndex}`} className="block overflow-hidden py-[0.02em]">
              <span
                className={cn(
                  'block text-balance',
                  !reduced && 'motion-safe:animate-band-heading',
                  isLast && !reduced && 'fx-shimmer-text motion-safe:animate-text-shimmer',
                )}
                style={!reduced ? { animationDelay: `${lineIndex * 130}ms` } : undefined}
              >
                {line}
              </span>
            </span>
          );
        })}
      </h1>

      <p
        className={cn(
          'mt-8 max-w-[32rem] text-[clamp(0.9375rem,1.6vw,1.0625rem)] leading-[1.75] text-secondary-foreground sm:mt-9 md:mt-10',
          !reduced && 'motion-safe:animate-hero-copy',
        )}
      >
        {paragraph}
        {reduced ? null : (
          <span
            aria-hidden="true"
            className="ml-0.5 inline-block h-[0.85em] w-px translate-y-[0.08em] bg-brand-yellow align-middle motion-safe:animate-caret-blink"
          />
        )}
      </p>

      <HeroCTA onClick={onCtaClick} className="mt-9 sm:mt-10 md:mt-11">
        {cta.label}
      </HeroCTA>
    </div>
  );
}

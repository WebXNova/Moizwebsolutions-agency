import { HeroCTA } from '@/components/hero/HeroCTA';
import { HeroHeadline } from '@/components/hero/HeroHeadline';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/cn';

/**
 * @param {{
 *   titleLines: string[];
 *   paragraph: string;
 *   cta: { label: string };
 *   secondaryCta?: { label?: string; url?: string };
 *   onCtaClick?: () => void;
 * }} props
 */
export function HeroContent({ titleLines, paragraph, cta, secondaryCta, onCtaClick }) {
  const reduced = usePrefersReducedMotion();
  const secondaryLabel = secondaryCta?.label?.trim();

  return (
    <div>
      <HeroHeadline titleLines={titleLines} />

      <p
        className={cn(
          'mt-6 max-w-[32rem] text-[0.9375rem] leading-[1.65] text-secondary-foreground sm:mt-9 sm:text-[clamp(0.9375rem,1.6vw,1.0625rem)] sm:leading-[1.75] md:mt-10',
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

      <div className="mt-7 flex flex-wrap items-center gap-4 sm:mt-10 sm:gap-5 md:mt-11">
        <HeroCTA onClick={onCtaClick}>{cta.label}</HeroCTA>
        {secondaryLabel ? (
          secondaryCta.url ? (
            <a
              href={secondaryCta.url}
              className="text-[13px] font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              {secondaryLabel}
            </a>
          ) : (
            <button
              type="button"
              onClick={onCtaClick}
              className="text-[13px] font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              {secondaryLabel}
            </button>
          )
        ) : null}
      </div>
    </div>
  );
}

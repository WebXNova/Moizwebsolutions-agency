import { FeatureCard } from '@/components/features/FeatureCard';
import { cn } from '@/lib/cn';

/**
 * @param {{
 *   content: typeof import('@/data/featureHighlights').featureHighlightsContent;
 *   revealed?: boolean;
 *   delay?: number;
 *   className?: string;
 * }} props
 */
export function SupportCard({ content, revealed = false, delay = 0, className }) {
  return (
    <FeatureCard revealed={revealed} delay={delay} className={cn('lg:min-h-[22rem]', className)}>
      <p className="font-mono text-[0.6875rem] tracking-[0.08em] text-ink-faint">{content.supportLabel}</p>

      <div className="flex flex-1 items-center py-6">
        <p
          className={cn(
            'font-display text-[clamp(4.25rem,9vw,5.75rem)] font-semibold leading-none tracking-[-0.06em] text-foreground',
            'transition-transform duration-300 ease-out',
            'motion-safe:group-hover:-translate-y-0.5',
          )}
        >
          <SupportValue value={content.supportValue} />
        </p>
      </div>

      <p className="flex items-start gap-2.5 text-[0.875rem] leading-[1.55] text-muted-foreground">
        <span
          aria-hidden="true"
          className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-feature-lime"
        />
        <span>{content.supportDescription}</span>
      </p>
    </FeatureCard>
  );
}

/**
 * Renders `24h` with the hour letter in the accent blue from the third card.
 * @param {{ value: string }} props
 */
function SupportValue({ value }) {
  const match = value.match(/^(.*?)([hH])$/);

  if (!match) return value;

  return (
    <>
      {match[1]}
      <span className="text-feature-blue">{match[2]}</span>
    </>
  );
}

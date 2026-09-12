import { useState } from 'react';
import { FeatureCard } from '@/components/features/FeatureCard';
import { CurrencyToggle } from '@/components/project-inquiry/CurrencyToggle';
import {
  featurePricing,
  formatFeaturePriceLine,
} from '@/data/featureHighlights';
import { cn } from '@/lib/cn';

/**
 * @param {{
 *   content: typeof import('@/data/featureHighlights').featureHighlightsContent;
 *   revealed?: boolean;
 *   delay?: number;
 *   className?: string;
 * }} props
 */
export function CostValueCard({ content, revealed = false, delay = 0, className }) {
  const [currency, setCurrency] = useState(/** @type {'PKR' | 'USD'} */ (featurePricing.currency));
  const othersPrice = formatFeaturePriceLine(content.othersPrefix, featurePricing.max, currency);
  const oursPrice = formatFeaturePriceLine(content.oursPrefix, featurePricing.starting, currency);

  return (
    <FeatureCard revealed={revealed} delay={delay} className={cn('lg:min-h-[22rem]', className)}>
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute -right-2 top-8 select-none font-display text-[8.5rem] font-semibold leading-none text-foreground/[0.045]',
          'transition-transform duration-500 ease-out motion-safe:group-hover:-translate-y-1 motion-safe:group-hover:translate-x-1',
        )}
      >
        %
      </span>

      <div className="relative flex items-start justify-between gap-3">
        <p className="font-mono text-[0.6875rem] tracking-[0.08em] text-ink-faint">{content.pricingLabel}</p>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span
            className={cn(
              'inline-flex items-center rounded-full bg-feature-lime px-2.5 py-1',
              'text-[0.6875rem] font-semibold leading-none tracking-[0.01em] text-brand-ink',
              'transition-transform duration-300 ease-out motion-safe:group-hover:-translate-y-0.5',
            )}
          >
            {content.saveBadge}
          </span>
          <CurrencyToggle
            value={currency}
            onChange={(next) => setCurrency(next === 'USD' ? 'USD' : 'PKR')}
            ariaLabel="Display currency"
          />
        </div>
      </div>

      <h3 className="relative mt-5 max-w-[16.5rem] font-display text-[1.55rem] font-semibold leading-[1.15] tracking-[-0.03em] text-foreground sm:text-[1.7rem] lg:max-w-[18rem] lg:text-[1.85rem]">
        {content.costHeading}
      </h3>

      <p className="relative mt-3 max-w-[26rem] text-[0.9375rem] leading-[1.65] text-muted-foreground">
        {content.costDescription}
      </p>

      <div
        className="relative mt-auto grid grid-cols-1 gap-x-3 gap-y-3 pt-8 sm:grid-cols-[9.5rem_minmax(0,1fr)] sm:items-center sm:gap-y-2.5"
        aria-live="polite"
      >
        <span className="text-[0.8125rem] text-muted-foreground">{content.othersLabel}</span>
        <div
          className={cn(
            'flex h-9 min-w-0 items-center justify-end rounded-md bg-feature-bar px-2.5 origin-left sm:px-3',
            revealed && 'motion-safe:animate-bar-grow',
          )}
          style={revealed ? { animationDelay: `${delay + 180}ms` } : undefined}
        >
          <PriceText className="font-medium text-foreground" text={othersPrice} />
        </div>

        <span className="max-w-[11rem] text-[0.6875rem] font-semibold leading-snug tracking-[0.01em] text-foreground sm:text-[0.75rem]">
          {content.brandLabel}
        </span>
        <div className="flex min-w-0 items-center">
          <div
            className={cn(
              'flex h-9 w-[58%] min-w-0 max-w-full items-center justify-center rounded-md bg-feature-blue px-2.5 origin-left sm:min-w-[8.5rem] sm:px-3',
              revealed && 'motion-safe:animate-bar-grow',
            )}
            style={revealed ? { animationDelay: `${delay + 280}ms` } : undefined}
          >
            <PriceText className="font-semibold text-white" text={oursPrice} />
          </div>
        </div>
      </div>
    </FeatureCard>
  );
}

/**
 * @param {{ text: string; className?: string }} props
 */
function PriceText({ text, className }) {
  return (
    <span
      key={text}
      className={cn(
        'inline-block truncate text-[0.75rem] tabular-nums sm:text-[0.8125rem]',
        'motion-safe:animate-price-swap',
        className,
      )}
    >
      {text}
    </span>
  );
}

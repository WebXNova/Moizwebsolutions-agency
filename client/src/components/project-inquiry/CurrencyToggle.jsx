import { currencies } from '@/data/projectInquiry';
import { cn } from '@/lib/cn';

/**
 * @param {{
 *   value: string;
 *   onChange: (currency: string) => void;
 *   ariaLabel?: string;
 * }} props
 */
export function CurrencyToggle({ value, onChange, ariaLabel = 'Budget currency' }) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="inline-flex items-center rounded-full border border-hairline bg-panel-sunken p-0.5"
    >
      {currencies.map((currency) => {
        const active = value === currency.id;

        return (
          <button
            key={currency.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(currency.id)}
            className={cn(
              'rounded-full px-3 py-1.5 text-[0.625rem] font-medium uppercase tracking-[0.12em]',
              'transition-[background-color,color,box-shadow] duration-200 ease-out',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow',
              active
                ? 'bg-brand-yellow text-brand-ink shadow-sm'
                : 'text-ink-muted hover:text-ink',
            )}
          >
            {currency.label}
          </button>
        );
      })}
    </div>
  );
}

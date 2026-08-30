import { budgetRanges } from '@/data/projectInquiry';
import { CurrencyToggle } from '@/components/project-inquiry/CurrencyToggle';
import { InquiryGroup } from '@/components/project-inquiry/InquiryField';
import { OptionChip } from '@/components/project-inquiry/OptionChip';

/**
 * @param {{
 *   currency: string;
 *   onCurrencyChange: (currency: string) => void;
 *   value: string;
 *   onChange: (id: string) => void;
 * }} props
 */
export function BudgetSelector({ currency, onCurrencyChange, value, onChange }) {
  const bands = budgetRanges[currency] ?? [];

  return (
    <InquiryGroup
      label="Budget range"
      hint="Indicative bands to help us scope the work — not fixed pricing."
      action={<CurrencyToggle value={currency} onChange={onCurrencyChange} />}
    >
      <div className="flex flex-wrap gap-2">
        {bands.map((band) => (
          <OptionChip
            key={band.id}
            selected={value === band.id}
            onClick={() => onChange(band.id)}
          >
            {band.label}
          </OptionChip>
        ))}
      </div>
    </InquiryGroup>
  );
}

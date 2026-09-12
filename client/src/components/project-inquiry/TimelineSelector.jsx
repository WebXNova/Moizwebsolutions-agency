import { InquiryGroup } from '@/components/project-inquiry/InquiryField';
import { OptionChip } from '@/components/project-inquiry/OptionChip';

/**
 * @param {{
 *   options: { id: string; label: string }[];
 *   value: string;
 *   onChange: (id: string) => void;
 * }} props
 */
export function TimelineSelector({ options, value, onChange }) {
  return (
    <InquiryGroup
      label="Preferred timeline"
      hint="Your preference, not a committed delivery date."
    >
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <OptionChip
            key={option.id}
            selected={value === option.id}
            onClick={() => onChange(option.id)}
          >
            {option.label}
          </OptionChip>
        ))}
      </div>
    </InquiryGroup>
  );
}

import { resolveProjectTypeGroups, resolveTimelineOptions } from '@/data/projectInquiry';
import { BudgetSelector } from '@/components/project-inquiry/BudgetSelector';
import {
  InquiryField,
  InquiryGroup,
  inquiryControlClass,
} from '@/components/project-inquiry/InquiryField';
import { OptionChip } from '@/components/project-inquiry/OptionChip';
import { TimelineSelector } from '@/components/project-inquiry/TimelineSelector';
import { cn } from '@/lib/cn';

/**
 * @param {{
 *   form: import('@/lib/buildProjectInquiryMessage').InquiryForm;
 *   errors: Record<string, string>;
 *   onFieldChange: (field: string, value: string) => void;
 *   onProjectTypeToggle: (serviceId: string, type: string) => void;
 * }} props
 */
export function ProjectDetailsStep({ form, errors, onFieldChange, onProjectTypeToggle }) {
  const typeGroups = resolveProjectTypeGroups(form.services);
  const timelineOptions = resolveTimelineOptions(form.services);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12">
      <div className="space-y-8">
        {typeGroups.length > 0 ? (
          <InquiryGroup
            label="Project type"
            hint="Pick whatever fits — you can select several."
            error={errors.projectTypes}
          >
            <div className="space-y-5">
              {typeGroups.map((group, groupIndex) => (
                <div
                  key={group.id}
                  style={{ animationDelay: `${groupIndex * 70}ms` }}
                  className="motion-safe:animate-fade-up motion-reduce:animate-none"
                >
                  <p className="mb-2.5 text-[0.6875rem] font-medium tracking-[0.01em] text-ink">
                    {group.title}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {group.projectTypes.map((type) => (
                      <OptionChip
                        key={type}
                        selected={form.projectTypes[group.id]?.includes(type) ?? false}
                        onClick={() => onProjectTypeToggle(group.id, type)}
                      >
                        {type}
                      </OptionChip>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </InquiryGroup>
        ) : null}

        <TimelineSelector
          options={timelineOptions}
          value={form.timeline}
          onChange={(id) => onFieldChange('timeline', id)}
        />
      </div>

      <div className="space-y-8">
        <InquiryField
          id="inquiry-description"
          label="Tell us about the project"
          error={errors.description}
          hint="A short paragraph is plenty — we'll ask the detailed questions later."
        >
          <textarea
            id="inquiry-description"
            rows={7}
            value={form.description}
            aria-invalid={Boolean(errors.description)}
            aria-describedby={errors.description ? 'inquiry-description-error' : undefined}
            onChange={(event) => onFieldChange('description', event.target.value)}
            placeholder="What are you looking to build, redesign, edit or create?"
            className={cn(
              inquiryControlClass(errors.description),
              'min-h-[9.5rem] resize-y leading-[1.75]',
            )}
          />
        </InquiryField>

        <BudgetSelector
          currency={form.currency}
          onCurrencyChange={(currency) => onFieldChange('currency', currency)}
          value={form.budget}
          onChange={(id) => onFieldChange('budget', id)}
        />
      </div>
    </div>
  );
}

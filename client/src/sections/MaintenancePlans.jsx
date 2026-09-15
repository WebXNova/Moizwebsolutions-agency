import { Container } from '@/components/common/Container';
import { Section } from '@/components/common/Section';
import { MaintenancePlanCard } from '@/components/maintenance/MaintenancePlanCard';
import { LaurelIcon } from '@/components/maintenance/MaintenanceMarks';
import { maintenancePlans, maintenancePlansContent as content } from '@/data/maintenancePlans';

export function MaintenancePlans() {
  return (
    <Section
      id="maintenance-plans"
      spacing="none"
      className="bg-background pb-16 pt-4 md:pb-24 md:pt-6"
      aria-labelledby="maintenance-plans-heading"
    >
      <Container>
        <div className="mx-auto max-w-[42rem] text-center">
          <p className="flex items-center justify-center gap-2.5 text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:gap-3 sm:text-[0.6875rem] sm:tracking-[0.22em]">
            <LaurelIcon className="h-4 w-7 text-muted-foreground/80" />
            <span>{content.label}</span>
            <LaurelIcon className="h-4 w-7 text-muted-foreground/80" mirrored />
          </p>

          <h2
            id="maintenance-plans-heading"
            className="mt-5 font-display text-[2.15rem] font-bold leading-[1.08] tracking-[-0.035em] text-brand-ink dark:text-foreground sm:mt-6 sm:text-5xl md:text-6xl lg:text-[4.25rem]"
          >
            <span className="inline-block rounded-[0.18em] bg-brand-blue px-[0.22em] py-[0.02em] text-brand-ink">
              {content.headingHighlight}
            </span>{' '}
            {content.headingRest}
            <span className="mt-[0.08em] block">{content.headingLine2}</span>
          </h2>

          <p className="mt-5 text-[0.9375rem] leading-relaxed text-secondary-foreground sm:mt-6 sm:text-base">
            {content.subtextLines[0]}
            <br />
            {content.subtextLines[1]}
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-[68rem] grid-cols-1 items-stretch gap-6 md:mt-14 lg:grid-cols-2 lg:gap-7">
          {maintenancePlans.map((plan) => (
            <MaintenancePlanCard
              key={plan.id}
              plan={plan}
              includedLabel={content.includedLabel}
              popularLabel={content.popularLabel}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}

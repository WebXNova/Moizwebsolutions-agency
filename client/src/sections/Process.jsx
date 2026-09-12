/**
 * Legacy static process section. Not mounted; ProcessRow in ClosingBand is the live UI.
 */
import { Container } from '@/components/common/Container';
import { Section } from '@/components/common/Section';
import { SectionHeading } from '@/components/common/SectionHeading';
import { ProcessGrid } from '@/components/process/ProcessGrid';
import { processSteps, processContent } from '@/data/process';

export function Process() {
  return (
    <Section id="process" spacing="none" className="pb-24 md:pb-32 lg:pb-[8.5rem]">
      <Container>
        <SectionHeading eyebrow={processContent.eyebrow} title={processContent.title} />

        <div className="mt-16 lg:mt-20">
          <ProcessGrid steps={processSteps} />
        </div>
      </Container>
    </Section>
  );
}

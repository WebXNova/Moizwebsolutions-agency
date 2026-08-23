import { Container, Section, SectionHeading } from '@/components/common';
import { ProcessGrid } from '@/components/process/ProcessGrid';
import { processSteps } from '@/data/process';

export function Process() {
  return (
    <Section id="process">
      <Container>
        <SectionHeading title="Process" />
        <ProcessGrid steps={processSteps} />
      </Container>
    </Section>
  );
}

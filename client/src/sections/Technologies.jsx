import { Container, Section, SectionHeading } from '@/components/common';
import { TechnologyList } from '@/components/technologies/TechnologyList';
import { technologies } from '@/data/technologies';

export function Technologies() {
  return (
    <Section id="technologies">
      <Container>
        <SectionHeading title="Technologies" />
        <TechnologyList technologies={technologies} />
      </Container>
    </Section>
  );
}

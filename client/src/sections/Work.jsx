import { Container, Section, SectionHeading } from '@/components/common';
import { ProjectGrid } from '@/components/projects/ProjectGrid';
import { WorkCTA } from '@/sections/WorkCTA';
import { projects } from '@/data/projects';

export function Work() {
  return (
    <Section id="work">
      <Container>
        <SectionHeading title="Selected Work" />
        <ProjectGrid projects={projects} />
        <WorkCTA />
      </Container>
    </Section>
  );
}

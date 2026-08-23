import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Container, Section, SectionHeading } from '@/components/common';
import { ProjectGrid } from '@/components/projects/ProjectGrid';
import { projects } from '@/data/projects';

export function WorkPage() {
  return (
    <>
      <Header />
      <main>
        <Section id="work-page">
          <Container>
            <SectionHeading title="All Work" />
            <ProjectGrid projects={projects} />
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}

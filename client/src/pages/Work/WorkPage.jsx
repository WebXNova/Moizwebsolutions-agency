/**
 * Legacy static archive page. Not mounted in App.jsx.
 * Public work is served from Portfolio + CMS projects, not this file.
 */
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Container, Section, SectionHeading } from '@/components/common';
import { ProjectGrid } from '@/components/projects/ProjectGrid';
import { projects } from '@/data/projects';

export function WorkPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground">
      <Header />
      <main>
        <Section id="work-page">
          <Container>
            <SectionHeading eyebrow="Archive" title="All work" />
            <div className="mt-16 lg:mt-20">
              <ProjectGrid projects={projects} />
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </div>
  );
}

import { Container } from '@/components/common/Container';
import { Section } from '@/components/common/Section';
import { ProjectGrid } from '@/components/projects/ProjectGrid';
import { ExploreAllCTA } from '@/components/projects/ExploreAllCTA';
import { useProjects } from '@/hooks/useProjects';
import { SpinnerIcon } from '@/lib/icons';

export function Work() {
  const { projects, loading, error } = useProjects({ featured: true });

  return (
    <Section id="work" className="scroll-mt-6">
      <Container>
        <div className="text-center">
          <h2 className="text-section font-light leading-[1.04] tracking-[-0.035em] text-foreground">
            <span className="fx-shimmer-text motion-safe:animate-text-shimmer">Our works</span>
          </h2>
          <p className="mx-auto mt-5 max-w-[32rem] text-body leading-[1.8] text-muted-foreground">
            A curated selection of recent projects — from e-commerce rebuilds to product interfaces
            and brand-led web experiences.
          </p>
        </div>

        <div className="mt-16 lg:mt-20">
          {loading ? (
            <div className="flex justify-center py-16" role="status" aria-label="Loading projects">
              <SpinnerIcon className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <p className="text-center text-muted-foreground">{error}</p>
          ) : projects.length === 0 ? (
            <p className="text-center text-muted-foreground">No featured projects yet.</p>
          ) : (
            <ProjectGrid projects={projects.slice(0, 6)} />
          )}
        </div>

        <div className="mt-16 lg:mt-20">
          <ExploreAllCTA />
        </div>
      </Container>
    </Section>
  );
}

import { Container } from '@/components/common/Container';
import { Section } from '@/components/common/Section';
import { NewProjectGrid } from '@/components/newPortfolio/NewProjectGrid';
import { NewPortfolioCTA } from '@/components/newPortfolio/NewPortfolioCTA';
import { useProjects } from '@/hooks/useProjects';
import { useInViewOnce } from '@/hooks/useInView';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { LoadingBadge } from '@/components/effects/LoadingBadge';
import { cn } from '@/lib/cn';

/**
 * New Our Works showcase, inserted after the existing hero.
 * Isolated from the existing homepage Work section.
 */
export function NewOurWorks() {
  const { projects, loading } = useProjects({ featured: true });
  const [ref, revealed] = useInViewOnce({ threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  const reduced = usePrefersReducedMotion();
  const play = revealed && !reduced;

  return (
    <Section id="our-works" aria-labelledby="new-our-works-heading">
      <Container>
        <div ref={ref} className="relative text-center">
          <div className="overflow-hidden">
            <h2
              id="new-our-works-heading"
              className="text-section font-light leading-[1.04] tracking-[-0.035em] text-foreground"
            >
              <span className="fx-shimmer-text motion-safe:animate-text-shimmer">Our works</span>
            </h2>
          </div>
          <span
            aria-hidden="true"
            className={cn(
              'absolute left-1/2 top-[3.15em] h-px w-14 -translate-x-1/2 origin-center bg-brand-yellow',
              play && 'motion-safe:animate-line-reveal',
              !play && !reduced && 'scale-x-0',
            )}
          />
          <p className="mx-auto mt-5 max-w-[32rem] text-body leading-[1.8] text-muted-foreground">
            A curated selection of recent projects — from e-commerce rebuilds to product interfaces
            and brand-led web experiences.
          </p>
        </div>

        <div className="mt-10 sm:mt-16 lg:mt-20">
          {loading ? (
            <div className="flex justify-center py-16" role="status" aria-label="Loading projects">
              <LoadingBadge size="sm" label="Loading" />
            </div>
          ) : projects.length === 0 ? (
            <p className="text-center text-muted-foreground">No featured projects yet.</p>
          ) : (
            <NewProjectGrid projects={projects.slice(0, 6)} />
          )}
        </div>

        <div className="mt-12 sm:mt-16 lg:mt-20">
          <NewPortfolioCTA />
        </div>
      </Container>
    </Section>
  );
}

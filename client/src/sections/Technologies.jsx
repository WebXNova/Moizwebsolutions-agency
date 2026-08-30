import { Container } from '@/components/common/Container';
import { Divider } from '@/components/common/Divider';
import { Section } from '@/components/common/Section';
import { TechnologiesHeader } from '@/components/technologies/TechnologiesHeader';
import { TechnologyList } from '@/components/technologies/TechnologyList';
import { technologies as fallbackTechnologies, technologiesContent } from '@/data/technologies';
import { useSiteContent } from '@/hooks/useSiteContent';
import { resolveTechnologies, resolveTechnologiesContent } from '@/lib/contentAdapters';
import { useInViewOnce } from '@/hooks/useInView';
import { cn } from '@/lib/cn';

export function Technologies() {
  const [ref, revealed] = useInViewOnce();
  const { content } = useSiteContent();
  const technologies = resolveTechnologies(content?.technologies) || fallbackTechnologies;
  const technologiesContent = resolveTechnologiesContent(content?.sectionLabels);

  return (
    <Section id="technologies" spacing="none" className="py-16 md:py-20">
      <Container>
        <Divider />

        <div ref={ref}>
          <div className={cn(revealed ? 'motion-safe:animate-reveal-up' : 'motion-safe:opacity-0')}>
            <TechnologiesHeader title={technologiesContent.title} />
          </div>

          <div className="overflow-hidden pb-10 pt-2 md:pb-12">
            <TechnologyList technologies={technologies} revealed={revealed} />
          </div>
        </div>

        <Divider />
      </Container>
    </Section>
  );
}

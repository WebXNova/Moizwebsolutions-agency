import { Container } from '@/components/common/Container';
import { Divider } from '@/components/common/Divider';
import { Section } from '@/components/common/Section';
import { CostValueCard } from '@/components/features/CostValueCard';
import { FocusCard } from '@/components/features/FocusCard';
import { SupportCard } from '@/components/features/SupportCard';
import { featureHighlightsContent } from '@/data/featureHighlights';
import { useInViewOnce } from '@/hooks/useInView';

export function FeatureHighlights() {
  const [ref, revealed] = useInViewOnce({ threshold: 0.18, rootMargin: '0px 0px -10% 0px' });

  return (
    <Section id="value" spacing="none" className="scroll-mt-6 pb-16 md:pb-20" aria-label="Why work with us">
      <Container>
        <div
          ref={ref}
          className="grid grid-cols-1 gap-4 pt-8 sm:gap-5 md:grid-cols-2 md:pt-10 lg:grid-cols-4 lg:gap-5"
        >
          <CostValueCard
            content={featureHighlightsContent}
            revealed={revealed}
            delay={0}
            className="md:col-span-2 lg:col-span-2"
          />
          <SupportCard content={featureHighlightsContent} revealed={revealed} delay={100} />
          <FocusCard content={featureHighlightsContent} revealed={revealed} delay={200} />
        </div>

        <Divider className="mt-10 md:mt-12" />
      </Container>
    </Section>
  );
}

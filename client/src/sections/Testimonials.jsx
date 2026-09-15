import { Container } from '@/components/common/Container';
import { Divider } from '@/components/common/Divider';
import { SectionLabel } from '@/components/common/SectionLabel';
import { Section } from '@/components/common/Section';
import { TestimonialIntroCard } from '@/components/testimonials/TestimonialIntroCard';
import { TestimonialSlider } from '@/components/testimonials/TestimonialSlider';
import { testimonialsContent } from '@/data/testimonials';
import { testimonialIntro, testimonialReviews } from '@/data/testimonialSlider';
import { useSiteContent } from '@/hooks/useSiteContent';
import { resolveTestimonialsLabel } from '@/lib/contentAdapters';
import { useInViewOnce } from '@/hooks/useInView';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * @param {{
 *   reviews?: typeof testimonialReviews;
 *   onLeaveReview?: () => void;
 * }} props
 */
export function Testimonials({ reviews = testimonialReviews, onLeaveReview }) {
  const [viewRef, inView] = useInViewOnce({ threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  const reduced = usePrefersReducedMotion();
  const active = reduced || inView;
  const { content } = useSiteContent();
  const label = resolveTestimonialsLabel(content?.sectionLabels) || testimonialsContent.label;

  return (
    <Section
      id="testimonials"
      spacing="none"
      className="bg-background pb-16 pt-4 md:pb-20"
    >
      <Container>
        <div ref={viewRef}>
          <SectionLabel motion active={active} reduced={reduced}>
            {label}
          </SectionLabel>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10 xl:gap-12">
          <div className="lg:col-span-4">
            <TestimonialIntroCard intro={testimonialIntro} onLeaveReview={onLeaveReview} />
          </div>

          <div className="min-w-0 lg:col-span-8 lg:pt-1">
            <TestimonialSlider reviews={reviews} revealed={active} />
          </div>
        </div>

        <Divider className="mt-10 md:mt-12" />
      </Container>
    </Section>
  );
}

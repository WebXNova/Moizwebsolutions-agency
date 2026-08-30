import { Container } from '@/components/common/Container';
import { Divider } from '@/components/common/Divider';
import { SectionLabel } from '@/components/common/SectionLabel';
import { Section } from '@/components/common/Section';
import { TestimonialCard } from '@/components/testimonials/TestimonialCard';
import { testimonials as fallbackTestimonials, testimonialsContent } from '@/data/testimonials';
import { useSiteContent } from '@/hooks/useSiteContent';
import { resolveTestimonials, resolveTestimonialsLabel } from '@/lib/contentAdapters';
import { useInViewOnce } from '@/hooks/useInView';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/cn';

export function Testimonials() {
  const [viewRef, inView] = useInViewOnce({ threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
  const reduced = usePrefersReducedMotion();
  const active = reduced || inView;
  const play = active && !reduced;
  const { content } = useSiteContent();
  const testimonials = resolveTestimonials(content?.testimonials) || fallbackTestimonials;
  const label = resolveTestimonialsLabel(content?.sectionLabels);

  return (
    <Section id="testimonials" spacing="none" variant="band" className="band-motion pt-0 pb-0">
      <Container>
        <div
          ref={viewRef}
          className={cn(play && 'animate-band-frame', !play && !reduced && 'opacity-0')}
        >
          <div
            className={cn(
              'band-rule-full',
              play && 'animate-line-draw-var',
              reduced && '[--line-draw:1]',
            )}
          >
            <Divider className="bg-current/15" />
          </div>

          <SectionLabel motion active={active} reduced={reduced}>
            {label}
          </SectionLabel>

          {testimonials.length > 0 ? (
            <div className="group/quotes grid grid-cols-1 gap-10 px-1 pb-10 sm:grid-cols-2 md:gap-8 lg:grid-cols-3 lg:gap-10 lg:pb-12">
              {testimonials.map((testimonial, index) => (
                <TestimonialCard
                  key={testimonial.id}
                  testimonial={testimonial}
                  active={active}
                  reduced={reduced}
                  index={index}
                />
              ))}
            </div>
          ) : null}

          <div className="relative">
            <div
              className={cn(
                'band-rule-full',
                play && 'animate-line-draw-var',
                reduced && '[--line-draw:1]',
              )}
              style={play ? { animationDelay: '980ms' } : undefined}
            >
              <Divider className="bg-current/15" />
            </div>
            {play ? (
              <span className="band-energy-pass" aria-hidden="true">
                <span
                  className="band-energy-beam animate-band-energy"
                  style={{ animationDelay: '1100ms' }}
                />
              </span>
            ) : null}
          </div>
        </div>
      </Container>
    </Section>
  );
}

import { Container, Section, SectionHeading } from '@/components/common';
import { TestimonialCard } from '@/components/testimonials/TestimonialCard';
import { testimonials } from '@/data/testimonials';

export function Testimonials() {
  return (
    <Section id="testimonials">
      <Container>
        <SectionHeading title="Testimonials" />
        {testimonials.map((testimonial) => (
          <TestimonialCard key={testimonial.id} testimonial={testimonial} />
        ))}
      </Container>
    </Section>
  );
}

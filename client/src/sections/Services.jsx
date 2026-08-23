import { Container, Section, SectionHeading } from '@/components/common';
import { ServiceCard } from '@/components/services/ServiceCard';
import { services } from '@/data/services';

export function Services() {
  return (
    <Section id="services">
      <Container>
        <SectionHeading title="Services" />
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </Container>
    </Section>
  );
}

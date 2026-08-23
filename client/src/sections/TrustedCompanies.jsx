import { Container, Section, SectionHeading } from '@/components/common';
import { trustedCompanies } from '@/data/trustedCompanies';

export function TrustedCompanies() {
  return (
    <Section id="trusted-companies">
      <Container>
        <SectionHeading title="Trusted by" />
        <ul>
          {trustedCompanies.map((company) => (
            <li key={company.id}>{company.name}</li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

import { Container, Section, Button } from '@/components/common';
import { contactConfig } from '@/config/contact';

export function FinalCTA() {
  return (
    <Section id="contact">
      <Container>
        <h2>Get in touch</h2>
        {contactConfig.email ? (
          <Button
            onClick={() => {
              window.location.href = `mailto:${contactConfig.email}`;
            }}
          >
            Contact us
          </Button>
        ) : (
          <Button>Contact us</Button>
        )}
      </Container>
    </Section>
  );
}

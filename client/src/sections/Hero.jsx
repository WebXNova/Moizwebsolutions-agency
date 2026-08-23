import { Container, Section } from '@/components/common';
import { heroContent } from '@/data/hero';

export function Hero() {
  return (
    <Section id="hero">
      <Container>
        {heroContent.eyebrow ? <p>{heroContent.eyebrow}</p> : null}
        {heroContent.title ? <h1>{heroContent.title}</h1> : null}
        {heroContent.subtitle ? <p>{heroContent.subtitle}</p> : null}
        {heroContent.cta?.label ? (
          <a href={heroContent.cta.href}>{heroContent.cta.label}</a>
        ) : null}
        {heroContent.secondaryCta?.label ? (
          <a href={heroContent.secondaryCta.href}>{heroContent.secondaryCta.label}</a>
        ) : null}
      </Container>
    </Section>
  );
}

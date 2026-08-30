import { Container } from '@/components/common/Container';
import { Section } from '@/components/common/Section';
import { Button } from '@/components/common/Button';
import { ChevronRightIcon } from '@/lib/icons';
import { contactConfig, finalCtaContent } from '@/config/contact';

export function FinalCTA() {
  const mailto = contactConfig.email ? `mailto:${contactConfig.email}` : undefined;

  return (
    <Section id="contact">
      <Container>
        <div className="mx-auto max-w-[780px] text-center">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            {finalCtaContent.eyebrow}
          </p>

          <h2 className="mt-7 text-[clamp(2rem,4.4vw,3.4rem)] font-normal leading-[1.12] tracking-[-0.035em] text-foreground">
            {finalCtaContent.title}
          </h2>

          <p className="mx-auto mt-8 max-w-[470px] text-[14px] leading-[1.85] text-muted-foreground">
            {finalCtaContent.subtitle}
          </p>

          <div className="mt-12 flex flex-col items-center gap-9">
            <Button href={mailto}>
              {finalCtaContent.cta.label}
              <ChevronRightIcon className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>

            {contactConfig.email ? (
              <a
                href={mailto}
                className="border-b border-transparent text-[13px] tracking-[-0.01em] text-muted-foreground transition-colors duration-300 hover:border-border-interactive hover:text-foreground"
              >
                {contactConfig.email}
              </a>
            ) : null}
          </div>
        </div>
      </Container>
    </Section>
  );
}

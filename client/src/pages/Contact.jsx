import { Container } from '@/components/common/Container';
import { Section } from '@/components/common/Section';
import { MagneticCta } from '@/components/closing/MagneticCta';
import { SplitLine } from '@/components/effects/SplitLine';
import { useInquiry } from '@/context/InquiryProvider';
import { useSiteContent } from '@/hooks/useSiteContent';
import { resolveFinalCta } from '@/lib/contentAdapters';

export function ContactPage() {
  const { open } = useInquiry();
  const { content } = useSiteContent();
  const ctaContent = resolveFinalCta(content?.cta);

  return (
    <main>
      <Section id="contact-page">
        <Container>
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Contact</p>
              <h1 className="mt-4 font-serif text-[clamp(2.4rem,5vw,4.2rem)] font-medium leading-[1.08] tracking-[-0.02em] text-foreground [perspective:640px]">
                <SplitLine text="Start your project" shimmer delay={80} />
              </h1>
            </div>
            <div className="flex flex-col items-start gap-7 lg:col-span-4 lg:col-start-9">
              <p className="max-w-[22rem] text-body leading-[1.85] text-muted-foreground">
                {ctaContent.subtitle}
              </p>
              <MagneticCta onClick={open}>{ctaContent.cta.label}</MagneticCta>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}

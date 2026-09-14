import { CinematicHeadline, splitCtaHeadline } from '@/components/closing/CinematicHeadline';
import { MagneticCta } from '@/components/closing/MagneticCta';
import { ProcessRow } from '@/components/closing/ProcessRow';
import { ClosingFooter } from '@/components/closing/ClosingFooter';
import { useInquiry } from '@/context/InquiryProvider';
import { useSiteContent } from '@/hooks/useSiteContent';
import { resolveFinalCta } from '@/lib/contentAdapters';

/**
 * Combined CTA / process / footer navy panel, matching the agency closer reference.
 */
export function ClosingBand() {
  const { open } = useInquiry();
  const { content } = useSiteContent();
  const ctaContent = resolveFinalCta(content?.cta);

  if (content?.cta?.visible === false) {
    return (
      <div className="w-full bg-closing-panel text-closing-ivory">
        <div className="mx-auto max-w-site px-4 py-12 sm:px-10 sm:py-16 md:px-16 md:py-20 lg:px-20 lg:py-24">
          <section id="process" className="scroll-mt-[var(--header-offset)]" aria-label="Our process">
            <ProcessRow />
          </section>
          <div className="mt-16 md:mt-20 lg:mt-24">
            <ClosingFooter />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-closing-panel text-closing-ivory">
        <div className="mx-auto max-w-site px-4 py-12 sm:px-10 sm:py-16 md:px-16 md:py-20 lg:px-20 lg:py-24">
        <section id="contact" aria-labelledby="closing-headline" className="scroll-mt-[var(--header-offset)]">
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-7">
              <CinematicHeadline id="closing-headline" lines={splitCtaHeadline(ctaContent.headline)} />
            </div>

            <div className="flex flex-col items-start gap-7 lg:col-span-4 lg:col-start-9 lg:pt-3">
              <p className="max-w-[22rem] text-body leading-[1.85] text-closing-muted">
                {ctaContent.subtitle}
              </p>
              <MagneticCta onClick={open}>{ctaContent.cta.label}</MagneticCta>
            </div>
          </div>
        </section>

        <section id="process" className="mt-16 scroll-mt-[var(--header-offset)] md:mt-20 lg:mt-24" aria-label="Our process">
          <ProcessRow />
        </section>

        <div className="mt-16 md:mt-20 lg:mt-24">
          <ClosingFooter />
        </div>
      </div>
    </div>
  );
}

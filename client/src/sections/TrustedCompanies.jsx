import { Container } from '@/components/common/Container';
import { Divider } from '@/components/common/Divider';
import { SectionLabel } from '@/components/common/SectionLabel';
import { Section } from '@/components/common/Section';
import { TrustedLogo } from '@/components/trusted/TrustedLogo';
import { trustedCompanies as fallbackCompanies, trustedCompaniesContent } from '@/data/trustedCompanies';
import { useSiteContent } from '@/hooks/useSiteContent';
import { resolveTrustedCompanies, resolveTrustedCompaniesLabel } from '@/lib/contentAdapters';
import { useBandProgress } from '@/hooks/useBandProgress';
import { useInViewOnce } from '@/hooks/useInView';
import { useFinePointer, usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/cn';

export function TrustedCompanies() {
  const [viewRef, inView] = useInViewOnce({ threshold: 0.22, rootMargin: '0px 0px -10% 0px' });
  const reduced = usePrefersReducedMotion();
  const finePointer = useFinePointer();
  const compact = useMediaQuery('(max-width: 640px)');
  const active = reduced || inView;
  const play = active && !reduced;
  const progressEnabled = play && finePointer && !compact;
  useBandProgress(viewRef, progressEnabled);
  const stagger = compact ? 40 : 70;
  const { content } = useSiteContent();
  const trustedCompanies = resolveTrustedCompanies(content?.trustedCompanies) || fallbackCompanies;
  const label = resolveTrustedCompaniesLabel(content?.sectionLabels);

  return (
    <Section
      id="trusted-companies"
      spacing="none"
      variant="band"
      className="band-motion pt-0 pb-0"
    >
      <Container>
        <div
          ref={viewRef}
          className={cn(play && 'animate-band-frame', !play && !reduced && 'opacity-0')}
        >
          <div
            className={cn(
              'band-rule origin-center',
              play && 'animate-line-draw-var',
              reduced && '[--line-draw:1] [--band-progress:1]',
            )}
          >
            <Divider className="bg-current/15" />
          </div>

          <SectionLabel
            uppercase={false}
            motion
            active={active}
            reduced={reduced}
          >
            {label}
          </SectionLabel>

          {trustedCompanies.length > 0 ? (
            <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-6 px-2 pb-10 sm:gap-x-10 md:gap-x-12 md:pb-12 lg:gap-x-16">
              {trustedCompanies.map((company, index) => (
                <TrustedLogo
                  key={company.id}
                  company={company}
                  active={active}
                  reduced={reduced}
                  index={index}
                  stagger={stagger}
                />
              ))}
            </ul>
          ) : null}
        </div>
      </Container>
    </Section>
  );
}

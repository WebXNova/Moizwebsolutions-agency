import { Container } from '@/components/common/Container';
import { Section } from '@/components/common/Section';
import { ServiceGrid } from '@/components/services/ServiceGrid';
import { ServicesHeader } from '@/components/services/ServicesHeader';
import { serviceGroups as fallbackGroups } from '@/data/services';
import { useSiteContent } from '@/hooks/useSiteContent';
import { resolveServiceGroups, resolveServicesContent } from '@/lib/contentAdapters';
import { useBandProgress } from '@/hooks/useBandProgress';
import { useInViewOnce } from '@/hooks/useInView';
import { useFinePointer, usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/cn';

export function Services() {
  const [ref, revealed] = useInViewOnce({ threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
  const reduced = usePrefersReducedMotion();
  const compact = useMediaQuery('(max-width: 640px)');
  const finePointer = useFinePointer();
  const active = reduced || revealed;
  const play = active && !reduced;
  useBandProgress(ref, play && finePointer && !compact);
  const { content } = useSiteContent();
  const services = resolveServiceGroups(content?.services) || fallbackGroups;
  const servicesContent = resolveServicesContent(content?.servicesContent);

  return (
    <Section id="services">
      <Container>
        <div
          ref={ref}
          className={cn('band-motion', play && 'animate-band-frame', !play && !reduced && 'opacity-0')}
        >
          <ServicesHeader active={active} reduced={reduced} content={servicesContent} />
          <ServiceGrid services={services} revealed={active} />
        </div>
      </Container>
    </Section>
  );
}

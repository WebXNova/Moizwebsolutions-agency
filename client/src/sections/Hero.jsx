import { useState } from 'react';
import { Container } from '@/components/common/Container';
import { Section } from '@/components/common/Section';
import { VideoModal } from '@/components/common/VideoModal';
import { HeroContent } from '@/components/hero/HeroContent';
import { HeroVisual } from '@/components/hero/HeroVisual';
import { HeroStat } from '@/components/hero/HeroStat';
import { heroContent as fallbackHero } from '@/data/hero';
import { useInquiry } from '@/context/InquiryProvider';
import { useHeroParallax } from '@/hooks/useHeroParallax';
import { useSiteContent } from '@/hooks/useSiteContent';
import { resolveHero } from '@/lib/contentAdapters';

export function Hero() {
  const [isVideoOpen, setVideoOpen] = useState(false);
  const { open } = useInquiry();
  const { contentRef, visualRef } = useHeroParallax();
  const { content } = useSiteContent();
  const heroContent = resolveHero(content?.hero) || fallbackHero;

  if (heroContent.visible === false) return null;

  return (
    <Section
      id="hero"
      spacing="none"
      className="overflow-x-clip pt-8 pb-14 sm:pt-10 sm:pb-16 md:pt-12 md:pb-20 lg:pt-14 lg:pb-24"
    >
      <Container>
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:items-start md:gap-10 lg:gap-14 xl:gap-16">
          <div ref={contentRef} className="will-change-transform md:max-w-[36rem] lg:max-w-[38rem]">
            <HeroContent
              titleLines={heroContent.titleLines}
              paragraph={heroContent.paragraph}
              cta={heroContent.cta}
              onCtaClick={open}
            />

            <HeroStat
              value={heroContent.stat.value}
              label={heroContent.stat.label}
              className="mt-14 md:mt-16"
            />
          </div>

          <div ref={visualRef} className="w-full will-change-transform md:justify-self-stretch">
            <HeroVisual
              visual={heroContent.visual}
              onPlay={() => setVideoOpen(true)}
            />
          </div>
        </div>
      </Container>

      <VideoModal
        isOpen={isVideoOpen}
        onClose={() => setVideoOpen(false)}
        title={heroContent.video.title}
        embedUrl={heroContent.video.embedUrl}
      />
    </Section>
  );
}

import { Container } from '@/components/common/Container';
import { Divider } from '@/components/common/Divider';
import { Section } from '@/components/common/Section';
import { assets } from '@/config/assets';
import { useInViewOnce } from '@/hooks/useInView';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/cn';

const HEADING =
  'MoizWebSolutions helps founders and teams ship stunning, strategically sound products that engage their audience. Our team works closely with you to ensure every detail is aligned with your goals.';

const BODY =
  'From concept to launch, we craft websites, mobile and web apps, brand identity, and custom software that not only look exceptional but also drive results — building products that last.';

export function Founder() {
  const [ref, revealed] = useInViewOnce({ threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
  const reduced = usePrefersReducedMotion();
  const play = revealed && !reduced;
  const portrait = assets.founderPortrait;

  return (
    <Section
      id="founder"
      spacing="none"
      className="pt-8 pb-10 sm:pt-12 sm:pb-14 md:py-24 lg:py-28"
      aria-labelledby="founder-heading"
    >
      <Container>
        <div
          ref={ref}
          className={cn(
            'grid items-start gap-6 sm:gap-10 lg:grid-cols-12 lg:items-center lg:gap-16 xl:gap-20',
            play && 'animate-reveal-up',
            !play && !reduced && 'opacity-0',
          )}
        >
          <figure className="m-0 lg:col-span-5">
            <div className="aspect-[5/6] overflow-hidden rounded-xl bg-surface-muted sm:aspect-[4/5] lg:aspect-[3/4]">
              <img
                src={portrait.src}
                alt={portrait.alt}
                width={960}
                height={1280}
                loading="lazy"
                decoding="async"
                className="block h-full w-full object-cover object-[center_12%] sm:object-[center_10%] lg:object-[center_8%]"
              />
            </div>
          </figure>

          <div className="flex min-w-0 flex-col lg:col-span-7 lg:max-w-[38rem] lg:justify-center">
            <span
              aria-hidden="true"
              className="font-serif text-[4.25rem] leading-[0.7] text-muted-foreground/35 sm:text-[5.25rem] lg:text-[6.25rem]"
            >
              “
            </span>

            <h2
              id="founder-heading"
              className="mt-5 font-display text-[clamp(1.25rem,1.1vw+1.05rem,2.125rem)] font-normal leading-[1.4] tracking-[-0.028em] text-foreground sm:mt-6"
            >
              {HEADING}
            </h2>

            <p className="mt-6 text-body leading-[1.8] text-secondary-foreground sm:mt-7">
              {BODY}
            </p>

            <Divider className="mt-8 max-w-[7.5rem] sm:mt-10" />

            <div className="mt-5">
              <p className="text-[0.9375rem] font-medium tracking-[-0.01em] text-foreground">
                Muhammad Moiz
              </p>
              <p className="mt-1 text-[0.8125rem] tracking-[-0.01em] text-secondary-foreground">
                Founder
              </p>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

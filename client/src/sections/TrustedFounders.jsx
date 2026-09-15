import { assets } from '@/config/assets';
import { trustedFoundersContent as content } from '@/data/trustedFounders';
import { useInViewOnce } from '@/hooks/useInView';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { ArrowUpRightIcon } from '@/lib/icons';
import { cn } from '@/lib/cn';

/**
 * @param {{ show: boolean; delay?: number; className?: string; children: import('react').ReactNode }} props
 */
function StaggerIn({ show, delay = 0, className, children }) {
  return (
    <div
      className={cn(
        'transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none',
        show ? 'translate-y-0 opacity-100' : 'translate-y-[30px] opacity-0',
        className,
      )}
      style={show ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

/**
 * Full-bleed-feeling banner above testimonials. Width is 95% / 90% of the viewport
 * (see `.trusted-founders-frame`), not the site container.
 *
 * @param {{ onLeaveReview?: () => void }} props
 */
export function TrustedFounders({ onLeaveReview }) {
  const image = assets.trustedFounders;
  const [ref, inView] = useInViewOnce({ threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
  const reduced = usePrefersReducedMotion();
  const show = reduced || inView;

  return (
    <section
      id="trusted-founders"
      className="relative bg-background py-6 sm:py-8 md:py-10"
      aria-labelledby="trusted-founders-heading"
    >
      <div
        ref={ref}
        className={cn(
          'trusted-founders-frame relative mx-auto flex flex-col overflow-hidden rounded-[1.25rem]',
          'transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none',
          show ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
        )}
      >
        <img
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          className="absolute inset-0 h-full w-full object-cover object-[center_28%]"
          loading="lazy"
          decoding="async"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.62),rgba(0,0,0,0.22))]"
        />

        <div className="relative z-[1] flex min-h-full flex-1 flex-col justify-center px-8 py-10 sm:px-12 sm:py-12 md:px-16 md:py-16 lg:px-20 lg:py-20">
          <div className="max-w-[38rem] lg:max-w-[42rem]">
            <StaggerIn show={show} delay={0}>
              <h2
                id="trusted-founders-heading"
                className="font-display text-5xl font-bold leading-[1.08] tracking-[-0.03em] text-white md:text-6xl lg:text-7xl"
              >
                <span className="inline-block origin-left -rotate-[1.5deg] rounded-[0.2em] bg-brand-blue px-[0.28em] py-[0.04em] text-white shadow-[0_10px_28px_-16px_rgb(37_99_235_/_0.55)]">
                  {content.headingHighlight}
                </span>{' '}
                <span>{content.headingRest}</span>
                <span className="mt-[0.12em] block">{content.headingLine2}</span>
              </h2>
            </StaggerIn>

            <StaggerIn show={show} delay={100}>
              <p className="mt-6 max-w-[32rem] text-[0.9375rem] font-normal leading-relaxed text-white/80 sm:mt-7 sm:text-base md:mt-8">
                {content.subtext}
              </p>
            </StaggerIn>

            <StaggerIn show={show} delay={200}>
              <button
                type="button"
                onClick={onLeaveReview}
                className="mt-6 inline-flex items-center gap-1.5 text-[0.9375rem] font-medium text-white transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:mt-7"
              >
                {content.ctaLabel}
                <ArrowUpRightIcon className="h-4 w-4" />
              </button>
            </StaggerIn>
          </div>
        </div>
      </div>
    </section>
  );
}

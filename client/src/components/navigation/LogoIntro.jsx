import { useIntroAnimation } from '@/hooks/useIntroAnimation';
import { cn } from '@/lib/cn';

/**
 * Plays the brand entrance around whatever it wraps, once per page load.
 *
 * Two layers because the settle and the reveal need independent timelines: the
 * outer lifts and fades the mark in, the inner uncovers it left to right,
 * echoing the sweep of the swoosh through the monogram and arriving at the
 * wordmark last. `origin-left` pins the left edge so the header never appears
 * to slide.
 *
 * Both classes come off once the reveal ends, which drops the lingering
 * `clip-path` container. Left in place it would clip the link's focus ring.
 *
 * @param {{ children: import('react').ReactNode; className?: string }} props
 */
export function LogoIntro({ children, className }) {
  const { isPlaying, onComplete } = useIntroAnimation();

  return (
    <div className={cn('flex w-fit max-w-full min-w-0 origin-left', isPlaying && 'animate-brand-settle', className)}>
      <div
        className={cn('flex', isPlaying && 'animate-brand-reveal')}
        onAnimationEnd={(event) => {
          if (event.animationName.includes('brand-reveal')) onComplete();
        }}
      >
        {children}
      </div>
    </div>
  );
}

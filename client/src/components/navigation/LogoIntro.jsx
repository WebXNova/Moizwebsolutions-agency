import { useIntroAnimation } from '@/hooks/useIntroAnimation';
import { cn } from '@/lib/cn';

/**
 * Header wrapper for the brand mark.
 *
 * `origin-left` pins the left edge so the header never appears to slide.
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

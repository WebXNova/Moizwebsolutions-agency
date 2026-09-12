import { ArrowRightIcon } from '@/lib/icons';
import { cn } from '@/lib/cn';
import { TiltFrame } from '@/components/effects/TiltFrame';

/**
 * Responsive hero artwork with premium entrance, subtle float, and hover
 * refinement. Animations use transform/opacity only and respect reduced motion.
 *
 * @param {{
 *   visual: { src: string; alt: string; width?: number; height?: number };
 *   onPlay?: () => void;
 * }} props
 */
export function HeroVisual({ visual, onPlay }) {
  const width = visual.width ?? 1448;
  const height = visual.height ?? 1086;

  return (
    <div
      className={cn(
        'relative w-full',
        'motion-safe:animate-hero-enter motion-reduce:animate-none',
      )}
    >
      <div className={cn('motion-safe:md:animate-hero-float motion-reduce:animate-none')}>
        <TiltFrame>
          <button
            type="button"
            aria-label="Play showreel"
            onClick={onPlay}
            className={cn(
              'group relative isolate block aspect-[1448/1086] w-full overflow-hidden',
              'rounded-xl border border-border-subtle bg-surface shadow-[0_18px_48px_-24px_rgb(17_24_39_/_0.35)]',
              'transition-[border-color,box-shadow,transform] duration-500 ease-out',
              'hover-capable:hover:shadow-[0_28px_56px_-22px_rgb(17_24_39_/_0.42)]',
              'hover-capable:hover:border-border-interactive',
              'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring',
            )}
          >
            <img
              src={visual.src}
              alt={visual.alt}
              width={width}
              height={height}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              className={cn(
                'h-full w-full object-contain object-center',
                'transition-[transform] duration-700 ease-out will-change-transform',
                'hover-capable:group-hover:scale-[1.018] hover-capable:group-focus-visible:scale-[1.018]',
              )}
            />

            <span
              aria-hidden="true"
              className={cn(
                'pointer-events-none absolute inset-0 bg-gradient-to-tr from-brand-blue/[0.04] via-transparent to-brand-yellow/[0.05]',
                'opacity-0 transition-opacity duration-400',
                'hover-capable:group-hover:opacity-100 hover-capable:group-focus-visible:opacity-100',
              )}
            />

            <span
              aria-hidden="true"
              className={cn(
                'pointer-events-none absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center',
                'rounded-full border border-border bg-surface-elevated/95 text-foreground shadow-md backdrop-blur-[2px]',
                'transition-[transform,box-shadow] duration-300 ease-out',
                'hover-capable:group-hover:scale-[1.04] hover-capable:group-focus-visible:scale-[1.04]',
                'hover-capable:group-hover:shadow-lg',
              )}
            >
              <ArrowRightIcon
                className={cn(
                  'h-4 w-4 transition-transform duration-300 ease-out',
                  'hover-capable:group-hover:translate-x-0.5 hover-capable:group-focus-visible:translate-x-0.5',
                )}
              />
            </span>
          </button>
        </TiltFrame>
      </div>
    </div>
  );
}

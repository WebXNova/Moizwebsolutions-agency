import { TechnologyMark } from '@/components/technologies/TechnologyMark';
import { cn } from '@/lib/cn';

/**
 * Logo + name as one unit. Used in both the scrolling marquee and the
 * reduced-motion static grid.
 *
 * @param {{
 *   technology: import('@/types').Technology;
 *   interactive?: boolean;
 *   shineDelay?: number;
 * }} props
 */
export function TechnologyItem({ technology, interactive = true, shineDelay = 0 }) {
  const glow = technology.color ?? '#FFC20E';

  const body = (
    <>
      <span
        className={cn(
          'relative z-10 flex h-11 w-full items-center justify-center sm:h-[3.25rem] lg:h-16',
          interactive &&
            'transition-[transform,filter] duration-300 ease-out',
          interactive &&
            'motion-safe:hover-capable:group-hover:scale-[1.08] motion-safe:group-focus-visible:scale-[1.08]',
          interactive &&
            'hover-capable:group-hover:drop-shadow-[0_0_16px_color-mix(in_srgb,var(--tech-color)_36%,transparent)] group-focus-visible:drop-shadow-[0_0_16px_color-mix(in_srgb,var(--tech-color)_36%,transparent)] motion-reduce:group-hover:drop-shadow-none',
        )}
      >
        <TechnologyMark technology={technology} />
      </span>
      <span
        className={cn(
          'relative z-10 mt-3.5 block w-full whitespace-nowrap text-center text-[0.8125rem] font-medium leading-snug tracking-[0.02em]',
          'text-foreground/80 sm:mt-4 sm:text-[0.875rem] sm:tracking-[0.03em]',
          interactive &&
            'transition-colors duration-300 group-hover:text-foreground group-focus-visible:text-foreground',
        )}
      >
        {technology.name}
      </span>
    </>
  );

  const shellClass =
    'group relative flex w-[7.5rem] shrink-0 select-none flex-col items-center justify-start sm:w-[8.5rem] lg:w-[9.25rem]';

  const faceClass = cn(
    'relative flex w-full flex-col items-center justify-start rounded-2xl px-2.5 py-3.5 sm:px-3 sm:py-4',
    'bg-foreground/[0.028] dark:bg-foreground/[0.04]',
    'shadow-[inset_0_1px_0_rgb(255_255_255_/_0.2),0_8px_20px_-18px_rgb(20_26_34_/_0.16)]',
    'dark:shadow-[inset_0_1px_0_rgb(255_255_255_/_0.07),0_10px_24px_-18px_rgb(0_0_0_/_0.42)]',
  );

  const glowLayer = (
    <span
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute left-1/2 top-[42%] h-[4.75rem] w-[4.75rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl',
        'opacity-[0.2] transition-opacity duration-500 ease-out',
        'sm:h-[5.25rem] sm:w-[5.25rem] lg:h-24 lg:w-24',
        'group-hover:opacity-[0.42] group-focus-visible:opacity-[0.42]',
        'motion-reduce:opacity-30 motion-reduce:group-hover:opacity-30',
      )}
      style={{
        background: `radial-gradient(circle, color-mix(in srgb, var(--tech-color) 72%, transparent) 0%, transparent 70%)`,
      }}
    />
  );

  const shineLayer = (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl motion-reduce:hidden"
    >
      <span
        className="absolute inset-y-0 -left-1/2 w-1/2 motion-safe:animate-tech-shine"
        style={{
          animationDelay: `${shineDelay}s`,
          background:
            'linear-gradient(105deg, transparent 30%, rgb(255 255 255 / 0.2), transparent 70%)',
        }}
      />
    </span>
  );

  if (!interactive) {
    return (
      <li className={shellClass} style={{ '--tech-color': glow }}>
        {glowLayer}
        <div className={faceClass}>
          {body}
          {shineLayer}
        </div>
      </li>
    );
  }

  return (
    <li className={shellClass} style={{ '--tech-color': glow }}>
      {glowLayer}
      <button
        type="button"
        aria-label={technology.name}
        className={cn(
          faceClass,
          'transition-[transform,background-color,box-shadow] duration-300 ease-out',
          'motion-safe:hover-capable:hover:-translate-y-1',
          'hover-capable:hover:bg-foreground/[0.05] dark:hover-capable:hover:bg-foreground/[0.07]',
          'hover-capable:hover:shadow-[inset_0_1px_0_rgb(255_255_255_/_0.32),0_14px_28px_-16px_color-mix(in_srgb,var(--tech-color)_22%,transparent)]',
          'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-yellow',
        )}
      >
        {body}
        {shineLayer}
      </button>
    </li>
  );
}

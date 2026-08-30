import { TechnologyMark } from '@/components/technologies/TechnologyMark';
import { cn } from '@/lib/cn';

/**
 * Logo + name as one unit. Used in both the scrolling marquee and the
 * reduced-motion static grid.
 *
 * @param {{
 *   technology: import('@/types').Technology;
 *   interactive?: boolean;
 * }} props
 */
export function TechnologyItem({ technology, interactive = true }) {
  const glow = technology.color ?? '#FFC20E';

  const body = (
    <>
      <span
        className={cn(
          'flex h-9 w-full items-center justify-center sm:h-10',
          interactive &&
            'transition-[filter] duration-300 ease-out hover-capable:group-hover:drop-shadow-[0_0_12px_color-mix(in_srgb,var(--tech-color)_42%,transparent)] group-focus-visible:drop-shadow-[0_0_12px_color-mix(in_srgb,var(--tech-color)_42%,transparent)] motion-reduce:group-hover:drop-shadow-none',
        )}
      >
        <TechnologyMark technology={technology} />
      </span>
      <span
        className={cn(
          'mt-3 block w-full text-center text-[0.7rem] leading-tight tracking-[-0.01em]',
          'text-secondary-foreground sm:text-[0.72rem]',
          interactive &&
            'transition-colors duration-300 group-hover:text-brand-yellow group-focus-visible:text-brand-yellow',
        )}
      >
        {technology.name}
      </span>
    </>
  );

  const shellClass = cn(
    'group flex w-[6.25rem] shrink-0 flex-col items-center justify-start sm:w-[7rem] lg:w-[7.5rem]',
  );

  if (!interactive) {
    return <li className={shellClass}>{body}</li>;
  }

  return (
    <li className={shellClass}>
      <button
        type="button"
        aria-label={technology.name}
        style={{ '--tech-color': glow }}
        className={cn(
          'flex w-full flex-col items-center justify-start px-1 py-2',
          'transition-[background-color,transform] duration-300 ease-out',
          'motion-safe:hover-capable:hover:scale-[1.03]',
          'hover-capable:hover:bg-foreground/[0.03] dark:hover-capable:hover:bg-foreground/[0.04]',
          'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-yellow',
        )}
      >
        {body}
      </button>
    </li>
  );
}

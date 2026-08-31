import { cn } from '@/lib/cn';

/**
 * Authentic technology logo, optically balanced by height while preserving
 * each mark's native aspect ratio. Transform hover lives on the parent item
 * so the logo and name travel as one unit.
 *
 * @param {{
 *   technology: import('@/types').Technology;
 *   className?: string;
 * }} props
 */
export function TechnologyMark({ technology, className }) {
  if (!technology.logo) return null;

  return (
    <img
      src={technology.logo}
      alt=""
      aria-hidden="true"
      width={technology.width ?? 64}
      height={technology.height ?? 56}
      loading="lazy"
      decoding="async"
      className={cn(
        'h-11 w-auto max-w-[5.75rem] object-contain object-center',
        'sm:h-[3.25rem] sm:max-w-[6.75rem] lg:h-16 lg:max-w-[7.75rem]',
        'opacity-[0.9] transition-[opacity,filter] duration-300 ease-out',
        'group-hover:opacity-100 group-focus-visible:opacity-100',
        technology.invertOnDark &&
          'dark:invert dark:opacity-80 dark:group-hover:opacity-100 dark:group-focus-visible:opacity-100',
        className,
      )}
    />
  );
}

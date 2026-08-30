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
      width={technology.width ?? 40}
      height={technology.height ?? 32}
      loading="lazy"
      decoding="async"
      className={cn(
        'h-7 w-auto max-w-[4.75rem] object-contain object-center',
        'sm:h-8 sm:max-w-[5.25rem] lg:h-9 lg:max-w-[6.25rem]',
        'opacity-[0.82] transition-opacity duration-300 ease-out',
        'group-hover:opacity-100 group-focus-visible:opacity-100',
        technology.invertOnDark &&
          'dark:invert dark:opacity-70 dark:group-hover:opacity-100 dark:group-focus-visible:opacity-100',
        className,
      )}
    />
  );
}

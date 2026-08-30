import { assets } from '@/config/assets';
import { siteConfig } from '@/config/site';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/cn';

const { lockup, monogram } = assets.brand;

/** Full lockup from 360px up; monogram only on the narrowest phones. */
const LOCKUP_QUERY = '(min-width: 22.5rem)';

/**
 * Brand mark, linking home.
 *
 * Monogram is reserved for 320px viewports where horizontal space is tight.
 * From 360px upward the full lockup scales by width so the wordmark stays
 * readable without distorting the asset or crowding header controls.
 *
 * @param {{ className?: string; compact?: boolean }} props
 */
export function Logo({ className, compact = false }) {
  const showLockup = useMediaQuery(LOCKUP_QUERY);
  const source = showLockup ? lockup : monogram;

  return (
    <a
      href="/"
      aria-label={`${siteConfig.name} \u2014 home`}
      className={cn(
        'logo-link flex w-fit max-w-[calc(100vw-9.5rem)] shrink-0 min-w-0',
        'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring',
        className,
      )}
    >
      <img
        src={source.src}
        width={source.width}
        height={source.height}
        alt=""
        fetchPriority="high"
        decoding="async"
        className={cn(
          'logo-mark h-auto w-auto max-w-full object-contain object-left',
          showLockup
            ? compact
              ? 'w-[8.75rem] sm:w-[10.5rem]'
              : 'w-[8.5rem] min-[375px]:w-[8.875rem] min-[390px]:w-[9.25rem] min-[414px]:w-[9.625rem] sm:w-[11rem] md:w-[12.75rem] lg:w-[14rem] xl:w-[14.25rem]'
            : 'h-9 w-auto',
        )}
      />
    </a>
  );
}

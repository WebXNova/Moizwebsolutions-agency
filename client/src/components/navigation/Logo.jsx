import { assets } from '@/config/assets';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/cn';

const { lockup } = assets.brand;

/**
 * Brand mark, linking home.
 *
 * Always uses the lockup with an explicit height so the HTML width/height
 * attributes cannot blow the mark up to its intrinsic size. Header sizing is
 * height-based so a square monogram stays navbar-sized.
 *
 * `navTarget` marks the header instance as the boot-loader flight destination.
 * Footer and mobile-menu copies must not set this.
 *
 * @param {{ className?: string; compact?: boolean; navTarget?: boolean }} props
 */
export function Logo({ className, compact = false, navTarget = false }) {
  return (
    <a
      href="/"
      aria-label={`${siteConfig.name} \u2014 home`}
      className={cn(
        'logo-link flex min-w-0 max-w-full shrink-0 items-center gap-2 sm:gap-2.5',
        'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring',
        className,
      )}
    >
      <img
        src={lockup.src}
        width={lockup.width}
        height={lockup.height}
        alt=""
        fetchPriority="high"
        decoding="async"
        data-brand-mark="lockup"
        {...(navTarget ? { 'data-nav-logo': '' } : {})}
        className={cn(
          'logo-mark w-auto shrink-0 object-contain object-left',
          compact
            ? 'h-[2.04rem] max-h-[2.04rem] sm:h-[2.295rem] sm:max-h-[2.295rem]'
            : 'h-[2.04rem] max-h-[2.04rem] sm:h-[2.295rem] sm:max-h-[2.295rem] md:h-[2.55rem] md:max-h-[2.55rem]',
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          'logo-wordmark min-w-0 truncate font-sans font-semibold leading-none tracking-[-0.03em]',
          compact
            ? 'text-[1.05rem] sm:text-[1.15rem]'
            : 'text-[1.0625rem] sm:text-[1.25rem] md:text-[1.5rem]',
        )}
      >
        <span className="logo-wordmark-ink">Moiz</span>
        <span className="logo-wordmark-blue">Web</span>
        <span className="logo-wordmark-ink">Solutions</span>
      </span>
    </a>
  );
}

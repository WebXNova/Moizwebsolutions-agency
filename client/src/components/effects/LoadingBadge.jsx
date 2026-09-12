import { cn } from '@/lib/cn';

/**
 * Compact morphing circular stroke loader (section / inline use).
 * No card — free-floating SVG + label. Matches the boot loader visual language.
 *
 * @param {{
 *   className?: string;
 *   label?: string;
 *   size?: 'sm' | 'md';
 * }} props
 */
export function LoadingBadge({ className, label = 'Loading', size = 'md' }) {
  const isSm = size === 'sm';

  return (
    <div className={cn('fx-loader flex flex-col items-center justify-center', className)}>
      <div className="fx-loader-pulse motion-safe:animate-loader-pulse">
        <div
          className={cn(
            'fx-loader-spin motion-safe:animate-loader-rotate',
            isSm ? 'size-12' : 'size-[68px] max-[600px]:size-14',
          )}
          aria-hidden="true"
        >
          <svg viewBox="0 0 100 100" className="size-full overflow-visible" aria-hidden="true">
            <circle cx="50" cy="50" r="40" className="fx-loader-track" />
            <circle cx="50" cy="50" r="40" className="fx-loader-progress" />
            <circle cx="50" cy="50" r="40" className="fx-loader-accent" />
          </svg>
        </div>
      </div>

      <span
        className={cn(
          'fx-loading-text mt-4 font-sans font-semibold uppercase tracking-[0.14em] text-brand-blue',
          'motion-safe:animate-loader-text',
          isSm ? 'text-[11px]' : 'text-[13px] max-[600px]:text-xs',
        )}
      >
        {label}
        <span className="fx-loader-dots motion-safe:animate-loader-dots" aria-hidden="true" />
      </span>
    </div>
  );
}

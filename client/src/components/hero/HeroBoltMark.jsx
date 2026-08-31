import { cn } from '@/lib/cn';

/**
 * Energy bolt accent — brand blue → yellow fill (reference-style interruption).
 *
 * @param {{ className?: string }} props
 */
export function HeroBoltMark({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn('inline-block shrink-0 overflow-visible', className)}
    >
      <defs>
        <linearGradient id="hero-bolt-grad" x1="6" y1="2" x2="18" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--color-brand-yellow)" />
          <stop offset="55%" stopColor="var(--color-brand-blue)" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
      </defs>
      <path
        fill="url(#hero-bolt-grad)"
        d="M13.85 2.2 6.4 13.1c-.22.32-.02.78.38.78h5.02l-1.55 7.72c-.12.6.66.96 1.04.48l8.05-11.2c.24-.34.01-.8-.4-.8h-5.15l1.66-7.4c.13-.58-.64-.95-1.05-.48Z"
      />
    </svg>
  );
}

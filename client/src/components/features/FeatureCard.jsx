import { cn } from '@/lib/cn';

/**
 * Shared feature-box shell — equal-height cards, staggered reveal, restrained hover.
 *
 * @param {{
 *   children: import('react').ReactNode;
 *   revealed?: boolean;
 *   delay?: number;
 *   variant?: 'surface' | 'accent';
 *   className?: string;
 * }} props
 */
export function FeatureCard({
  children,
  revealed = false,
  delay = 0,
  variant = 'surface',
  className,
}) {
  return (
    <article
      className={cn(
        'group relative flex h-full min-h-0 flex-col overflow-hidden rounded-[1.5rem] p-6 sm:p-7 lg:p-8',
        variant === 'surface' &&
          'border border-border-subtle bg-surface shadow-[0_8px_28px_-18px_rgb(20_26_34_/_0.18)]',
        variant === 'accent' && 'bg-feature-blue text-white',
        revealed ? 'motion-safe:animate-reveal-up' : 'motion-safe:opacity-0',
        'transition-[transform,box-shadow,border-color] duration-300 ease-out will-change-transform',
        'hover-capable:hover:-translate-y-1',
        variant === 'surface' &&
          'hover-capable:hover:border-border-interactive hover-capable:hover:shadow-[0_18px_40px_-22px_rgb(20_26_34_/_0.28)]',
        variant === 'accent' &&
          'hover-capable:hover:shadow-[0_18px_40px_-18px_rgb(91_124_255_/_0.55)]',
        className,
      )}
      style={revealed ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </article>
  );
}

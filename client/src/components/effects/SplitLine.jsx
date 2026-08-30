import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/cn';

/**
 * Letter-stagger reveal that keeps the original line breaks and copy.
 *
 * @param {{ text: string; className?: string; delay?: number; shimmer?: boolean }} props
 */
export function SplitLine({ text, className, delay = 0, shimmer = false }) {
  const reduced = usePrefersReducedMotion();

  if (reduced) {
    return (
      <span className={cn('block', shimmer && 'fx-shimmer-text', className)}>
        {text}
      </span>
    );
  }

  const chars = Array.from(text);

  return (
    <span className={cn('block overflow-hidden', className)}>
      {chars.map((char, index) => (
        <span
          key={`${text}-${index}`}
          className="inline-block origin-bottom will-change-transform motion-safe:animate-letter-rise"
          style={{ animationDelay: `${delay + index * 28}ms` }}
        >
          <span className={cn(shimmer && 'fx-shimmer-text motion-safe:animate-text-shimmer')}>
            {char === ' ' ? '\u00A0' : char}
          </span>
        </span>
      ))}
    </span>
  );
}

import { cn } from '@/lib/cn';

/**
 * Shared hairline separator aligned to its parent container.
 *
 * @param {{ className?: string; decorative?: boolean }} props
 */
export function Divider({ className, decorative = true }) {
  return (
    <div
      aria-hidden={decorative || undefined}
      role={decorative ? undefined : 'separator'}
      className={cn('h-px w-full bg-border-subtle', className)}
    />
  );
}

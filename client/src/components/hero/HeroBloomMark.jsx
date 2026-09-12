import { cn } from '@/lib/cn';

/**
 * Six-segment aperture / flower mark — brand-led multicolor geometric accent.
 *
 * @param {{ className?: string }} props
 */
export function HeroBloomMark({ className }) {
  const segments = [
    { d: 'M12 12 12 3 A9 9 0 0 1 19.794 7.5 Z', fill: 'var(--color-brand-blue)' },
    { d: 'M12 12 19.794 7.5 A9 9 0 0 1 19.794 16.5 Z', fill: '#60a5fa' },
    { d: 'M12 12 19.794 16.5 A9 9 0 0 1 12 21 Z', fill: 'var(--color-brand-yellow)' },
    { d: 'M12 12 12 21 A9 9 0 0 1 4.206 16.5 Z', fill: 'var(--color-brand-yellow-deep)' },
    { d: 'M12 12 4.206 16.5 A9 9 0 0 1 4.206 7.5 Z', fill: '#93c5fd' },
    { d: 'M12 12 4.206 7.5 A9 9 0 0 1 12 3 Z', fill: 'var(--color-brand-blue)' },
  ];

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn('inline-block shrink-0 overflow-visible', className)}
    >
      {segments.map((segment) => (
        <path key={segment.d} d={segment.d} fill={segment.fill} />
      ))}
      <circle cx="12" cy="12" r="2.15" fill="var(--background)" />
    </svg>
  );
}

import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/cn';

/**
 * Single yellow active dot that travels along the sidebar line.
 *
 * @param {{
 *   position: number;
 *   label?: string | null;
 *   labelSide?: 'left' | 'right';
 *   onActivate?: () => void;
 * }} props
 */
export function ActiveSectionDot({ position, label, labelSide = 'right', onActivate }) {
  const reduced = usePrefersReducedMotion();
  const [pulse, setPulse] = useState(false);
  const [hovered, setHovered] = useState(false);
  const previousPosition = useRef(position);

  useEffect(() => {
    if (previousPosition.current === position) return;
    previousPosition.current = position;

    if (reduced) return;

    setPulse(true);
    const timer = window.setTimeout(() => setPulse(false), 560);
    return () => window.clearTimeout(timer);
  }, [position, reduced]);

  return (
    <div
      className={cn(
        'pointer-events-none absolute left-1/2 z-[3] fx-side-dot',
        reduced ? '' : 'transition-[top] duration-[560ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
      )}
      style={{ top: `${position}%`, transform: 'translate(-50%, -50%)' }}
    >
      {/* Nearby line highlight — travels with the dot */}
      <span
        aria-hidden="true"
        className={cn(
          'absolute left-1/2 top-1/2 w-[2px] -translate-x-1/2 -translate-y-1/2 rounded-full',
          'bg-gradient-to-b from-transparent via-brand-blue/70 to-transparent',
          'fx-side-dot-highlight',
          pulse && !reduced ? 'opacity-100' : 'opacity-70',
          reduced ? '' : 'transition-opacity duration-500',
        )}
      />

      <button
        type="button"
        onClick={onActivate}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        aria-label={label ? `Current section: ${label}. Click to scroll.` : 'Current section'}
        className={cn(
          'pointer-events-auto relative flex items-center justify-center rounded-full',
          'fx-side-dot-button',
          'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-yellow',
          hovered && !reduced && 'fx-side-dot-hover',
          !reduced && pulse && 'fx-side-dot-pulse',
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'absolute inset-0 rounded-full border border-brand-blue/55',
            'transition-[box-shadow,transform] duration-300',
            pulse && !reduced
              ? 'shadow-[0_0_16px_rgb(37_99_235_/_0.5)]'
              : hovered
                ? 'shadow-[0_0_12px_rgb(37_99_235_/_0.35)]'
                : 'shadow-[0_0_8px_rgb(37_99_235_/_0.22)]',
          )}
        />
        <span
          aria-hidden="true"
          className={cn(
            'relative rounded-full bg-brand-yellow fx-side-dot-core',
            'transition-[transform,box-shadow] duration-300',
            hovered && !reduced && 'scale-110 shadow-[0_0_14px_rgb(255_194_14_/_0.7)]',
            pulse && !reduced && 'shadow-[0_0_16px_rgb(255_194_14_/_0.75)]',
          )}
        />
      </button>

      {label && hovered ? (
        <span
          role="tooltip"
          className={cn(
            'pointer-events-none absolute top-1/2 -translate-y-1/2 whitespace-nowrap',
            'rounded-sm border border-brand-blue/25 bg-background/95 px-2.5 py-1',
            'text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground shadow-sm backdrop-blur-sm',
            'fx-side-label',
            labelSide === 'left'
              ? 'right-[calc(100%+0.7rem)]'
              : 'left-[calc(100%+0.7rem)]',
          )}
        >
          {label}
        </span>
      ) : null}
    </div>
  );
}

import { useCallback, useRef } from 'react';
import { serviceIconMap } from '@/lib/icons';
import { cn } from '@/lib/cn';
import { useFinePointer, usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * Squared editorial mark — drawn on reveal, magnetically nudged on desktop.
 *
 * @param {{
 *   name: string;
 *   active?: boolean;
 *   drawn?: boolean;
 *   index?: number;
 * }} props
 */
export function ServiceIcon({ name, active = false, drawn = false, index = 0 }) {
  const wrapRef = useRef(/** @type {HTMLSpanElement | null} */ (null));
  const finePointer = useFinePointer();
  const reduced = usePrefersReducedMotion();
  const magnetic = finePointer && !reduced;
  const Icon = serviceIconMap[name];

  const reset = useCallback(() => {
    const node = wrapRef.current;
    if (!node) return;
    node.style.transform = 'translate3d(0, 0, 0)';
  }, []);

  const handlePointerMove = useCallback(
    (event) => {
      if (!magnetic || event.pointerType !== 'mouse') return;
      const node = wrapRef.current;
      if (!node) return;
      const bounds = node.getBoundingClientRect();
      const x = event.clientX - bounds.left - bounds.width / 2;
      const y = event.clientY - bounds.top - bounds.height / 2;
      node.style.transform = `translate3d(${Math.max(-5, Math.min(5, x * 0.14))}px, ${Math.max(-4, Math.min(4, y * 0.14))}px, 0)`;
    },
    [magnetic],
  );

  return (
    <span
      ref={wrapRef}
      aria-hidden="true"
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      className={cn(
        'service-frame relative flex h-14 w-14 items-center justify-center overflow-hidden border',
        'transition-[border-color,color,background-color,transform] duration-500 ease-out',
        'will-change-transform',
        active
          ? 'border-brand-yellow/80 bg-brand-yellow/[0.08] text-brand-yellow shadow-[0_0_22px_rgb(255_194_14_/_0.28)]'
          : 'border-border text-secondary-foreground group-hover:border-foreground/45 group-hover:text-foreground',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-brand-yellow/35 to-transparent',
          'opacity-0 group-hover:opacity-100 group-hover:animate-service-frame motion-reduce:hidden',
        )}
      />
      {Icon ? (
        <Icon
          className={cn(
            'service-glyph relative h-7 w-7',
            drawn && !reduced && 'is-drawn',
          )}
          style={drawn && !reduced ? { animationDelay: `${180 + index * 90}ms` } : undefined}
        />
      ) : null}
    </span>
  );
}

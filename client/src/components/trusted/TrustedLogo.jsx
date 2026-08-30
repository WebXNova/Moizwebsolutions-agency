import { useCallback, useRef } from 'react';
import { cn } from '@/lib/cn';
import { useFinePointer, usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * Single trusted-company mark with a restrained desktop magnetic hover.
 *
 * @param {{
 *   company: import('@/types').TrustedCompany;
 *   active: boolean;
 *   reduced: boolean;
 *   index: number;
 *   stagger: number;
 * }} props
 */
export function TrustedLogo({ company, active, reduced, index, stagger }) {
  const wrapRef = useRef(/** @type {HTMLLIElement | null} */ (null));
  const finePointer = useFinePointer();
  const prefersReduced = usePrefersReducedMotion();
  const magnetic = finePointer && !prefersReduced && !reduced;
  const play = active && !reduced;

  const reset = useCallback(() => {
    const node = wrapRef.current;
    if (!node) return;
    node.style.transform = 'translate3d(0, 0, 0)';
    node.style.setProperty('--pointer-x', '50%');
    node.style.setProperty('--pointer-y', '50%');
  }, []);

  const handlePointerMove = useCallback(
    (event) => {
      if (!magnetic || event.pointerType !== 'mouse') return;
      const node = wrapRef.current;
      if (!node) return;

      const bounds = node.getBoundingClientRect();
      const x = event.clientX - bounds.left - bounds.width / 2;
      const y = event.clientY - bounds.top - bounds.height / 2;
      const dx = Math.max(-5, Math.min(5, x * 0.12));
      const dy = Math.max(-4, Math.min(4, y * 0.12));
      node.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      node.style.setProperty('--pointer-x', `${event.clientX - bounds.left}px`);
      node.style.setProperty('--pointer-y', `${event.clientY - bounds.top}px`);
    },
    [magnetic],
  );

  return (
    <li
      ref={wrapRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      onBlur={reset}
      className={cn(
        'group/logo relative flex items-center justify-center will-change-transform',
        'transition-[transform,filter] duration-300 ease-out',
        magnetic && 'hover-capable:hover:brightness-[1.18]',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute -inset-3 rounded-full opacity-0 transition-opacity duration-300',
          'hover-capable:group-hover/logo:opacity-100 motion-reduce:hidden',
        )}
        style={{
          background:
            'radial-gradient(2.4rem circle at var(--pointer-x, 50%) var(--pointer-y, 50%), rgb(255 255 255 / 0.16), transparent 70%)',
        }}
      />
      <span
        className={cn(
          'flex items-center justify-center',
          play && 'animate-band-logo',
          !play && !reduced && 'opacity-0',
        )}
        style={play ? { animationDelay: `${300 + index * stagger}ms` } : undefined}
      >
        <img
          src={company.logo}
          alt={company.name}
          loading="lazy"
          width={company.width}
          height={company.height}
          className="relative h-5 w-auto max-w-[5.5rem] object-contain object-center sm:h-6 sm:max-w-[6.5rem] md:h-7 md:max-w-[7.5rem]"
        />
      </span>
    </li>
  );
}

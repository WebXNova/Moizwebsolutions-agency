import { useCallback, useRef } from 'react';
import { useFinePointer, usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * Subtle cursor attraction for CTAs. Disabled on touch and reduced-motion.
 *
 * @param {{ strength?: number }} [options]
 */
export function useMagnetic(options = {}) {
  const strength = options.strength ?? 0.16;
  const ref = useRef(/** @type {HTMLElement | null} */ (null));
  const fine = useFinePointer();
  const reduced = usePrefersReducedMotion();
  const enabled = fine && !reduced;

  const reset = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    node.style.transform = 'translate3d(0, 0, 0)';
  }, []);

  const onPointerMove = useCallback(
    (event) => {
      if (!enabled || event.pointerType !== 'mouse') return;
      const node = ref.current;
      if (!node) return;
      const bounds = node.getBoundingClientRect();
      const x = event.clientX - bounds.left - bounds.width / 2;
      const y = event.clientY - bounds.top - bounds.height / 2;
      node.style.transform = `translate3d(${x * strength}px, ${y * strength}px, 0)`;
      node.style.setProperty('--pointer-x', `${event.clientX - bounds.left}px`);
      node.style.setProperty('--pointer-y', `${event.clientY - bounds.top}px`);
    },
    [enabled, strength],
  );

  return { ref, onPointerMove, onPointerLeave: reset, onBlur: reset, enabled };
}

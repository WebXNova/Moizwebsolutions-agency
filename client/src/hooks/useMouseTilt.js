import { useCallback, useRef } from 'react';
import { useFinePointer, usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * Subtle 3D tilt toward the pointer. Disabled on touch and reduced-motion.
 *
 * @param {{ max?: number }} [options]
 */
export function useMouseTilt(options = {}) {
  const max = options.max ?? 6;
  const nodeRef = useRef(/** @type {HTMLElement | null} */ (null));
  const fine = useFinePointer();
  const reduced = usePrefersReducedMotion();
  const enabled = fine && !reduced;

  const reset = useCallback(() => {
    const node = nodeRef.current;
    if (!node) return;
    node.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
  }, []);

  const onPointerMove = useCallback(
    (event) => {
      if (!enabled || event.pointerType !== 'mouse') return;
      const node = nodeRef.current;
      if (!node) return;
      const bounds = node.getBoundingClientRect();
      const px = (event.clientX - bounds.left) / bounds.width - 0.5;
      const py = (event.clientY - bounds.top) / bounds.height - 0.5;
      node.style.transform = `perspective(900px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg)`;
    },
    [enabled, max],
  );

  return { nodeRef, onPointerMove, onPointerLeave: reset, enabled };
}

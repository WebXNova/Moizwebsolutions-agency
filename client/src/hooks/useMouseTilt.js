import { useCallback, useRef } from 'react';
import { useFinePointer, usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

function flatTransform(perspective) {
  return `perspective(${perspective}px) rotateX(0deg) rotateY(0deg)`;
}

/**
 * Subtle 3D tilt toward the pointer. Disabled on touch and reduced-motion.
 *
 * `max` is the tilt in degrees at the card edge (corners combine both axes).
 *
 * @param {{ max?: number; perspective?: number }} [options]
 */
export function useMouseTilt(options = {}) {
  const max = options.max ?? 8;
  const perspective = options.perspective ?? 1000;
  const nodeRef = useRef(/** @type {HTMLElement | null} */ (null));
  const tracking = useRef(false);
  const fine = useFinePointer();
  const reduced = usePrefersReducedMotion();
  const enabled = fine && !reduced;

  const reset = useCallback(() => {
    const node = nodeRef.current;
    if (!node) return;
    tracking.current = false;
    node.style.transition = 'transform 400ms ease-out';
    node.style.transform = flatTransform(perspective);
  }, [perspective]);

  const onPointerMove = useCallback(
    (event) => {
      if (!enabled || event.pointerType !== 'mouse') return;
      const node = nodeRef.current;
      if (!node) return;

      const bounds = event.currentTarget.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;

      const px = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      const py = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
      const rotateX = Math.max(-max, Math.min(max, -py * max));
      const rotateY = Math.max(-max, Math.min(max, px * max));

      node.style.transition = 'transform 180ms ease-out';
      tracking.current = true;
      node.style.transform = `perspective(${perspective}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
    },
    [enabled, max, perspective],
  );

  return { nodeRef, onPointerMove, onPointerLeave: reset, onPointerCancel: reset, enabled };
}

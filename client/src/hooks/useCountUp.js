import { useEffect, useState } from 'react';
import { useInViewOnce } from '@/hooks/useInView';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * Counts from 0 to `target` once the node enters view.
 *
 * @param {number} target
 * @param {{ duration?: number }} [options]
 * @returns {[import('react').RefObject<HTMLElement | null>, number]}
 */
export function useCountUp(target, options = {}) {
  const duration = options.duration ?? 1100;
  const [ref, inView] = useInViewOnce({ threshold: 0.4 });
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = useState(reduced ? target : 0);

  useEffect(() => {
    if (!inView) return undefined;
    if (reduced) {
      setValue(target);
      return undefined;
    }

    const start = performance.now();
    let frame = 0;

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      setValue(Math.round(target * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduced, target, duration]);

  return [ref, value];
}

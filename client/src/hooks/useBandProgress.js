import { useEffect } from 'react';

/**
 * Writes `--band-progress` (0–1) onto an existing node while enabled.
 * A single rAF-throttled scroll listener; no React state on scroll.
 *
 * @param {import('react').RefObject<HTMLElement | null>} ref
 * @param {boolean} enabled
 */
export function useBandProgress(ref, enabled) {
  useEffect(() => {
    const node = ref.current;
    if (!enabled || !node) return undefined;

    let frame = 0;

    const measure = () => {
      frame = 0;
      const rect = node.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const start = vh * 0.92;
      const end = vh * 0.28;
      const raw = (start - rect.top) / (start - end);
      const progress = Math.min(1, Math.max(0, raw));
      node.style.setProperty('--band-progress', progress.toFixed(3));
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    measure();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ref, enabled]);
}

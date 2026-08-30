import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * Scroll-driven parallax for the hero columns. Uses transforms only (GPU).
 *
 * @returns {{ contentRef: import('react').RefObject<HTMLElement | null>; visualRef: import('react').RefObject<HTMLElement | null> }}
 */
export function useHeroParallax() {
  const contentRef = useRef(/** @type {HTMLElement | null} */ (null));
  const visualRef = useRef(/** @type {HTMLElement | null} */ (null));
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return undefined;

    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      if (contentRef.current) {
        contentRef.current.style.transform = `translate3d(0, ${(y * 0.07).toFixed(1)}px, 0)`;
        contentRef.current.style.opacity = String(Math.max(0.55, 1 - y / 900));
      }
      if (visualRef.current) {
        visualRef.current.style.transform = `translate3d(0, ${(y * 0.16).toFixed(1)}px, 0)`;
      }
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduced]);

  return { contentRef, visualRef };
}

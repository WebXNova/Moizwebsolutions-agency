import { useEffect, useRef, useState } from 'react';
import { useFinePointer, usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/cn';

const HOT_SELECTOR = 'a, button, [role="button"], input, textarea, select, label';

/**
 * Trailing ring + gold dot. Native cursor stays visible.
 */
export function CustomCursor() {
  const fine = useFinePointer();
  const reduced = usePrefersReducedMotion();
  const dotRef = useRef(/** @type {HTMLSpanElement | null} */ (null));
  const ringRef = useRef(/** @type {HTMLSpanElement | null} */ (null));
  const pos = useRef({ x: 0, y: 0, rx: 0, ry: 0 });
  const [hot, setHot] = useState(false);

  useEffect(() => {
    if (!fine || reduced) return undefined;

    let frame = 0;

    const onMove = (event) => {
      pos.current.x = event.clientX;
      pos.current.y = event.clientY;
      const target = event.target;
      setHot(target instanceof Element && Boolean(target.closest(HOT_SELECTOR)));
    };

    const tick = () => {
      const next = pos.current;
      next.rx += (next.x - next.rx) * 0.18;
      next.ry += (next.y - next.ry) * 0.18;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${next.x}px, ${next.y}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${next.rx}px, ${next.ry}px, 0) translate(-50%, -50%)`;
      }
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    frame = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(frame);
    };
  }, [fine, reduced]);

  if (!fine || reduced) return null;

  return (
    <>
      <span ref={dotRef} className="fx-cursor-dot" aria-hidden="true" />
      <span
        ref={ringRef}
        className={cn('fx-cursor-ring', hot && 'is-hot')}
        aria-hidden="true"
      />
    </>
  );
}

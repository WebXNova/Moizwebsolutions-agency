import { useEffect } from 'react';
import { useFinePointer, usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * Cursor-tracking warm radial wash. Does not replace the system cursor.
 */
export function AmbientGlow() {
  const fine = useFinePointer();
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!fine || reduced) return undefined;

    const root = document.documentElement;
    const onMove = (event) => {
      root.style.setProperty('--pointer-x', `${event.clientX}px`);
      root.style.setProperty('--pointer-y', `${event.clientY}px`);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [fine, reduced]);

  if (!fine || reduced) return null;
  return <div className="fx-ambient" aria-hidden="true" />;
}

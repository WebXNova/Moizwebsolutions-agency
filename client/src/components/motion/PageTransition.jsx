import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/cn';

const WIPE_MS = 560;

/**
 * Restrained clip-path wipe on public route changes.
 * Skips the first mount and honors prefers-reduced-motion.
 */
export function PageTransition({ children }) {
  const location = useLocation();
  const reduced = usePrefersReducedMotion();
  const previousPath = useRef(location.pathname);
  const [wiping, setWiping] = useState(false);

  useEffect(() => {
    const pathChanged = previousPath.current !== location.pathname;
    previousPath.current = location.pathname;
    const timers = [];

    if (location.hash) {
      const delay = pathChanged && !reduced ? 280 : 0;
      timers.push(
        window.setTimeout(() => {
          const node = document.getElementById(location.hash.slice(1));
          if (node) {
            node.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
          }
        }, delay),
      );
    } else if (pathChanged) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }

    if (pathChanged && !reduced) {
      setWiping(true);
      timers.push(window.setTimeout(() => setWiping(false), WIPE_MS));
    }

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [location.pathname, location.hash, reduced]);

  return (
    <>
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none fixed inset-0 z-[80] bg-closing-panel',
          wiping ? 'animate-page-wipe' : 'hidden',
        )}
      />
      {children}
    </>
  );
}

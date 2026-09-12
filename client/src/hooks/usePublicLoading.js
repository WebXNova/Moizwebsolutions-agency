import { useEffect, useRef, useState } from 'react';
import { useSiteContent } from '@/hooks/useSiteContent';

/** Entrance (520ms) plus a short idle breath so a cached CMS response still feels intentional. */
const MIN_VISIBLE_MS = 880;

/**
 * Keeps the public loading screen visible until site content has settled,
 * with a short minimum so fast responses do not flash.
 *
 * @returns {boolean}
 */
export function usePublicLoading() {
  const { loading } = useSiteContent();
  const [active, setActive] = useState(true);
  const startedAt = useRef(typeof performance !== 'undefined' ? performance.now() : Date.now());

  useEffect(() => {
    if (loading) {
      startedAt.current = typeof performance !== 'undefined' ? performance.now() : Date.now();
      setActive(true);
      return undefined;
    }

    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const wait = Math.max(0, MIN_VISIBLE_MS - (now - startedAt.current));
    const timer = window.setTimeout(() => setActive(false), wait);
    return () => window.clearTimeout(timer);
  }, [loading]);

  return active;
}

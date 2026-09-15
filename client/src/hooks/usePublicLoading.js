import { useEffect, useState } from 'react';

/** Fixed display window — animations play inside this; they do not control dismiss. */
const MIN_VISIBLE_MS = 2500;

/**
 * Keeps the public loading screen visible for a short, reliable duration.
 * Not tied to CMS fetches or animation completion callbacks.
 *
 * @returns {boolean}
 */
export function usePublicLoading() {
  const [active, setActive] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setActive(false), MIN_VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return active;
}

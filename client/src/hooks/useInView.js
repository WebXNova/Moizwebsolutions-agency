import { useEffect, useRef, useState } from 'react';

/**
 * Observes an element and flips to `true` the first time it enters the
 * viewport. The observer disconnects immediately so the reveal does not
 * replay on subsequent scrolls.
 *
 * @param {{ threshold?: number; rootMargin?: string }} [options]
 * @returns {[import('react').RefObject<HTMLElement | null>, boolean]}
 */
export function useInViewOnce(options = {}) {
  const { threshold = 0.16, rootMargin = '0px 0px -8% 0px' } = options;
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (isInView) return undefined;

    const node = ref.current;
    if (!node) return undefined;

    if (typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isInView, threshold, rootMargin]);

  return [ref, isInView];
}

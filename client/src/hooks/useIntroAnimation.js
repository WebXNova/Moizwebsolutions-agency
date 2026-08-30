import { useCallback, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * Survives remounts for the lifetime of the page, so the entrance plays on
 * load and refresh but not again on a client-side route change. Latching on
 * completion rather than on mount means StrictMode's development remount, which
 * happens long before the animation finishes, does not swallow it.
 */
let hasCompleted = false;

/**
 * Drives a one-shot entrance animation.
 *
 * @returns {{ isPlaying: boolean; onComplete: () => void }}
 */
export function useIntroAnimation() {
  const prefersReducedMotion = useReducedMotion();
  const [isComplete, setIsComplete] = useState(hasCompleted);

  const onComplete = useCallback(() => {
    hasCompleted = true;
    setIsComplete(true);
  }, []);

  return { isPlaying: !prefersReducedMotion && !isComplete, onComplete };
}

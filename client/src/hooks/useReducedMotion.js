import { useMediaQuery } from '@/hooks/useMediaQuery';

/**
 * @returns {boolean}
 */
export function useReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

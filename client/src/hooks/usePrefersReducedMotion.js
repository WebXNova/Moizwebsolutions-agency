import { useMediaQuery } from '@/hooks/useMediaQuery';

/** True when the visitor has requested reduced motion. */
export function usePrefersReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/** Fine pointer + hover, used to gate magnetic pointer-follow effects. */
export function useFinePointer() {
  return useMediaQuery('(hover: hover) and (pointer: fine)');
}

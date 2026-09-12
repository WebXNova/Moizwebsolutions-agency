import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/** Scroll-tied cinematic wash — navy/gold, not a layout change. */
export function ColorGrade() {
  const reduced = usePrefersReducedMotion();
  if (reduced) return null;
  return <div className="fx-grade" aria-hidden="true" />;
}

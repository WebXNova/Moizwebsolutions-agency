import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/** Subtle film grain overlay — texture only, no layout impact. */
export function FilmGrain() {
  const reduced = usePrefersReducedMotion();
  if (reduced) return null;
  return <div className="fx-grain motion-safe:animate-grain" aria-hidden="true" />;
}

import { useScrollProgress } from '@/hooks/useScrollProgress';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/** Thin brand-yellow reading progress along the top edge. */
export function ScrollProgress() {
  const progress = useScrollProgress();
  const reduced = usePrefersReducedMotion();

  return (
    <div
      role="progressbar"
      aria-label="Page scroll progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      className="pointer-events-none fixed inset-x-0 top-0 z-[90] h-[2px] bg-foreground/10"
    >
      <span
        className="fx-progress block h-full bg-brand-yellow"
        style={{ '--scroll-progress': reduced ? 1 : progress }}
      />
    </div>
  );
}

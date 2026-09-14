import { ArrowRightIcon } from '@/lib/icons';
import { cn } from '@/lib/cn';
import { useMagnetic } from '@/hooks/useMagnetic';

/**
 * Compact yellow CTA with restrained magnetic follow, arrow nudge, and shine.
 *
 * @param {{
 *   onClick?: () => void;
 *   children?: import('react').ReactNode;
 *   className?: string;
 * }} props
 */
export function MagneticCta({ onClick, children = 'Start Your Project', className }) {
  const { ref, onPointerMove, onPointerLeave, onBlur } = useMagnetic({ strength: 0.16 });

  return (
    <button
      ref={/** @type {import('react').Ref<HTMLButtonElement>} */ (ref)}
      type="button"
      onClick={onClick}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onBlur={onBlur}
      className={cn(
        'group relative isolate inline-flex items-center justify-center gap-2.5 overflow-hidden',
        'max-w-full rounded-sm bg-brand-yellow px-5 py-3.5 sm:px-6',
        'text-cta font-semibold uppercase leading-none tracking-[0.16em] text-brand-ink',
        'transition-[background-color,opacity] duration-300 ease-out will-change-transform',
        'hover:bg-brand-yellow-deep hover:opacity-85',
        'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-yellow',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300',
          'group-hover:opacity-100 motion-reduce:hidden',
        )}
        style={{
          background:
            'radial-gradient(7rem circle at var(--pointer-x, 50%) var(--pointer-y, 50%), rgb(255 255 255 / 0.45), transparent 70%)',
        }}
      />
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 -translate-x-full skew-x-[-14deg]',
          'bg-gradient-to-r from-transparent via-white/50 to-transparent',
          'motion-safe:group-hover:animate-cta-shine motion-reduce:hidden',
        )}
      />
      <span className="relative">{children}</span>
      <ArrowRightIcon
        aria-hidden="true"
        className="relative h-3 w-3 transition-transform duration-300 ease-out motion-safe:group-hover:translate-x-0.5"
      />
    </button>
  );
}

import { ArrowRightIcon } from '@/lib/icons';
import { cn } from '@/lib/cn';
import { useMagnetic } from '@/hooks/useMagnetic';

/**
 * Premium hero conversion CTA — Moiz yellow fill, magnetic follow,
 * pointer-tracked highlight, shine sweep, and arrow nudge.
 *
 * @param {{ onClick?: () => void; className?: string; children?: import('react').ReactNode }} props
 */
export function HeroCTA({ onClick, className, children = 'Let\u2019s talk' }) {
  const { ref, onPointerMove, onPointerLeave, onBlur } = useMagnetic({ strength: 0.14 });

  return (
    <button
      ref={/** @type {import('react').Ref<HTMLButtonElement>} */ (ref)}
      type="button"
      onClick={onClick}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onBlur={onBlur}
      className={cn(
        'group relative isolate mt-11 inline-flex items-center justify-center gap-3 overflow-hidden',
        'rounded-md border border-brand-yellow bg-brand-yellow px-8 py-5',
        'text-cta font-semibold uppercase leading-none tracking-[0.18em] text-brand-ink',
        'shadow-[0_1px_0_rgb(255_255_255_/_0.4)_inset,0_10px_28px_-12px_rgb(255_194_14_/_0.7)]',
        'transition-[box-shadow,border-color] duration-300 ease-out will-change-transform',
        'hover:shadow-[0_1px_0_rgb(255_255_255_/_0.55)_inset,0_18px_40px_-14px_rgb(255_194_14_/_0.85)]',
        'motion-safe:active:scale-[0.98] motion-reduce:active:scale-100',
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
            'radial-gradient(9rem circle at var(--pointer-x, 50%) var(--pointer-y, 50%), rgb(255 255 255 / 0.55), transparent 70%)',
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
        className="relative h-3.5 w-3.5 transition-transform duration-300 ease-out motion-safe:group-hover:translate-x-1"
      />
    </button>
  );
}

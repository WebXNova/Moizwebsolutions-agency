import { ArrowRightIcon, SpinnerIcon } from '@/lib/icons';
import { cn } from '@/lib/cn';

/**
 * Premium yellow action — highlight sweep, arrow nudge, lift and glow.
 *
 * While `loading` is true the button is inert: no sweep, no lift, no arrow, and
 * `disabled` blocks the repeat clicks that would otherwise send duplicate
 * briefs.
 *
 * @param {{
 *   children: import('react').ReactNode;
 *   onClick?: () => void;
 *   type?: 'button' | 'submit';
 *   withArrow?: boolean;
 *   loading?: boolean;
 *   disabled?: boolean;
 *   icon?: import('react').ReactNode;
 *   className?: string;
 * }} props
 */
export function PrimaryAction({
  children,
  onClick,
  type = 'button',
  withArrow = true,
  loading = false,
  disabled = false,
  icon,
  className,
}) {
  const inert = loading || disabled;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={inert}
      aria-busy={loading || undefined}
      className={cn(
        'group relative isolate inline-flex items-center justify-center gap-2.5 overflow-hidden',
        'rounded-md border border-brand-yellow bg-brand-yellow px-7 py-3.5',
        'text-[0.6875rem] font-semibold uppercase leading-none tracking-[0.16em] text-brand-ink',
        'shadow-[0_1px_0_rgb(255_255_255_/_0.35)_inset,0_8px_22px_-10px_rgb(255_194_14_/_0.65)]',
        'transition-[transform,box-shadow,border-color,opacity] duration-300 ease-out',
        'focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand-yellow',
        inert
          ? 'cursor-not-allowed opacity-90 shadow-[0_1px_0_rgb(255_255_255_/_0.35)_inset]'
          : cn(
              'motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.98]',
              'hover:shadow-[0_1px_0_rgb(255_255_255_/_0.5)_inset,0_14px_30px_-10px_rgb(255_194_14_/_0.8)]',
            ),
        className,
      )}
    >
      {inert ? null : (
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-0 -translate-x-full skew-x-[-14deg]',
            'bg-gradient-to-r from-transparent via-white/45 to-transparent',
            'motion-safe:group-hover:animate-cta-shine motion-reduce:hidden',
          )}
        />
      )}

      {loading ? (
        <SpinnerIcon
          aria-hidden="true"
          className="relative h-3.5 w-3.5 motion-safe:animate-spin motion-reduce:animate-none"
        />
      ) : (
        icon
      )}

      <span className="relative">{children}</span>

      {withArrow && !loading ? (
        <ArrowRightIcon
          aria-hidden="true"
          className="relative h-3.5 w-3.5 transition-transform duration-300 ease-out motion-safe:group-hover:translate-x-1"
        />
      ) : null}
    </button>
  );
}

/**
 * Quiet bordered action for back navigation and alternate contact routes.
 *
 * @param {{
 *   children: import('react').ReactNode;
 *   onClick?: () => void;
 *   href?: string;
 *   icon?: import('react').ReactNode;
 *   disabled?: boolean;
 *   className?: string;
 * }} props
 */
export function GhostAction({ children, onClick, href, icon, disabled = false, className }) {
  const classes = cn(
    'group inline-flex items-center justify-center gap-2 rounded-md border border-hairline bg-panel',
    'px-5 py-3.5 text-[0.6875rem] font-medium uppercase leading-none tracking-[0.14em] text-ink-muted',
    'transition-[border-color,color,background-color,transform,opacity] duration-200 ease-out',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow',
    disabled
      ? 'cursor-not-allowed opacity-50'
      : cn(
          'hover:border-hairline-strong hover:bg-panel-soft hover:text-ink',
          'motion-safe:active:scale-[0.98]',
        ),
    className,
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" className={classes}>
        {icon}
        {children}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={classes}>
      {icon}
      {children}
    </button>
  );
}

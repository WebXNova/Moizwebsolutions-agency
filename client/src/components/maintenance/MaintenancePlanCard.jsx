import { assets } from '@/config/assets';
import { CheckIcon, CloseIcon, MonitorIcon } from '@/lib/icons';
import { NextJsMark, VercelMark } from '@/components/maintenance/MaintenanceMarks';
import { useMagnetic } from '@/hooks/useMagnetic';
import { cn } from '@/lib/cn';

const TAG_ICONS = {
  'NEXT.JS': NextJsMark,
  VERCEL: VercelMark,
};

/**
 * @param {{
 *   plan: import('@/data/maintenancePlans').MaintenancePlan;
 *   includedLabel: string;
 *   popularLabel: string;
 * }} props
 */
export function MaintenancePlanCard({ plan, includedLabel, popularLabel }) {
  const featured = Boolean(plan.popular);
  const preview = assets.work.mrbClasses;
  const collage = assets.heroVisual;
  const { ref, onPointerMove, onPointerLeave, onBlur } = useMagnetic({ strength: 0.14 });

  return (
    <article
      className={cn(
        'group/card flex h-full flex-col rounded-[1.25rem] bg-white p-6 shadow-[0_12px_32px_-18px_rgba(0,0,0,0.12)] sm:p-8',
        'dark:bg-surface-elevated dark:shadow-[0_12px_32px_-18px_rgba(0,0,0,0.45)]',
        'transition-all duration-300 [transition-timing-function:ease]',
        'hover-capable:hover:-translate-y-[7px] hover-capable:hover:shadow-[0_22px_44px_-14px_rgba(0,0,0,0.16)]',
        featured && 'ring-1 ring-brand-blue/20',
      )}
    >
      <div className="flex items-start justify-between gap-4">
        {featured ? (
          <div className="relative h-12 w-12 shrink-0 sm:h-14 sm:w-14">
            <img
              src={preview.src}
              alt=""
              width={56}
              height={56}
              className="h-full w-full rounded-xl object-cover"
              loading="lazy"
              decoding="async"
            />
            <img
              src={collage.src}
              alt=""
              width={28}
              height={28}
              className="absolute -bottom-1 -right-1 h-7 w-7 rounded-md border-2 border-white object-cover dark:border-surface-elevated"
              loading="lazy"
              decoding="async"
            />
          </div>
        ) : (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-black/10 text-brand-ink dark:border-white/15 dark:text-foreground sm:h-14 sm:w-14">
            <MonitorIcon className="h-5 w-5" />
          </span>
        )}

        <p className="pt-0.5 text-right leading-none text-brand-ink dark:text-foreground">
          <span className="mr-1 align-top text-[0.6875rem] font-semibold tracking-[0.08em] text-muted-foreground">
            {plan.currency}
          </span>
          <span className="font-display text-[1.85rem] font-bold tracking-[-0.04em] sm:text-[2.05rem]">
            {plan.amount}
          </span>
          <span className="ml-0.5 align-middle text-[0.8125rem] font-medium text-muted-foreground">
            {plan.period}
          </span>
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <h3 className="font-display text-[1.35rem] font-bold tracking-[-0.03em] text-brand-ink dark:text-foreground sm:text-[1.5rem]">
          {plan.name}
        </h3>
        {featured ? (
          <span className="inline-flex items-center rounded-full bg-brand-blue px-2.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-white">
            {popularLabel}
          </span>
        ) : null}
      </div>

      <p className="mt-2 text-[0.9375rem] leading-relaxed text-secondary-foreground">{plan.description}</p>

      <button
        ref={/** @type {import('react').Ref<HTMLButtonElement>} */ (ref)}
        type="button"
        tabIndex={-1}
        aria-disabled="true"
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onBlur={onBlur}
        className={cn(
          'group relative isolate mt-6 inline-flex min-h-11 w-full items-center justify-between gap-3 overflow-hidden rounded-xl px-4 py-3.5',
          'text-[0.75rem] font-semibold uppercase tracking-[0.14em]',
          'transition-[box-shadow,border-color,opacity] duration-300 ease-out will-change-transform',
          'hover:opacity-85',
          'motion-safe:active:scale-[0.98] motion-reduce:active:scale-100',
          'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-yellow',
          featured
            ? 'bg-brand-ink text-white'
            : 'bg-black/[0.06] text-brand-ink dark:bg-white/10 dark:text-foreground',
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
        <span className="relative">{plan.cta}</span>
        <span
          aria-hidden="true"
          className={cn(
            'relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border',
            'transition-transform duration-300 ease-out motion-safe:group-hover:translate-x-1',
            featured
              ? 'border-white/90 text-white'
              : 'border-brand-ink text-brand-ink dark:border-foreground dark:text-foreground',
          )}
        >
          <CloseIcon className="h-3 w-3" />
        </span>
      </button>

      <p className="mt-8 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-brand-ink dark:text-foreground">
        {includedLabel}
      </p>

      <ul className="mt-4 flex flex-1 flex-col gap-3">
        {plan.includes.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-[0.875rem] leading-snug text-secondary-foreground">
            <CheckIcon
              className={cn(
                'mt-0.5 h-4 w-4 shrink-0',
                featured ? 'text-brand-blue' : 'text-muted-foreground',
              )}
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-wrap gap-2">
        {plan.tags.map((tag) => {
          const Icon = TAG_ICONS[tag];
          return (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.05] px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-secondary-foreground dark:bg-white/10"
            >
              {Icon ? <Icon className="h-3.5 w-3.5 text-brand-ink dark:text-foreground" /> : null}
              {tag}
            </span>
          );
        })}
      </div>
    </article>
  );
}

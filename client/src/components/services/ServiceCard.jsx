import { useCallback, useRef } from 'react';
import { ServiceDetails } from '@/components/services/ServiceDetails';
import { ServiceIcon } from '@/components/services/ServiceIcon';
import { ChevronRightIcon } from '@/lib/icons';
import { cn } from '@/lib/cn';
import { useFinePointer, usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * Editorial service column: category, animated icon, title, short copy,
 * and an expandable offering list. Hover previews details; click/keyboard
 * locks the active state.
 *
 * @param {{
 *   service: import('@/types').ServiceGroup;
 *   active?: boolean;
 *   revealed?: boolean;
 *   index?: number;
 *   onToggle?: () => void;
 * }} props
 */
export function ServiceCard({ service, active = false, revealed = true, index = 0, onToggle }) {
  const cardRef = useRef(/** @type {HTMLElement | null} */ (null));
  const finePointer = useFinePointer();
  const reduced = usePrefersReducedMotion();
  const label = service.label ?? service.title;
  const headingId = `service-${service.id}`;
  const play = revealed && !reduced;

  const handlePointerMove = useCallback(
    (event) => {
      if (!finePointer || reduced || event.pointerType !== 'mouse') return;
      const node = cardRef.current;
      if (!node) return;
      const bounds = node.getBoundingClientRect();
      node.style.setProperty('--mx', `${event.clientX - bounds.left}px`);
      node.style.setProperty('--my', `${event.clientY - bounds.top}px`);
    },
    [finePointer, reduced],
  );

  return (
    <li
      className={cn(
        'min-w-0',
        play && 'animate-service-col',
        !play && !reduced && 'opacity-0',
      )}
      style={
        play
          ? {
              animationDelay: `${160 + index * 90}ms`,
              '--entry-x': index % 2 === 0 ? '-1.75rem' : '1.75rem',
            }
          : undefined
      }
    >
      <article
        ref={cardRef}
        data-active={active ? 'true' : undefined}
        onPointerMove={handlePointerMove}
        className={cn(
          'group relative flex h-full min-w-0 flex-col border-t border-border-subtle py-10 first:border-t-0',
          'md:border-t-0 md:px-6 md:py-3 md:border-l md:max-lg:[&:nth-child(odd)]:border-l-0',
          'lg:px-7 lg:border-l lg:first:border-l-0 lg:first:pl-0 lg:last:pr-0',
          'xl:px-8',
          'transition-[opacity,border-color] duration-500 ease-out',
          'hover-capable:group-hover/services:opacity-[0.72]',
          'hover-capable:group-hover/services:hover:opacity-100',
          'hover-capable:hover:border-border-interactive',
          active && 'border-border-interactive md:border-l-brand-yellow/45 lg:border-l-brand-yellow/45',
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500',
            'hover-capable:group-hover:opacity-100 motion-reduce:hidden',
          )}
          style={{
            background:
              'radial-gradient(13rem circle at var(--mx, 50%) var(--my, 40%), rgb(0 0 0 / 0.035), transparent 72%)',
          }}
        />

        <button
          type="button"
          aria-expanded={active}
          aria-controls={`${headingId}-details`}
          onClick={onToggle}
          className="relative flex w-full flex-col items-start text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-yellow"
        >
          <span className="text-[0.62rem] uppercase tracking-[0.28em] text-muted-foreground transition-colors duration-300 group-hover:text-foreground group-focus-within:text-foreground">
            {label}
          </span>

          <span className="service-depth mt-7">
            <ServiceIcon name={service.icon} active={active} drawn={revealed} index={index} />
          </span>

          <h3
            id={headingId}
            className={cn(
              'service-title mt-8 text-subheading font-normal tracking-[-0.03em] text-foreground/85',
              'transition-[transform,color] duration-500 ease-out delay-0',
              'hover-capable:group-hover:-translate-y-1 hover-capable:group-hover:delay-[50ms] hover-capable:group-hover:text-foreground',
              'motion-reduce:transform-none',
              active && 'text-foreground',
            )}
          >
            {service.title}
          </h3>

          <span
            aria-hidden="true"
            className={cn(
              'mt-4 block h-px w-12 origin-left scale-x-0 bg-foreground/70',
              'transition-transform duration-500 delay-75 ease-[cubic-bezier(0.22,1,0.36,1)]',
              'motion-reduce:transition-none',
              'hover-capable:group-hover:scale-x-100 group-focus-within:scale-x-100',
              active && 'scale-x-100',
            )}
          />

          <p
            className={cn(
              'mt-5 max-w-[22rem] text-body leading-[1.75] text-secondary-foreground',
              'transition-[color,opacity] duration-500 delay-0',
              'hover-capable:group-hover:delay-[90ms] hover-capable:group-hover:text-foreground/85',
            )}
          >
            {service.description}
          </p>

          <span
            className={cn(
              'mt-7 inline-flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.2em] text-muted-foreground',
              'transition-[color,letter-spacing,transform] duration-500 delay-0',
              'hover-capable:group-hover:delay-[120ms] hover-capable:group-hover:tracking-[0.26em] hover-capable:group-hover:text-foreground',
              active && 'text-foreground',
            )}
          >
            {active ? 'Show less' : 'View offerings'}
            <ChevronRightIcon
              className={cn(
                'h-3 w-3 transition-transform duration-500 ease-out',
                'hover-capable:group-hover:translate-x-1.5',
                active && 'rotate-90',
              )}
            />
          </span>
        </button>

        <ServiceDetails details={service.details} active={active} labelledBy={headingId} />
      </article>
    </li>
  );
}

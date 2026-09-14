import { VerifiedIcon } from '@/lib/icons';
import { cn } from '@/lib/cn';

/**
 * @param {{
 *   testimonial: import('@/types').Testimonial;
 *   className?: string;
 *   active?: boolean;
 *   reduced?: boolean;
 *   index?: number;
 * }} props
 */
export function TestimonialCard({
  testimonial,
  className,
  active = true,
  reduced = false,
  index = 0,
}) {
  const initials = testimonial.author
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const roleLine = [testimonial.role, testimonial.company].filter(Boolean).join(', ');
  const play = active && !reduced;
  const columnDelay = 340 + index * 90;

  return (
    <figure
      className={cn(
        'flex h-full flex-col transition-[transform,opacity,filter] duration-500 ease-out',
        'hover-capable:group-hover/quotes:opacity-[0.78]',
        'hover-capable:group-hover/quotes:hover:opacity-100',
        'hover-capable:hover:-translate-y-1 hover-capable:hover:brightness-[1.06]',
        'group/card',
        className,
      )}
    >
      <div
        className={cn(
          'flex h-full flex-col',
          play && 'animate-band-column',
          !play && !reduced && 'opacity-0',
        )}
        style={play ? { animationDelay: `${columnDelay}ms` } : undefined}
      >
      <blockquote className="text-body leading-[1.75] text-current/75">
        <span className="block overflow-hidden">
          <span
            className={cn('block', play && 'animate-band-quote', !play && !reduced && 'translate-y-full opacity-0')}
            style={play ? { animationDelay: `${columnDelay + 40}ms` } : undefined}
          >
            {testimonial.quote}
            <VerifiedIcon
              className={cn(
                'ml-1 inline-block h-3.5 w-3.5 origin-center translate-y-px text-info',
                'transition-[filter] duration-500 hover-capable:group-hover/card:brightness-125',
                play && 'animate-band-verified',
                !play && !reduced && 'scale-0 opacity-0',
              )}
              style={play ? { animationDelay: `${columnDelay + 480}ms` } : undefined}
              aria-hidden="true"
            />
          </span>
        </span>
      </blockquote>

      <figcaption className="mt-6 flex items-center gap-3">
        {testimonial.avatar ? (
          <img
            src={testimonial.avatar}
            alt=""
            loading="lazy"
            width={36}
            height={36}
            className={cn(
              'h-9 w-9 shrink-0 rounded-full object-cover',
              play && 'animate-band-avatar',
              !play && !reduced && 'scale-[0.85] opacity-0',
            )}
            style={play ? { animationDelay: `${columnDelay + 540}ms` } : undefined}
          />
        ) : (
          <span
            aria-hidden="true"
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-current/15 bg-current/5 text-[0.58rem] font-medium tracking-[0.1em] text-current/70',
              play && 'animate-band-avatar',
              !play && !reduced && 'scale-[0.85] opacity-0',
            )}
            style={play ? { animationDelay: `${columnDelay + 540}ms` } : undefined}
          >
            {initials}
          </span>
        )}
        <span className="flex min-w-0 flex-col gap-0.5">
          <span
            className={cn(
              'text-[0.8125rem] font-medium text-current',
              play && 'animate-band-meta',
              !play && !reduced && 'opacity-0',
            )}
            style={play ? { animationDelay: `${columnDelay + 620}ms` } : undefined}
          >
            {testimonial.author}
          </span>
          {roleLine ? (
            <span
              className={cn(
                'text-[0.6875rem] leading-snug text-current/70',
                play && 'animate-band-meta',
                !play && !reduced && 'opacity-0',
              )}
              style={play ? { animationDelay: `${columnDelay + 700}ms` } : undefined}
            >
              {roleLine}
            </span>
          ) : null}
        </span>
      </figcaption>
      </div>
    </figure>
  );
}

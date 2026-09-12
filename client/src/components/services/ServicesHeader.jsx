import { servicesContent as fallbackServicesContent } from '@/data/services';
import { cn } from '@/lib/cn';

/**
 * Editorial heading: two-line cinematic reveal, supporting copy on the right.
 *
 * @param {{ className?: string; active?: boolean; reduced?: boolean; content?: { title?: string; subtitle?: string } }} props
 */
export function ServicesHeader({ className, active = true, reduced = false, content }) {
  const servicesContent = content || fallbackServicesContent;
  const lines = servicesContent.title.split('\n');
  const play = active && !reduced;

  return (
    <div
      className={cn(
        'grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-10',
        className,
      )}
    >
      <h2 className="min-w-0 lg:col-span-7">
        {lines.map((line, index) => (
          <span key={line} className="block overflow-hidden">
            <span
              className={cn(
                'block max-w-[14ch] text-section font-light leading-[1.04] tracking-[-0.035em] text-foreground',
                play && 'animate-band-heading',
                !play && !reduced && 'translate-y-[0.8em] opacity-0',
              )}
              style={play ? { animationDelay: `${index * 110}ms` } : undefined}
            >
              {line}
            </span>
          </span>
        ))}
      </h2>

      <p
        className={cn(
          'max-w-[26rem] text-body leading-[1.8] text-secondary-foreground lg:col-span-4 lg:col-start-9',
          play && 'animate-band-meta',
          !play && !reduced && 'opacity-0',
        )}
        style={play ? { animationDelay: '220ms' } : undefined}
      >
        {servicesContent.subtitle}
      </p>
    </div>
  );
}

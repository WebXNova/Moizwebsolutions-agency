import { useInViewOnce } from '@/hooks/useInView';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/cn';

const FALLBACK_LINES = ['READY TO BUILD', 'SOMETHING', 'EXCEPTIONAL?'];

/**
 * @param {string | undefined} headline
 */
export function splitCtaHeadline(headline) {
  if (!headline || typeof headline !== 'string') return FALLBACK_LINES;
  const lines = headline
    .split('/')
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.length > 0 ? lines : FALLBACK_LINES;
}

/**
 * Editorial serif headline with a clipped, staggered vertical reveal.
 *
 * @param {{ id?: string; lines?: string[] }} [props]
 */
export function CinematicHeadline({ id, lines = FALLBACK_LINES }) {
  const [ref, inView] = useInViewOnce({ threshold: 0.28, rootMargin: '0px 0px -10% 0px' });
  const reduced = usePrefersReducedMotion();
  const reveal = reduced || inView;
  const displayLines = lines.length > 0 ? lines : FALLBACK_LINES;

  return (
    <h2
      id={id}
      ref={ref}
      className="max-w-full break-words font-serif text-[clamp(2.1rem,8vw,4.85rem)] font-medium leading-[1.1] tracking-[-0.012em] text-closing-ivory sm:text-[clamp(2.35rem,5.4vw,4.85rem)]"
    >
      {displayLines.map((line, index) => (
        <span key={`${line}-${index}`} className="block overflow-hidden py-[0.02em]">
          <span
            className={cn(
              'block',
              reveal && !reduced && 'animate-editorial-reveal',
              !reveal && !reduced && 'opacity-0',
            )}
            style={reveal && !reduced ? { animationDelay: `${index * 110}ms` } : undefined}
          >
            <span
              className={cn('block', reveal && !reduced && 'animate-mask-open')}
              style={reveal && !reduced ? { animationDelay: `${index * 110}ms` } : undefined}
            >
              {line}
            </span>
          </span>
        </span>
      ))}
    </h2>
  );
}

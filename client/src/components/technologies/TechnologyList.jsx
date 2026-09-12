import { TechnologyItem } from '@/components/technologies/TechnologyItem';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/cn';

/**
 * One copy of the technology sequence. The marquee renders this twice;
 * the duplicate is inert so assistive tech only hears the list once.
 *
 * @param {{
 *   technologies: import('@/types').Technology[];
 *   duplicate?: boolean;
 * }} props
 */
function TechnologySet({ technologies, duplicate = false }) {
  return (
    <ul
      aria-hidden={duplicate || undefined}
      inert={duplicate || undefined}
      className="flex shrink-0 items-stretch gap-x-10 pr-10 sm:gap-x-12 sm:pr-12 lg:gap-x-16 lg:pr-16"
    >
      {technologies.map((technology, index) => (
        <TechnologyItem
          key={duplicate ? `${technology.id}-loop` : technology.id}
          technology={technology}
          interactive={!duplicate}
          shineDelay={(index % 5) * 0.85}
        />
      ))}
    </ul>
  );
}

/**
 * Infinite horizontal ticker: two identical sets on one track, translated
 * by exactly 50% so the loop has no gap or snap. Reduced motion falls back
 * to a static wrapping grid.
 *
 * Direction is RTL by default (`--marquee-to: -50%`). Reverse later with
 * `--marquee-from: -50%` and `--marquee-to: 0`.
 *
 * @param {{
 *   technologies?: import('@/types').Technology[];
 *   revealed?: boolean;
 * }} props
 */
export function TechnologyList({ technologies = [], revealed = true }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <ul className="grid grid-cols-2 justify-items-center gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-5">
        {technologies.map((technology, index) => (
          <TechnologyItem
            key={technology.id}
            technology={technology}
            shineDelay={(index % 5) * 0.85}
          />
        ))}
      </ul>
    );
  }

  return (
    <div
      className={cn(
        'group/marquee tech-marquee-fade w-full max-w-full overflow-hidden py-5 sm:py-6',
        revealed ? 'motion-safe:animate-reveal-up' : 'motion-safe:opacity-0',
      )}
    >
      <div
        className={cn(
          'flex w-max',
          '[--marquee-from:0] [--marquee-to:-50%]',
          '[--marquee-duration:28s] sm:[--marquee-duration:24s] lg:[--marquee-duration:20s]',
          revealed && 'motion-safe:animate-tech-marquee motion-reduce:animate-none',
          'hover-capable:group-hover/marquee:[animation-play-state:paused]',
          'group-focus-within/marquee:[animation-play-state:paused]',
        )}
        style={{ animationDelay: revealed ? '600ms' : undefined }}
      >
        <TechnologySet technologies={technologies} />
        <TechnologySet technologies={technologies} duplicate />
      </div>
    </div>
  );
}

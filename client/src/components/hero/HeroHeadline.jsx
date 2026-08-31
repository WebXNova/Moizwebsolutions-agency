import { HeroBloomMark } from '@/components/hero/HeroBloomMark';
import { HeroBoltMark } from '@/components/hero/HeroBoltMark';
import { HeroMark } from '@/components/hero/HeroMark';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/cn';

/**
 * @param {string} word
 */
function isGreat(word) {
  return word.replace(/[^a-zA-Z']/g, '').toLowerCase() === 'great';
}

/**
 * @typedef {{
 *   key: string;
 *   indent?: boolean;
 *   withBolt?: boolean;
 *   withBloom?: boolean;
 *   prefix?: string;
 *   mark?: string;
 *   text?: string;
 * }} HeroRow
 */

/**
 * Build editorial rows from CMS/title lines, promoting “great” as the mark.
 *
 * @param {string[]} titleLines
 * @returns {{ rows: HeroRow[]; label: string }}
 */
function composeRows(titleLines) {
  const label = titleLines.join(' ').replace(/\s+/g, ' ').trim();
  const words = label.split(/\s+/).filter(Boolean);
  const greatIndex = words.findIndex(isGreat);

  if (greatIndex === -1) {
    return {
      label,
      rows: titleLines.map((line, index) => ({
        key: `line-${index}`,
        text: line,
        withBolt: index === 0,
        withBloom: index === titleLines.length - 1 && titleLines.length > 1,
      })),
    };
  }

  const before = words.slice(0, greatIndex);
  const greatWord = words[greatIndex];
  const after = words.slice(greatIndex + 1);

  let lead = before;
  let midLead = /** @type {string[]} */ ([]);

  if (before.length >= 2) {
    lead = before.slice(0, 2);
    midLead = before.slice(2);
  }

  /** @type {HeroRow[]} */
  const rows = [];

  if (lead.length) {
    rows.push({
      key: 'lead',
      text: lead.join(' '),
    });
  }

  rows.push({
    key: 'mark-row',
    indent: true,
    prefix: midLead.length ? midLead.join(' ') : undefined,
    withBolt: true,
    mark: greatWord,
  });

  if (after.length) {
    rows.push({
      key: 'close',
      withBloom: true,
      text: after.join(' '),
    });
  }

  return { label, rows };
}

/**
 * Premium editorial hero headline — typography as composition.
 *
 * @param {{ titleLines: string[]; className?: string }} props
 */
export function HeroHeadline({ titleLines, className }) {
  const reduced = usePrefersReducedMotion();
  const { label, rows } = composeRows(titleLines);

  return (
    <h1
      aria-label={label}
      className={cn(
        'hero-headline font-display font-medium text-foreground',
        'max-w-[11.5ch] text-[clamp(2.6rem,7.2vw,5.85rem)] leading-[0.92] tracking-[-0.042em]',
        'sm:max-w-[12.5ch] md:max-w-[13.5ch]',
        className,
      )}
    >
      {rows.map((row, index) => {
        const isLast = index === rows.length - 1;
        const delay = index * 110;

        return (
          <span
            key={row.key}
            className={cn(
              'block overflow-hidden py-[0.03em]',
              row.indent && 'pl-[0.35em] sm:pl-[0.55em] md:pl-[0.7em]',
            )}
          >
            <span
              className={cn(
                'inline-flex flex-wrap items-baseline gap-x-[0.28em]',
                !reduced && 'motion-safe:animate-hero-line',
                isLast && !reduced && 'fx-shimmer-text motion-safe:animate-text-shimmer',
              )}
              style={!reduced ? { animationDelay: `${delay}ms` } : undefined}
            >
              {row.prefix ? <span className="whitespace-pre-wrap">{row.prefix}</span> : null}

              {row.withBolt ? (
                <span
                  className={cn(
                    'inline-flex translate-y-[-0.04em] items-center',
                    !reduced && 'motion-safe:animate-hero-spark',
                  )}
                  style={!reduced ? { animationDelay: `${delay + 200}ms` } : undefined}
                >
                  <HeroBoltMark className="h-[0.48em] w-[0.48em]" />
                </span>
              ) : null}

              {row.mark ? (
                <HeroMark delayMs={delay + 160} reduced={reduced}>
                  {row.mark}
                </HeroMark>
              ) : null}

              {row.withBloom ? (
                <span
                  className={cn(
                    'inline-flex translate-y-[-0.02em] items-center',
                    !reduced && 'motion-safe:animate-hero-spark',
                  )}
                  style={!reduced ? { animationDelay: `${delay + 200}ms` } : undefined}
                >
                  <HeroBloomMark className="h-[0.44em] w-[0.44em]" />
                </span>
              ) : null}

              {row.text ? <span className="whitespace-pre-wrap">{row.text}</span> : null}
            </span>
          </span>
        );
      })}
    </h1>
  );
}

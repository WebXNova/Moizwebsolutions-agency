import { processIconMap } from '@/lib/icons';
import { processSteps as fallbackSteps, processContent as fallbackProcessContent } from '@/data/process';
import { useSiteContent } from '@/hooks/useSiteContent';
import { resolveProcessContent, resolveProcessSteps } from '@/lib/contentAdapters';
import { useInViewOnce } from '@/hooks/useInView';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/cn';

/**
 * Four-column process row with a left-to-right line reveal.
 */
export function ProcessRow() {
  const [ref, inView] = useInViewOnce({ threshold: 0.22, rootMargin: '0px 0px -8% 0px' });
  const reduced = usePrefersReducedMotion();
  const reveal = reduced || inView;
  const { content } = useSiteContent();
  const processSteps = resolveProcessSteps(content?.processSteps) || fallbackSteps;
  const processContent = resolveProcessContent(content?.sectionLabels) || fallbackProcessContent;

  return (
    <div ref={ref}>
      <h3 className="text-[11px] font-medium uppercase tracking-[0.18em] text-white">
        {processContent.title}
      </h3>

      <div
        className={cn(
          'mt-5 h-px origin-left bg-closing-divider',
          reveal && !reduced && 'animate-line-reveal',
          !reveal && !reduced && 'scale-x-0',
        )}
      />

      <ol className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
        {processSteps.map((step, index) => {
          const Icon = processIconMap[step.icon] || processIconMap.discovery;

          return (
            <li
              key={step.id}
              className={cn(
                'relative flex flex-col items-start gap-4 pr-6 lg:px-6 lg:first:pl-0 lg:last:pr-0',
                'lg:border-r lg:border-closing-divider lg:last:border-r-0',
                reveal && !reduced && 'animate-process-item',
                !reveal && !reduced && 'opacity-0',
              )}
              style={reveal && !reduced ? { animationDelay: `${180 + index * 140}ms` } : undefined}
            >
              <Icon className="h-10 w-10 text-closing-ivory" />
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-closing-ivory">
                {step.number}. {step.title}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

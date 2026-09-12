import { inquirySteps } from '@/data/projectInquiry';
import { cn } from '@/lib/cn';

/**
 * Editorial step indicator — numbered labels joined by hairlines.
 *
 * @param {{ activeIndex: number; onStepSelect?: (index: number) => void; maxReached?: number }} props
 */
export function InquiryProgress({ activeIndex, onStepSelect, maxReached = 0 }) {
  return (
    <ol className="flex items-center gap-2 overflow-x-auto sm:gap-3" aria-label="Project brief progress">
      {inquirySteps.map((step, index) => {
        const isActive = index === activeIndex;
        const isReachable = index <= maxReached;

        return (
          <li key={step.id} className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              disabled={!isReachable || isActive}
              aria-current={isActive ? 'step' : undefined}
              onClick={() => onStepSelect?.(index)}
              className={cn(
                'flex items-center gap-2 rounded-full px-1 py-1 text-[0.625rem] font-medium uppercase tracking-[0.14em]',
                'transition-colors duration-300',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow',
                isActive && 'font-semibold text-ink',
                !isActive && 'text-gray-600 hover:text-gray-800 dark:text-neutral-300 dark:hover:text-neutral-100',
                isReachable && !isActive ? 'cursor-pointer' : 'cursor-default',
              )}
            >
              <span
                className={cn(
                  'tabular-nums transition-colors duration-300',
                  isActive ? 'text-brand-yellow-deep dark:text-brand-yellow' : 'text-current',
                )}
              >
                {step.index}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
            </button>

            {index < inquirySteps.length - 1 ? (
              <span
                aria-hidden="true"
                className={cn(
                  'h-px w-5 transition-colors duration-300 sm:w-8',
                  index < activeIndex ? 'bg-brand-yellow/60' : 'bg-hairline',
                )}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

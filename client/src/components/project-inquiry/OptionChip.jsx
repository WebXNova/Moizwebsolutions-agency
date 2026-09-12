import { cn } from '@/lib/cn';

/**
 * Selectable pill used for project types, budget bands and timelines.
 *
 * @param {{
 *   selected?: boolean;
 *   onClick?: () => void;
 *   children: import('react').ReactNode;
 *   className?: string;
 * }} props
 */
export function OptionChip({ selected = false, onClick, children, className }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        'rounded-full border px-3.5 py-2 text-[0.75rem] leading-none tracking-[0.01em]',
        'transition-[border-color,background-color,color,box-shadow,transform] duration-200 ease-out',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow',
        selected
          ? 'border-brand-yellow bg-brand-yellow/12 font-medium text-ink shadow-[0_0_0_1px_var(--color-brand-yellow)]'
          : 'border-hairline bg-panel-soft text-gray-800 hover:border-hairline-strong hover:text-gray-900 dark:text-neutral-100 dark:hover:text-white',
        'motion-safe:active:scale-[0.97]',
        className,
      )}
    >
      {children}
    </button>
  );
}

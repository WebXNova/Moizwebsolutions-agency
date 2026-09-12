import {
  BrandIcon,
  CheckIcon,
  DesignIcon,
  DevelopmentIcon,
  SparkIcon,
  ThemeIcon,
  VideoIcon,
} from '@/lib/icons';
import { cn } from '@/lib/cn';

const serviceIconMap = {
  development: DevelopmentIcon,
  video: VideoIcon,
  design: DesignIcon,
  brand: BrandIcon,
  theme: ThemeIcon,
  other: SparkIcon,
};

/**
 * @param {{
 *   service: { id: string; title: string; description: string; icon: string };
 *   selected: boolean;
 *   onToggle: () => void;
 *   index?: number;
 * }} props
 */
export function ServiceCard({ service, selected, onToggle, index = 0 }) {
  const Icon = serviceIconMap[service.icon] ?? SparkIcon;

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      style={{ animationDelay: `${index * 60}ms` }}
      className={cn(
        'group relative flex h-full w-full flex-col items-start gap-4 overflow-hidden',
        'rounded-lg border p-5 text-left',
        'transition-[border-color,background-color,box-shadow,transform] duration-300 ease-out',
        'motion-safe:animate-fade-up motion-reduce:animate-none',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow',
        'motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0',
        selected
          ? 'border-brand-yellow bg-brand-yellow/[0.06] shadow-[0_0_0_1px_var(--color-brand-yellow),0_12px_28px_-16px_rgb(255_194_14_/_0.5)]'
          : 'border-hairline bg-panel-soft hover:border-brand-yellow/45 hover:shadow-md',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-yellow/[0.05] to-transparent',
          'opacity-0 transition-opacity duration-300',
          selected ? 'opacity-100' : 'group-hover:opacity-100',
        )}
      />

      <span className="relative flex w-full items-start justify-between gap-3">
        <span
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-md border',
            'transition-[border-color,background-color,color,transform] duration-300 ease-out',
            'motion-safe:group-hover:-translate-y-0.5',
            selected
              ? 'border-brand-yellow/45 bg-brand-yellow/12 text-brand-yellow-deep dark:text-brand-yellow'
              : 'border-hairline bg-panel text-ink-soft group-hover:border-brand-yellow/40',
          )}
        >
          <Icon className="h-[1.15rem] w-[1.15rem]" />
        </span>

        <span
          aria-hidden="true"
          className={cn(
            'flex h-5 w-5 items-center justify-center rounded-full border transition-all duration-200',
            selected
              ? 'border-brand-yellow bg-brand-yellow text-brand-ink motion-safe:animate-check-pop'
              : 'border-hairline-strong bg-transparent text-transparent',
          )}
        >
          <CheckIcon className="h-3 w-3" />
        </span>
      </span>

      <span className="relative">
        <span className="block text-[0.9375rem] font-medium tracking-[-0.01em] text-ink">
          {service.title}
        </span>
        <span className="mt-2 block text-[0.75rem] leading-[1.65] text-gray-700 dark:text-neutral-300">
          {service.description}
        </span>
      </span>
    </button>
  );
}

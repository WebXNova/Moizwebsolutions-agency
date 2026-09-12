import { ChevronRightIcon } from '@/lib/icons';

/**
 * @param {{ label?: string; href?: string }} props
 */
export function WorkCTA({ label = 'Start a project', href = '#contact' }) {
  return (
    <a
      href={href}
      className="group inline-flex items-center gap-3 border-b border-border-interactive pb-2 text-[11px] uppercase tracking-[0.2em] text-foreground transition-colors duration-300 hover:border-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
    >
      {label}
      <ChevronRightIcon className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
    </a>
  );
}

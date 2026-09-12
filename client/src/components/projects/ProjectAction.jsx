import { ArrowUpRightIcon } from '@/lib/icons';

/**
 * Non-interactive affordance: the whole card is the link, so this is the
 * visual mark that responds to hover.
 */
export function ProjectAction() {
  return (
    <span
      aria-hidden="true"
      className="mt-1 hidden shrink-0 text-muted-foreground transition-colors duration-300 group-hover:text-foreground md:block"
    >
      <ArrowUpRightIcon className="h-5 w-5 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
    </span>
  );
}

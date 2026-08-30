import { cn } from '@/lib/cn';

/**
 * @param {import('react').ButtonHTMLAttributes<HTMLButtonElement> & {
 *   label: string;
 *   children?: import('react').ReactNode;
 * }} props
 */
export function IconButton({ label, children, className, ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors duration-300',
        'text-muted-foreground hover:text-foreground',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

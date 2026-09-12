import { cn } from '@/lib/cn';

const variants = {
  outline:
    'border border-accent/65 px-8 py-5 text-foreground hover:border-accent hover:bg-accent/8',
  primary:
    'border border-accent bg-accent px-8 py-5 text-accent-foreground hover:opacity-85',
  ghost: 'py-2 text-foreground hover:text-secondary-foreground',
};

/**
 * @param {import('react').ButtonHTMLAttributes<HTMLButtonElement> & {
 *   children?: import('react').ReactNode;
 *   variant?: keyof typeof variants;
 *   href?: string;
 * }} props
 */
export function Button({ children, className, variant = 'outline', href, ...props }) {
  const Tag = href ? 'a' : 'button';
  const tagProps = href ? { href } : { type: 'button' };

  return (
    <Tag
      {...tagProps}
      className={cn(
        'group inline-flex items-center justify-center gap-3 text-cta font-medium uppercase leading-none tracking-[0.18em] transition-[color,background-color,border-color,opacity] duration-300',
        'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

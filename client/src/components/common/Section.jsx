import { cn } from '@/lib/cn';

/**
 * @param {import('react').HTMLAttributes<HTMLElement> & {
 *   as?: keyof JSX.IntrinsicElements;
 *   id?: string;
 *   children?: import('react').ReactNode;
 *   variant?: 'default' | 'dark' | 'band';
 *   spacing?: 'default' | 'band' | 'none';
 * }} props
 */
export function Section({
  as: Tag = 'section',
  children,
  className,
  variant = 'default',
  spacing = 'default',
  ...props
}) {
  return (
    <Tag
      className={cn(
        spacing === 'default' && 'py-20 md:py-24 lg:py-28',
        spacing === 'band' && 'py-12 md:py-14',
        variant === 'dark' && 'bg-surface text-foreground',
        variant === 'band' && 'bg-foreground text-background dark:bg-surface dark:text-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

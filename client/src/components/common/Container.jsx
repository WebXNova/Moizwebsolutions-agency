import { cn } from '@/lib/cn';

/**
 * @param {import('react').HTMLAttributes<HTMLDivElement> & {
 *   as?: keyof JSX.IntrinsicElements;
 *   children?: import('react').ReactNode;
 *   narrow?: boolean;
 * }} props
 */
export function Container({ as: Tag = 'div', children, className, narrow = false, ...props }) {
  return (
    <Tag
      className={cn(
        'mx-auto w-full px-5 sm:px-7 md:px-10 lg:px-12',
        narrow ? 'max-w-[52rem]' : 'max-w-site',
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

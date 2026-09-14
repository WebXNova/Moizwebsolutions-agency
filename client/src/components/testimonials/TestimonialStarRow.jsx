import { cn } from '@/lib/cn';

/**
 * @param {import('react').SVGProps<SVGSVGElement>} props
 */
function StarIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292Z" />
    </svg>
  );
}

/**
 * @param {{ className?: string; size?: 'sm' | 'md' }} props
 */
export function TestimonialStarRow({ className, size = 'sm' }) {
  const iconClass = size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5';

  return (
    <div
      className={cn('flex items-center gap-0.5 text-brand-yellow', className)}
      aria-label="5 out of 5 stars"
    >
      {Array.from({ length: 5 }, (_, index) => (
        <StarIcon key={index} className={iconClass} />
      ))}
    </div>
  );
}

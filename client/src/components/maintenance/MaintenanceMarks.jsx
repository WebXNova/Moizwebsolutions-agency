import { cn } from '@/lib/cn';

/**
 * @param {{ className?: string; mirrored?: boolean }} props
 */
export function LaurelIcon({ className, mirrored = false }) {
  return (
    <svg
      viewBox="0 0 28 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.15"
      aria-hidden="true"
      className={cn(mirrored && '-scale-x-100', className)}
    >
      <path d="M24.5 15.5c-1.4-5.2-5.6-8.8-10.8-10.4 3.6 2.4 6.2 6.4 7.1 10.4" strokeLinecap="round" />
      <path d="M19.2 15.5c-1-3.6-3.8-6.2-7.4-7.4 2.6 1.8 4.4 4.4 5.1 7.4" strokeLinecap="round" />
      <path d="M14.4 15.5c-.6-2.2-2.2-3.8-4.4-4.6 1.6 1.2 2.7 2.8 3.1 4.6" strokeLinecap="round" />
      <path d="M22.2 8.2c.2 1.1-.4 1.8-1.3 1.6" strokeLinecap="round" />
      <path d="M17.4 9.4c.15.9-.35 1.5-1.1 1.35" strokeLinecap="round" />
    </svg>
  );
}

/**
 * @param {import('react').SVGProps<SVGSVGElement>} props
 */
export function NextJsMark(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="10.25" fill="#111111" />
      <path d="M9.05 7.35h1.92L16.7 16.6h-2.02L9.05 7.35Z" fill="#fff" />
      <path d="M15.55 7.35h1.78v9.25h-1.78V7.35Z" fill="#fff" />
    </svg>
  );
}

/**
 * @param {import('react').SVGProps<SVGSVGElement>} props
 */
export function VercelMark(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M12 4.5 21 19.5H3L12 4.5Z" fill="currentColor" />
    </svg>
  );
}

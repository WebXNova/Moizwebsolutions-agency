import { navigationLinks as fallbackNavigation } from '@/data/navigation';
import { useSiteContent } from '@/hooks/useSiteContent';
import { resolveNavigation } from '@/lib/contentAdapters';
import { cn } from '@/lib/cn';

const sizes = {
  sm: 'text-[15px] tracking-[-0.005em]',
  lg: 'text-[clamp(1.5rem,6.4vw,1.75rem)] tracking-[-0.03em]',
};

/**
 * @param {{
 *   className?: string;
 *   orientation?: 'horizontal' | 'vertical';
 *   size?: keyof typeof sizes;
 *   emphasis?: 'primary' | 'secondary';
 *   onNavigate?: () => void;
 * }} props
 */
export function Navigation({
  className,
  orientation = 'horizontal',
  size = 'sm',
  emphasis = 'primary',
  onNavigate,
}) {
  const { content } = useSiteContent();
  const navigationLinks = resolveNavigation(content?.navigation) || fallbackNavigation;

  return (
    <nav aria-label="Primary" className={className}>
      <ul
        className={cn(
          orientation === 'horizontal'
            ? 'flex items-center gap-7 xl:gap-9'
            : 'flex flex-col items-start gap-7',
        )}
      >
        {navigationLinks.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              onClick={onNavigate}
              className={cn(
                'fx-nav-link font-normal transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring',
                sizes[size],
                emphasis === 'secondary'
                  ? 'text-secondary-foreground hover:text-foreground'
                  : 'text-foreground hover:text-secondary-foreground',
              )}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

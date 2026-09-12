import { socialLinks as fallbackSocial } from '@/config/social';
import { useSiteContent } from '@/hooks/useSiteContent';
import { resolveSocialLinks } from '@/lib/contentAdapters';
import { socialIconMap } from '@/lib/icons';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/cn';

/** Brand hover fill per platform — white glyph on an 80% brand colour. */
const SOCIAL_HOVER = {
  facebook:
    'hover-capable:hover:bg-[#1877F2]/80 hover-capable:hover:text-white hover-capable:hover:shadow-[0_0_0_1px_rgb(24_119_242_/_0.28)]',
  linkedin:
    'hover-capable:hover:bg-[#0A66C2]/80 hover-capable:hover:text-white hover-capable:hover:shadow-[0_0_0_1px_rgb(10_102_194_/_0.28)]',
  instagram:
    'social-instagram-hover hover-capable:hover:text-white hover-capable:hover:shadow-[0_0_0_1px_rgb(225_48_108_/_0.28)]',
};

/**
 * @param {{
 *   href: string;
 *   label: string;
 *   platform: string;
 *   variant?: 'default' | 'onDark';
 *   Icon?: import('react').ComponentType<import('react').SVGProps<SVGSVGElement>>;
 * }} props
 */
function SocialIconLink({ href, label, platform, variant = 'default', Icon }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={label}
      className={cn(
        'group/social flex h-9 w-9 items-center justify-center rounded-full',
        'transition-[transform,background-color,background-image,color,box-shadow,opacity] duration-300 ease-out',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        'hover-capable:hover:-translate-y-0.5 hover-capable:hover:scale-[1.06]',
        variant === 'onDark' ? 'bg-white text-closing-panel' : 'bg-foreground/[0.06] text-muted-foreground',
        SOCIAL_HOVER[platform] ??
          'hover-capable:hover:bg-foreground/80 hover-capable:hover:text-background',
      )}
    >
      {Icon ? (
        <Icon
          className={cn(
            'h-4 w-4 transition-[transform,color] duration-300 ease-out',
            'group-hover/social:translate-y-[-1px]',
            platform === 'instagram' && 'group-hover/social:rotate-[-4deg]',
            platform === 'facebook' && 'group-hover/social:scale-105',
            platform === 'linkedin' && 'group-hover/social:translate-x-px',
          )}
        />
      ) : null}
    </a>
  );
}

/**
 * @param {{ className?: string; variant?: 'default' | 'onDark'; animate?: boolean }} props
 */
export function SocialLinks({ className, variant = 'default', animate = true }) {
  const { content } = useSiteContent();
  const socialLinks = resolveSocialLinks(content?.socialLinks) || fallbackSocial;
  const reduced = usePrefersReducedMotion();

  return (
    <ul aria-label="Social links" className={cn('flex items-center gap-2', className)}>
      {socialLinks.map((link, index) => {
        const Icon = socialIconMap[link.platform];

        return (
          <li
            key={link.href}
            className={cn(animate && !reduced && 'fx-social-enter')}
            style={animate && !reduced ? { animationDelay: `${180 + index * 70}ms` } : undefined}
          >
            <SocialIconLink
              href={link.href}
              label={link.label ?? link.platform}
              platform={link.platform}
              variant={variant}
              Icon={Icon}
            />
          </li>
        );
      })}
    </ul>
  );
}

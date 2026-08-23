import { socialLinks } from '@/config/social';

export function SocialLinks() {
  return (
    <ul aria-label="Social links">
      {socialLinks.map((link) => (
        <li key={link.href}>
          <a href={link.href} target="_blank" rel="noreferrer">
            {link.label ?? link.platform}
          </a>
        </li>
      ))}
    </ul>
  );
}

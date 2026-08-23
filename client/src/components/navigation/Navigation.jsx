import { navigationLinks } from '@/data/navigation';

export function Navigation() {
  return (
    <nav aria-label="Primary">
      <ul>
        {navigationLinks.map((link) => (
          <li key={link.href}>
            <a href={link.href}>{link.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

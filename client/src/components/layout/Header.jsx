import { useState } from 'react';
import { Container } from '@/components/common/Container';
import { IconButton } from '@/components/common/IconButton';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { Logo } from '@/components/navigation/Logo';
import { LogoIntro } from '@/components/navigation/LogoIntro';
import { SocialLinks } from '@/components/navigation/SocialLinks';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { MenuIcon } from '@/lib/icons';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="relative z-50 border-b border-border-subtle bg-background/80 backdrop-blur-md">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-brand-yellow/85 to-transparent"
      />
      <Container>
        <div className="flex items-center justify-between gap-4 py-4 sm:gap-5 sm:py-5 md:py-6">
          <LogoIntro className="min-w-0 max-w-[58%] min-[375px]:max-w-[62%] sm:max-w-none">
            <Logo />
          </LogoIntro>

          <div className="hidden shrink-0 items-center gap-5 lg:flex xl:gap-6">
            <SocialLinks animate />
            <ThemeToggle />
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 lg:hidden">
            <ThemeToggle />
            <IconButton
              className="-mr-2"
              label="Open menu"
              aria-controls="mobile-navigation"
              aria-expanded={menuOpen}
              aria-haspopup="dialog"
              onClick={() => setMenuOpen(true)}
            >
              <MenuIcon className="h-5 w-5" />
            </IconButton>
          </div>
        </div>
      </Container>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}

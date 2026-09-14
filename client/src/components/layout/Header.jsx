import { useEffect, useRef, useState } from 'react';
import { Container } from '@/components/common/Container';
import { IconButton } from '@/components/common/IconButton';
import { Logo } from '@/components/navigation/Logo';
import { LogoIntro } from '@/components/navigation/LogoIntro';
import { FriesMenuIcon } from '@/components/navigation/FriesMenuIcon';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { HeroCTA } from '@/components/hero/HeroCTA';
import { useInquiry } from '@/context/InquiryProvider';
import { cn } from '@/lib/cn';

export function Header() {
  const headerRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { open: openInquiry } = useInquiry();

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  useEffect(() => {
    const node = headerRef.current;
    if (!node) return undefined;

    const syncOffset = () => {
      document.documentElement.style.setProperty('--header-offset', `${node.offsetHeight}px`);
    };

    syncOffset();
    const observer = new ResizeObserver(syncOffset);
    observer.observe(node);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty('--header-offset');
    };
  }, []);

  return (
    <header
      ref={headerRef}
      className={cn(
        'sticky top-0 z-50 border-b border-border-subtle backdrop-blur-md',
        scrolled
          ? 'bg-background/92 shadow-[0_8px_24px_-18px_rgb(20_26_34_/_0.35)]'
          : 'bg-background/80',
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-brand-yellow/85 to-transparent"
      />
      <Container>
        <div className="flex items-center justify-between gap-3 py-2.5 sm:gap-5 sm:py-3">
          <LogoIntro className="min-w-0 max-w-[min(22rem,calc(100%-11.5rem))] sm:max-w-none">
            <Logo navTarget />
          </LogoIntro>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3 lg:gap-5">
            <HeroCTA size="header" onClick={openInquiry}>
              {'Let\u2019s talk'}
            </HeroCTA>
            <IconButton
              className={cn(
                'h-11 w-11 text-foreground',
                'hover-capable:hover:text-brand-blue',
                menuOpen && 'text-brand-blue',
              )}
              label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-controls="mobile-navigation"
              aria-expanded={menuOpen}
              aria-haspopup="dialog"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <FriesMenuIcon open={menuOpen} />
            </IconButton>
          </div>
        </div>
      </Container>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}

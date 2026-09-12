import { Link } from 'react-router-dom';
import { Logo } from '@/components/navigation/Logo';
import { SocialLinks } from '@/components/navigation/SocialLinks';
import { siteConfig } from '@/config/site';
import { contactConfig as fallbackContact } from '@/config/contact';
import { useSiteContent } from '@/hooks/useSiteContent';
import { resolveContactConfig, resolveSiteConfig } from '@/lib/contentAdapters';
import { useInViewOnce } from '@/hooks/useInView';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/cn';

const policyLinks = [
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Use', to: '/terms' },
  { label: 'Refund Policy', to: '/refund' },
];

/**
 * Navy closer footer — logo, socials, contact columns, copyright.
 */
export function ClosingFooter() {
  const [ref, inView] = useInViewOnce({ threshold: 0.16, rootMargin: '0px 0px -6% 0px' });
  const reduced = usePrefersReducedMotion();
  const reveal = reduced || inView;
  const year = new Date().getFullYear();
  const { content } = useSiteContent();
  const contactConfig = resolveContactConfig(content?.contact) || fallbackContact;
  const site = resolveSiteConfig(content?.site) || siteConfig;
  const footerLinks = content?.footer?.quickLinks?.map((link) => ({
    label: link.label,
    to: link.href,
  })) || policyLinks;

  const settle = (delay) =>
    reveal && !reduced
      ? { animationDelay: `${delay}ms` }
      : undefined;

  return (
    <footer ref={ref} className="logo-on-navy">
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        <div
          className={cn(reveal && !reduced && 'animate-footer-settle', !reveal && !reduced && 'opacity-0')}
          style={settle(0)}
        >
          <Logo compact />
          <SocialLinks variant="onDark" className="mt-6" />
        </div>

        <div
          className={cn(reveal && !reduced && 'animate-footer-settle', !reveal && !reduced && 'opacity-0')}
          style={settle(80)}
        >
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white">Address</h2>
          <p className="mt-4 max-w-[16rem] text-[0.9375rem] leading-[1.75] text-closing-muted">
            {contactConfig.address}
          </p>
        </div>

        <div
          className={cn(reveal && !reduced && 'animate-footer-settle', !reveal && !reduced && 'opacity-0')}
          style={settle(160)}
        >
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white">Call us on</h2>
          <ul className="mt-4 space-y-2 text-[0.9375rem] leading-[1.75] text-closing-muted">
            {contactConfig.phone ? (
              <li>
                <a
                  href={`tel:${contactConfig.phone.replace(/\s/g, '')}`}
                  className="transition-colors hover:text-closing-ivory focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-yellow"
                >
                  {contactConfig.phone}
                </a>
              </li>
            ) : null}
            {contactConfig.email ? (
              <li>
                DM us:{' '}
                <a
                  href={`mailto:${contactConfig.email}`}
                  className="transition-colors hover:text-closing-ivory focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-yellow"
                >
                  {contactConfig.email}
                </a>
              </li>
            ) : null}
            {contactConfig.availability ? (
              <li className="text-brand-yellow">{contactConfig.availability}</li>
            ) : null}
          </ul>
        </div>

        <div
          className={cn(reveal && !reduced && 'animate-footer-settle', !reveal && !reduced && 'opacity-0')}
          style={settle(240)}
        >
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white">Our policies</h2>
          <ul className="mt-4 space-y-2 text-[0.9375rem] leading-[1.75] text-closing-muted">
            {footerLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="transition-colors hover:text-closing-ivory focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-yellow"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div
        className={cn(
          'mt-12 h-px origin-left bg-closing-divider',
          reveal && !reduced && 'animate-line-reveal',
          !reveal && !reduced && 'scale-x-0',
        )}
        style={settle(320)}
      />

      <p
        className={cn(
          'mt-6 text-center text-[12px] text-closing-muted',
          reveal && !reduced && 'animate-footer-settle',
          !reveal && !reduced && 'opacity-0',
        )}
        style={settle(400)}
      >
        {content?.site?.copyright || `Copyright \u00A9 ${site.name} ${year}. All rights reserved.`}
      </p>
    </footer>
  );
}

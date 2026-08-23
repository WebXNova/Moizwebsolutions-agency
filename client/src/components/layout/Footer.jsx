import { siteConfig } from '@/config/site';
import { contactConfig } from '@/config/contact';
import { SocialLinks } from '@/components/navigation/SocialLinks';

export function Footer() {
  return (
    <footer>
      <p>{siteConfig.name}</p>
      {contactConfig.email ? <a href={`mailto:${contactConfig.email}`}>{contactConfig.email}</a> : null}
      <SocialLinks />
    </footer>
  );
}

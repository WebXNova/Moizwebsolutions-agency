import { siteConfig } from '@/config/site';

export function Logo() {
  return <span>{siteConfig.name}</span>;
}

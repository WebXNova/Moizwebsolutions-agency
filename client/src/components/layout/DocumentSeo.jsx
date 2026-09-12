import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSiteContent } from '@/hooks/useSiteContent';
import { siteConfig } from '@/config/site';
import { legalPages } from '@/data/legal';

function upsertMeta(selector, attributes) {
  const value = attributes.content;
  if (!value) return;
  let node = document.head.querySelector(selector);
  if (!node) {
    node = document.createElement('meta');
    document.head.appendChild(node);
  }
  for (const [key, attrValue] of Object.entries(attributes)) {
    node.setAttribute(key, attrValue);
  }
}

function upsertLink(rel, href) {
  if (!href) return;
  let node = document.head.querySelector(`link[rel="${rel}"]`);
  if (!node) {
    node = document.createElement('link');
    node.setAttribute('rel', rel);
    document.head.appendChild(node);
  }
  node.setAttribute('href', href);
}

function titleForPath(pathname, siteName, seo) {
  if (pathname === '/') return seo?.homeTitle || siteName;
  if (pathname === '/portfolio') return `${siteName} | Work`;
  if (pathname === '/contact') return `${siteName} | Contact`;
  if (pathname === '/privacy') return `${siteName} | ${legalPages.privacy.title}`;
  if (pathname === '/terms') return `${siteName} | ${legalPages.terms.title}`;
  if (pathname === '/refund') return `${siteName} | ${legalPages.refund.title}`;
  return siteName;
}

/**
 * Applies CMS SEO settings to the document for the public Vite site.
 */
export function DocumentSeo() {
  const { pathname } = useLocation();
  const { content } = useSiteContent();
  const seo = content?.seo;
  const site = content?.site;

  useEffect(() => {
    const siteName = site?.name || siteConfig.name;
    const title = titleForPath(pathname, siteName, seo);
    const homeDescription = seo?.homeDescription || site?.description || siteConfig.description;
    const description = homeDescription;
    const ogTitle = (pathname === '/' ? seo?.ogTitle : title) || title;
    const ogDescription = (pathname === '/' ? seo?.ogDescription : description) || description;
    const ogImage = seo?.ogImage || '';
    const robots = seo?.robots || 'index,follow';
    const siteUrl = (site?.url || siteConfig.url || '').replace(/\/+$/, '');
    const canonical =
      pathname === '/' && seo?.canonicalUrl
        ? seo.canonicalUrl
        : siteUrl
          ? `${siteUrl}${pathname === '/' ? '' : pathname}`
          : '';

    document.title = title;

    upsertMeta('meta[name="description"]', { name: 'description', content: description });
    upsertMeta('meta[name="robots"]', { name: 'robots', content: robots });
    if (seo?.defaultKeywords) {
      upsertMeta('meta[name="keywords"]', { name: 'keywords', content: seo.defaultKeywords });
    }
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: ogTitle });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: ogDescription });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' });
    if (canonical) {
      upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonical });
    }
    if (ogImage) {
      upsertMeta('meta[property="og:image"]', { property: 'og:image', content: ogImage });
    }
    upsertMeta('meta[name="twitter:card"]', {
      name: 'twitter:card',
      content: seo?.twitterCard || 'summary_large_image',
    });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: ogTitle });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: ogDescription });
    upsertLink('canonical', canonical);
  }, [pathname, seo, site]);

  return null;
}

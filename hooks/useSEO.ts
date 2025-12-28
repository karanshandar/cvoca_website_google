import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'event';
  keywords?: string;
  noIndex?: boolean;
}

// Base URL - update this when production domain is confirmed
const BASE_URL = 'https://cvoca.org';
const DEFAULT_IMAGE = '/images/logo-light-theme.png';
const SITE_NAME = 'CVOCA - CVO Chartered & Cost Accountants Association';

/**
 * Custom hook to manage SEO meta tags dynamically per page
 * Updates document title, meta tags, Open Graph, and Twitter Cards
 */
export const useSEO = ({
  title,
  description,
  canonicalUrl,
  ogImage = DEFAULT_IMAGE,
  ogType = 'website',
  keywords,
  noIndex = false
}: SEOProps) => {
  useEffect(() => {
    // Update page title
    document.title = title === 'Home' ? SITE_NAME : `${title} | CVOCA`;

    // Helper function to set or create a meta tag
    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Primary Meta Tags
    setMeta('description', description);
    if (keywords) {
      setMeta('keywords', keywords);
    }
    if (noIndex) {
      setMeta('robots', 'noindex, nofollow');
    } else {
      setMeta('robots', 'index, follow');
    }

    // Open Graph Tags
    const fullTitle = title === 'Home' ? SITE_NAME : `${title} | CVOCA`;
    setMeta('og:title', fullTitle, true);
    setMeta('og:description', description, true);
    setMeta('og:type', ogType, true);
    setMeta('og:site_name', SITE_NAME, true);
    setMeta('og:locale', 'en_IN', true);

    const imageUrl = ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage}`;
    setMeta('og:image', imageUrl, true);

    const pageUrl = canonicalUrl || window.location.href.replace(/#.*$/, '');
    setMeta('og:url', pageUrl, true);

    // Twitter Card Tags
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', description);
    setMeta('twitter:image', imageUrl);
    setMeta('twitter:site', '@cvocain');

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', pageUrl);

  }, [title, description, canonicalUrl, ogImage, ogType, keywords, noIndex]);
};

export default useSEO;

import pages from './pages.json';
import { SITE_NAME, canonical } from '../constants';

/**
 * Title, description and keywords for each static route. The text lives in pages.json so the
 * pages (via useSEO), the sitemap script and the build's per-route HTML all read one copy.
 */
export interface PageSEO {
  title: string;
  description: string;
  keywords?: string;
  noIndex?: boolean;
}

export type StaticRoute = keyof typeof pages;

export const PAGE_SEO: Record<StaticRoute, PageSEO> = pages;

/** The NotFound page, also built as dist/404.html. Not a route, so not in pages.json (the sitemap's list). */
export const NOT_FOUND_SEO: PageSEO = {
  title: 'Page Not Found',
  description: 'The page you are looking for does not exist.',
  noIndex: true,
};

/** Document title for a page title: the site name for Home, otherwise "<title> | CVOCA". */
export const pageTitle = (title: string): string => (title === 'Home' ? SITE_NAME : `${title} | CVOCA`);

/** The useSEO props for a static route. */
export const routeSEO = (route: StaticRoute): PageSEO & { canonicalUrl: string } => ({
  ...PAGE_SEO[route],
  canonicalUrl: canonical(route),
});

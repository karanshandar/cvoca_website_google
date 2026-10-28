import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Plugin } from 'vite';
import { PAGE_SEO, pageTitle, routeSEO, type PageSEO, type StaticRoute } from './pages';

/**
 * Link-preview crawlers (WhatsApp, LinkedIn, X...) don't run JavaScript, so they only see the
 * built HTML. After `vite build`, this gives each static route its own dist/<route>/index.html
 * with that page's title, description, canonical and Open Graph/Twitter tags. The body is
 * untouched, so the SPA boots as before and useSEO keeps the head current on navigation.
 */

export const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/** Replace the single tag matching `pattern`; throw if the template doesn't have exactly one. */
const replaceTag = (html: string, pattern: RegExp, label: string, tag: string): string => {
  const matches = html.match(new RegExp(pattern.source, 'g')) ?? [];
  if (matches.length !== 1) {
    throw new Error(`route heads: expected one ${label} in index.html, found ${matches.length}`);
  }
  // A function replacement, so `$` in page text isn't read as a replacement pattern
  return html.replace(pattern, () => tag);
};

const metaPattern = (attr: 'name' | 'property', key: string) =>
  new RegExp(`<meta\\s+${attr}="${key}"\\s+content="[^"]*"\\s*/?>`);

const meta = (attr: 'name' | 'property', key: string, content: string) =>
  `<meta ${attr}="${key}" content="${escapeHtml(content)}" />`;

/**
 * Return `html` with the page's head values. Without `canonicalUrl` no canonical or og:url is
 * added: dist/index.html is also served for unknown URLs, where any canonical would be wrong.
 */
export const renderRouteHead = (html: string, page: PageSEO, canonicalUrl?: string): string => {
  const title = pageTitle(page.title);
  let out = replaceTag(html, /<title>[^<]*<\/title>/, '<title>', `<title>${escapeHtml(title)}</title>`);

  const metas: Array<['name' | 'property', string, string]> = [
    ['name', 'description', page.description],
    ['name', 'robots', page.noIndex ? 'noindex, nofollow' : 'index, follow'],
    ['property', 'og:type', 'website'],
    ['property', 'og:title', title],
    ['property', 'og:description', page.description],
    ['name', 'twitter:title', title],
    ['name', 'twitter:description', page.description],
  ];
  for (const [attr, key, content] of metas) {
    out = replaceTag(out, metaPattern(attr, key), key, meta(attr, key, content));
  }
  // Keywords are optional per page, so a page without them drops the template's
  out = replaceTag(out, metaPattern('name', 'keywords'), 'keywords', page.keywords ? meta('name', 'keywords', page.keywords) : '');

  if (canonicalUrl) {
    const tags = `  ${meta('property', 'og:url', canonicalUrl)}\n    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />\n  `;
    out = replaceTag(out, /<\/head>/, '</head>', `${tags}</head>`);
  }
  return out;
};

/** Vite build plugin: rewrite dist/index.html for "/" and write dist/<route>/index.html for the rest. */
export const routeHeadsPlugin = (): Plugin => ({
  name: 'cvoca-route-heads',
  apply: 'build',
  writeBundle(options) {
    const outDir = options.dir ?? 'dist';
    const indexPath = join(outDir, 'index.html');
    const template = readFileSync(indexPath, 'utf8');

    writeFileSync(indexPath, renderRouteHead(template, PAGE_SEO['/']));
    const routes = (Object.keys(PAGE_SEO) as StaticRoute[]).filter((route) => route !== '/');
    for (const route of routes) {
      const { canonicalUrl, ...page } = routeSEO(route);
      const dir = join(outDir, route);
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, 'index.html'), renderRouteHead(template, page, canonicalUrl));
    }
    this.environment.logger.info(`✓ Wrote per-route head tags for ${routes.length + 1} routes`);
  },
});

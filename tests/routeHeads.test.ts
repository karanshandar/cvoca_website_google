import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { escapeHtml, renderRouteHead } from '../seo/routeHeads';
import { PAGE_SEO, pageTitle, routeSEO, type StaticRoute } from '../seo/pages';

const template = readFileSync(join(__dirname, '..', 'index.html'), 'utf8');

const count = (haystack: string, needle: string) => haystack.split(needle).length - 1;
const body = (html: string) => html.slice(html.indexOf('<body'));

describe('pageTitle', () => {
  it('uses the site name for Home and appends the brand otherwise', () => {
    expect(pageTitle('Home')).toBe('CVOCA - CVO Chartered & Cost Accountants Association');
    expect(pageTitle('Events')).toBe('Events | CVOCA');
  });
});

describe('routeSEO', () => {
  it('adds the absolute canonical URL for the route', () => {
    expect(routeSEO('/events')).toEqual({ ...PAGE_SEO['/events'], canonicalUrl: 'https://cvoca.org/events' });
  });
});

describe('escapeHtml', () => {
  it('escapes the five HTML-significant characters', () => {
    expect(escapeHtml(`a & "b" <c> 'd'`)).toBe('a &amp; &quot;b&quot; &lt;c&gt; &#39;d&#39;');
  });
});

describe('renderRouteHead', () => {
  const { canonicalUrl, ...events } = routeSEO('/events');
  const html = renderRouteHead(template, events, canonicalUrl);

  it.each([
    '<title>Events | CVOCA</title>',
    `<meta name="description" content="${escapeHtml(events.description)}" />`,
    `<meta name="keywords" content="${escapeHtml(events.keywords ?? '')}" />`,
    '<meta name="robots" content="index, follow" />',
    '<meta property="og:type" content="website" />',
    '<meta property="og:title" content="Events | CVOCA" />',
    `<meta property="og:description" content="${escapeHtml(events.description)}" />`,
    '<meta property="og:url" content="https://cvoca.org/events" />',
    '<link rel="canonical" href="https://cvoca.org/events" />',
    '<meta name="twitter:title" content="Events | CVOCA" />',
    `<meta name="twitter:description" content="${escapeHtml(events.description)}" />`,
  ])('has exactly one %s', (tag) => {
    expect(count(html, tag)).toBe(1);
  });

  it('leaves one <title> and one tag of each kind it replaces', () => {
    expect(count(html, '<title>')).toBe(1);
    for (const key of ['name="description"', 'name="keywords"', 'name="robots"', 'property="og:title"',
      'property="og:description"', 'property="og:type"', 'property="og:url"', 'rel="canonical"',
      'name="twitter:title"', 'name="twitter:description"']) {
      expect(count(html, key), key).toBe(1);
    }
  });

  it('does not change the body', () => {
    expect(body(html)).toBe(body(template));
  });

  it('escapes inserted values', () => {
    const out = renderRouteHead(template, { title: 'A & B', description: '"><script>alert(1)</script>' }, 'https://cvoca.org/x?a=1&b=2');
    expect(out).not.toContain('<script>alert(1)');
    expect(out).toContain('<title>A &amp; B | CVOCA</title>');
    expect(out).toContain('content="&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;"');
    expect(out).toContain('href="https://cvoca.org/x?a=1&amp;b=2"');
  });

  it('marks noindex pages', () => {
    const { canonicalUrl: url, ...privacy } = routeSEO('/privacy-policy');
    expect(renderRouteHead(template, privacy, url)).toContain('<meta name="robots" content="noindex, nofollow" />');
  });

  it('adds no canonical or og:url without a canonical URL (the SPA fallback page)', () => {
    const out = renderRouteHead(template, PAGE_SEO['/']);
    expect(out).not.toContain('rel="canonical"');
    expect(out).not.toContain('og:url');
    expect(out).toContain('<title>CVOCA - CVO Chartered &amp; Cost Accountants Association</title>');
  });

  it('removes keywords for a page without keywords', () => {
    const out = renderRouteHead(template, { title: 'X', description: 'Y' });
    expect(out).not.toContain('name="keywords"');
  });

  it('fails loudly when the template lacks a tag it must replace', () => {
    const broken = template.replace(/<meta property="og:title"[^>]*>/, '');
    expect(() => renderRouteHead(broken, PAGE_SEO['/about'])).toThrow(/og:title/);
  });

  it('renders every static route from the real template', () => {
    for (const route of Object.keys(PAGE_SEO) as StaticRoute[]) {
      const { canonicalUrl: url, ...page } = routeSEO(route);
      expect(renderRouteHead(template, page, url)).toContain(`<link rel="canonical" href="${url}" />`);
    }
  });
});

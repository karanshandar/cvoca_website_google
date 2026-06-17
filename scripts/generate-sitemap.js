import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Keep in sync with BASE_URL in constants.ts
const BASE_URL = 'https://cvoca.org';

// Routes mirror App.tsx; changefreq/priority are SEO metadata not in the router.
const routes = [
  { path: '/',                changefreq: 'weekly',  priority: '1.0' },
  { path: '/about',           changefreq: 'monthly', priority: '0.8' },
  { path: '/membership',      changefreq: 'monthly', priority: '0.9' },
  { path: '/events',          changefreq: 'weekly',  priority: '0.9' },
  { path: '/blog',            changefreq: 'weekly',  priority: '0.7' },
  { path: '/digital-outreach',changefreq: 'monthly', priority: '0.6' },
  { path: '/contact',         changefreq: 'yearly',  priority: '0.7' },
  { path: '/privacy-policy',  changefreq: 'yearly',  priority: '0.3' },
];

const lastmod = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

const urls = routes
  .map(({ path: routePath, changefreq, priority }) => {
    const loc = routePath === '/' ? `${BASE_URL}/` : `${BASE_URL}${routePath}`;
    return [
      '  <url>',
      `    <loc>${loc}</loc>`,
      `    <lastmod>${lastmod}</lastmod>`,
      `    <changefreq>${changefreq}</changefreq>`,
      `    <priority>${priority}</priority>`,
      '  </url>',
    ].join('\n');
  })
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

const outPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
fs.writeFileSync(outPath, xml, 'utf8');
console.log(`✓ Generated sitemap.xml with ${routes.length} URLs (lastmod ${lastmod})`);

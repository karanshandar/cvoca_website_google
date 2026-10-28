import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Keep in sync with BASE_URL in constants.ts
const BASE_URL = 'https://cvoca.org';

// Static routes come from seo/pages.json (shared with the pages and the per-route HTML).
// No lastmod/changefreq/priority: Google ignores the last two,
// and a build-date lastmod would claim every page changed on every deploy.
const pagesPath = path.join(__dirname, '..', 'seo', 'pages.json');
const routes = Object.keys(JSON.parse(fs.readFileSync(pagesPath, 'utf8')));

const urls = routes
  .map(routePath => `  <url>\n    <loc>${BASE_URL}${routePath}</loc>\n  </url>`)
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

const outPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
fs.writeFileSync(outPath, xml, 'utf8');
console.log(`✓ Generated sitemap.xml with ${routes.length} URLs`);

# Security, Performance, SEO, Privacy & Production-Readiness Review

Reviewed: 2026-10-25, branch `claude/early-website-review-b04e34` at `f02b98c`, plus the live site https://cvoca.org.
Read-only review. No code was changed. The build was run in a throwaway copy, because `npm run build` rewrites the tracked files `public/sitemap.xml` and `public/data/*.json`.

## Executive summary

The site is small, fast to download and has little attack surface: no forms, no auth, no cookies, no user input stored anywhere. The biggest problems are about configuration, not code:

1. **The security headers in `render.yaml` are not live.** https://cvoca.org sends only `X-Content-Type-Options: nosniff`. There is no CSP, no HSTS, no X-Frame-Options, no Referrer-Policy and no Permissions-Policy. The Render service is almost certainly not managed by the Blueprint, so the file is ignored.
2. **The Google Sheets API key is public by design.** It is in `/assets/fetchWithFallback-*.js` on the live site. That is fine only if the key is restricted in Google Cloud. I could not check the restrictions (see the note under S2), so the owner must confirm them.
3. **Mobile Lighthouse performance is only 46–61, mostly because of one bug.** CLS is 0.65: the footer jumps when each lazy-loaded page replaces a 400 px spinner. A one-line change to the fallback height should fix most of it. Total page weight is small (about 210–290 KiB).
4. **Caching is wrong for hashed assets.** Every file, including content-hashed `/assets/*.js`, is served with `max-age=0`, so returning visitors re-check every file.
5. **SEO is limited by client-side rendering.** Every URL returns the same HTML, with `canonical` and `og:url` pointing at the homepage, and unknown URLs return HTTP 200. Social previews (WhatsApp, LinkedIn, Facebook) always show the homepage card. The OG image is a WebP logo.
6. **The privacy policy doesn't match the site.** It describes contact forms, analytics, cookies and password storage that don't exist. It doesn't mention the third parties that are actually used (Google Fonts, Google Maps, the Google Sheets API, Cloudinary). Its "Last Updated" date is always today.
7. **There's no monitoring.** No error tracking or uptime check. A failed or slow Sheets request falls back silently or leaves a spinner running forever.
8. `npm audit` reports **13 vulnerabilities (9 high)**. All of them are in build or dev tooling (vite, rollup, source-map-js, launch-editor), none in shipped code. `npm audit fix` within the current semver ranges fixes them.

The rest of this file ranks the issues and suggests the fix order.

---

## Findings, ranked by severity

Impact and effort are each rated H/M/L.

### S1 — High: none of the `render.yaml` security headers reach the live site
- **Impact: H · Effort: L**
- **Evidence:** `curl -D - https://cvoca.org/` (and `/events`, `/robots.txt`, `/assets/index-*.js`) returns:
  `Cache-Control: public, max-age=0, s-maxage=300`, `etag`, `x-content-type-options: nosniff`, and Cloudflare/Render headers. That's all. `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options`, `Referrer-Policy` and `Permissions-Policy` are all missing. The live build matches HEAD (the deployed file is dated 2026-07-20, the date of `f02b98c`), so this isn't a stale deploy.
- **Config:** `render.yaml:13-36` defines them. The file's history (`8f87f59` added the headers, then `268ac0b` changed the schema and `879d8b4` reverted it) suggests the service was created in the Render dashboard and was never linked as a Blueprint. Render applies `render.yaml` only to services that a Blueprint manages. The SPA rewrite does work live (`/does-not-exist` returns 200 with index.html), so it was probably set in the dashboard too. `public/_redirects` is a Netlify file and Render ignores it.
- **Result:** the site can be framed (clickjacking on a site with no forms has low real impact), there's no HSTS, and there's no CSP defence in depth.
- **Fix:** either link the repo as a Blueprint in Render (Blueprints → New → select repo), or add the same headers under Dashboard → Static Site → Settings → Headers. Afterwards, check with `curl -sI https://cvoca.org/`. Fix S3 and S4 before or at the same time.

### S2 — High (if unrestricted) / Low (if restricted): the Google Sheets API key ships in public JavaScript
- **Impact: H→L depending on restrictions · Effort: L**
- **Evidence:** `utils/googleSheets.ts:6` reads `VITE_GOOGLE_SHEETS_API_KEY`, which Vite inlines at build time. `utils/googleSheets.ts:25` puts it in the query string. The live chunk `https://cvoca.org/assets/fetchWithFallback-GwVtBWww.js` contains one `AIza…` key and the `sheets.googleapis.com` URL. Anyone can read it in DevTools. The sheet ID is in the same chunk.
- **What someone can do with it:**
  - Read **every tab** of the spreadsheet, not just the ones the site uses. They can list tab names with `spreadsheets.get` and read any range. Treat everything in that spreadsheet, hidden tabs included, as public. It must not hold member phone numbers, emails or draft data.
  - Use up the project's quota. Sheets read quota is about 300 requests per minute per project. A script looping on the key would push every real visitor onto the stale JSON fallback (a cheap denial of freshness, see P5).
  - If the key has **no API restriction**, use it for any other API enabled on the same Google Cloud project, some of which are billable (Maps, Gemini/Generative Language, and so on). This project used a `GEMINI_API_KEY` before (`render.yaml` history), so check that the Generative Language API isn't enabled on the same project, or that this key can't call it.
  - A referrer restriction doesn't stop a determined attacker using curl, because the `Referer` header can be forged. It does stop casual reuse from other websites and from Google's leaked-key scanners.
- **Restrictions the key should have** (Google Cloud Console → APIs & Services → Credentials → the key):
  1. **Application restrictions → Websites (HTTP referrers):** `https://cvoca.org/*` and, if wanted, `http://localhost:3000/*` for development. Better: use a separate dev key, so the production key allows only `https://cvoca.org/*`.
  2. **API restrictions → Restrict key → Google Sheets API only.**
  3. The project should have only the Sheets API enabled, ideally in a dedicated project with a budget alert.
  4. Rotate the key after restricting it if it has ever been unrestricted, because it has been public since launch.
- **Lasting fix (architecture, also flagged by the architecture review):** fetch the Sheets data at **build time** (or with a scheduled Render deploy hook) and ship JSON. That removes the key from the bundle completely, removes the runtime dependency (P5), and makes S5 simpler.
- **Note:** I deliberately did **not** send test requests with the live key to check its restrictions. The session's safety controls blocked that. The site owner should check in the Cloud Console, which is the authoritative place anyway.

### S3 — Medium: the CSP in `render.yaml` would partly break the site once applied, and is weak where it doesn't
- **Impact: M · Effort: L**
- `render.yaml:23`:
  - **`script-src 'self' 'unsafe-inline'`.** The only inline script-like code is the font-loading `onload="this.media='all'"` handler in `index.html:51`. The built page has no inline `<script>`. Vite emits `<script type="module" src=…>`, and the JSON-LD blocks are `type="application/ld+json"`, which CSP doesn't treat as script. So `'unsafe-inline'` exists only for that one handler. Replace the async-CSS trick with a plain `<link rel="stylesheet">` (Inter with `display=swap` already avoids invisible text) or self-host the font (P4). Then drop `'unsafe-inline'` from `script-src`, which makes the CSP actually useful against XSS.
  - **`img-src 'self' data: https:`.** This allows images from any HTTPS host. It's needed today because content images come from many places: `res.cloudinary.com`, `picsum.photos` (placeholder in `public/data/blog.json`), `images.unsplash.com`, and whatever URL an editor types into the sheet. Image-only exfiltration risk is low. Tighten it to `'self' data: https://res.cloudinary.com` (plus whatever hosts are really used) once the content is normalised onto Cloudinary.
  - **`frame-src https://www.google.com`.** Correct for the Maps embed (`public/data/contact.json` uses `https://www.google.com/maps/embed?...`). It would break if anyone pastes a YouTube or Drive embed. That's fine for now.
  - **`form-action 'none'`.** Harmless. The app has no `<form>` (checked with grep), and all CTAs are links to rzp.io, Razorpay pages, forms.gle and wa.me. Note that this would silently break any future on-site form.
  - **`connect-src 'self' https://sheets.googleapis.com`.** Correct. All `fetch()` calls go to `/data/*.json` or the Sheets API.
  - **`style-src 'unsafe-inline'`.** Needed for the React `style={{…}}` attributes (for example `pages/Contact.tsx:110,119`). Acceptable.
  - Missing `frame-ancestors 'self'`. Add it, because it supersedes `X-Frame-Options`.
- **Other header notes (`render.yaml:13-31`):**
  - `X-XSS-Protection: 1; mode=block` is deprecated. Modern guidance is to omit it or set it to `0`.
  - HSTS `includeSubDomains; preload` commits **every** subdomain to HTTPS permanently (blog.cvoca.org already serves HTTPS and 301s from HTTP, which is good). Don't submit to the preload list until every subdomain, including mail and any old hosts, is confirmed HTTPS. Start with `max-age=31536000` without `preload`.
- **Before turning the CSP on**, deploy it once as `Content-Security-Policy-Report-Only` and check the browser console on every page, including the Maps embed and Cloudinary images.

### S4 — Medium: hashed assets are never cached in browsers
- **Impact: M · Effort: L**
- **Evidence:** `/assets/index-BTg4k5Bv.js` → `Cache-Control: public, max-age=0, s-maxage=300`. That's the same as `index.html`, `/images/*.webp` and `/data/*.json`. Brotli compression is on (`Content-Encoding: br`) and Cloudflare caches at the edge for 5 minutes, but browsers revalidate every file on every visit.
- **Fix (Render headers):** `/assets/*` → `Cache-Control: public, max-age=31536000, immutable`. `/images/*` → `public, max-age=604800` (or longer if the files are renamed when they change). Keep `/index.html`, `/data/*` and `/sitemap.xml` at `max-age=0` (or a short value) so content updates show up.

### S5 — Low: rendering content from Sheets and JSON is safe today
- **Impact: L · Effort: L**
- All Sheets and JSON content is rendered as React text children. No `dangerouslySetInnerHTML` is used except `components/SchemaMarkup.tsx:20`, which renders `JSON.stringify(schema)` into `<script type="application/ld+json">`. Event schemas include Sheets-supplied `title` and `description` (`pages/Events.tsx:437-447`). This is client-side only and the script type isn't executable. But if prerendering or SSR is added later (see SEO1), a sheet cell containing `</script><script>…` would become stored XSS. If that happens, escape `<` as `<` in `SchemaMarkup`.
- `href`s come from data: `registrationLink`, `readMoreLink`, `ctaLink`, `contact`, `platform.url`, `report.link` (for example `pages/Events.tsx:324,340`, `pages/DigitalOutreach.tsx:281,297`, `components/Footer.tsx:70`). React 19 blocks `javascript:` URLs, so a malicious sheet cell can't run script through a link. A sheet editor can still point a "Register" button at a phishing page, so the real control is **who can edit the spreadsheet**. Keep edit access to a small named group and check its sharing settings.
- The Maps iframe is sandboxed (`pages/Contact.tsx:116-124`, `sandbox="allow-scripts allow-same-origin"`), which is good. Its `referrerPolicy="no-referrer-when-downgrade"` sends the full page URL to Google. `strict-origin-when-cross-origin` would be enough.

### S6 — Low: `target="_blank"` links all have `rel` (no action needed)
- **Impact: L · Effort: none**
- The brief mentioned `components/Footer.tsx:9`, `pages/Events.tsx` and `pages/Membership.tsx`. On this commit **every** `target="_blank"` has `rel="noopener noreferrer"`: `components/Footer.tsx:9-10`, `pages/Events.tsx:106-107,314-315,325-326,341-342`, `pages/Membership.tsx:80-81`, `pages/About.tsx:159-160,193`, `pages/Blog.tsx:20-21,152`, `pages/Home.tsx:276-277,321`, `pages/DigitalOutreach.tsx:141,282-283`. Modern browsers also imply `noopener` for `target="_blank"`. Nothing to fix.

### S7 — Low: `npm audit` shows 13 vulnerabilities (9 high), all in build or dev tooling
- **Impact: L (nothing in the shipped bundle) · Effort: L**
- `npm audit` on the lockfile: vite 7.3.1 (dev-server path traversal and fs.deny bypasses, launch-editor issues on Windows), rollup 4 (arbitrary file write via path traversal), source-map-js (ReDoS-style DoS). All have fixes through `npm audit fix` within the existing ranges (vite → 7.3.7). The risk is to developers running `npm run dev` with `host: '0.0.0.0'` (`vite.config.ts:7`), which exposes the dev server to the local network. Consider removing `host` or binding to localhost.
- **Outdated packages** (current → latest in range / newest major): react and react-dom 19.2.0 → 19.3.1, react-router-dom 7.9.6 → 7.18.4, vite 7.3.1 → 7.3.7 (8.x available), postcss 8.5.6 → 8.5.31, autoprefixer 10.4.22 → 10.6.1, @vitejs/plugin-react 5.1.1 → 5.2.0 (6.x available). Majors not urgent: tailwindcss 4, typescript 7, @types/node 26. The caniuse-lite browserslist data is 11 months old.
- `render.yaml:6` runs `npm install` rather than `npm ci`, so production builds can resolve versions that differ from the lockfile. Use `npm ci && npm run build`.

---

### P1 — Medium: the initial JS bundle is 80 KB gzip; pages are split well
- **Impact: M · Effort: M**
- `npm run build` (vite 7.3.1):

  | Chunk | Raw | Gzip |
  |---|---:|---:|
  | `index.js` (React 19, ReactDOM, react-router, App, Header, Footer) | 248.7 kB | **79.9 kB** |
  | `index.css` (Tailwind) | 69.9 kB | 10.6 kB |
  | `About` | 25.1 kB | 6.1 kB |
  | `Home` | 20.5 kB | 5.1 kB |
  | `Events` | 19.1 kB | 5.4 kB |
  | `DigitalOutreach` | 14.6 kB | 4.4 kB |
  | `Membership` | 11.0 kB | 3.1 kB |
  | `PrivacyPolicy` | 7.4 kB | 2.5 kB |
  | `Blog` | 5.9 kB | 2.0 kB |
  | `Contact` | 4.6 kB | 1.8 kB |
  | `NotFound` | 0.7 kB | 0.4 kB |
  | shared: `fetchWithFallback` 2.4, `useSEO` 1.2, `imageUtils` 0.4, `useFetch` 0.3 | | ~2.3 kB |
  | `index.html` | 3.7 kB | 1.2 kB |

  First load of `/` is about 80 + 10.6 + 5.1 + 2 ≈ **98 kB gzip** of JS and CSS. That's reasonable for a React SPA. Route-level `lazy()` splitting is already in place (`App.tsx:11-19`). The page JS loads only after the main chunk runs, which makes a request waterfall. `<link rel="modulepreload">` for the Home chunk, or Vite's automatic preloading, could help a little.
- A 70 kB CSS file (raw) is large for Tailwind. Check that `tailwind.config.js` `content` globs aren't pulling in `docs/` or `node_modules`.

### P2 — High: Lighthouse mobile performance is 46–61, mostly because of one layout shift (CLS 0.65)
- **Impact: H (Core Web Vitals fail on every page) · Effort: L**
- Lighthouse 12.6 ran in mobile mode (simulated slow 4G, 4× CPU) against the live site. Full table at the end of this file.
- **CLS 0.403–0.653 on every page** ("good" is ≤ 0.1). On Home the shifted element is the `<footer>`: 0.514 + 0.139. The cause is `App.tsx:62-77` together with `components/LoadingSpinner.tsx:5`. The Suspense fallback is only `min-h-[400px]`, so on a phone the footer sits in the first viewport while the lazy page chunk downloads, and then the page renders and pushes it about 6,000 px down. Footer data loading late (`components/Footer.tsx:29-30`) adds to it. **Fix:** make the route fallback at least viewport height (for example `min-h-screen`) so the footer starts below the fold, or don't render the footer until the route has loaded. This one change should take CLS to roughly 0 and performance into the 80s.
- **LCP 3.5–5.2 s, FCP 2.3–3.9 s.** The waterfall is: HTML, then the 80 kB-gzip main chunk, then the page chunk, then `/data/*.json` and Sheets, then render. The LCP element on Home is the hero `<h1>`, which also has an entrance animation with `animation-delay: 0.1s` (`pages/Home.tsx:184`) that pushes LCP later. Prerendering (SEO1) is the structural fix. Cheaper fixes: don't animate the LCP heading, and preload the Home chunk.
- **Other audits:** `uses-responsive-images` (55–72 KiB savings: full-size event and committee images in small boxes, see P3), `unused-javascript` (~27 KiB in the main chunk), `server-response-time` 620 ms on one run (Cloudflare edge cache MISS; S4 helps).
- Total transfer is only 212–288 KiB per page, so the problem is ordering and layout, not weight.

### P3 — Low: images are already well optimised
- **Impact: L · Effort: L**
- `public/` is 706 KB in total. Every raster image is WebP. The largest are `public/images/events/building-business-legacies.webp` (168 KB), `from-abc-to-genz.webp` (110 KB) and `cvoca-investocraft-2020.webp` (79 KB). Committee photos are 9–28 KB. Images below the fold use `loading="lazy" decoding="async"` (for example `pages/Home.tsx:90`, `pages/About.tsx:246`).
- `utils/imageUtils.ts:31-60` adds `f_auto,q_auto,w_N` to Cloudinary URLs. That's good, but only two Cloudinary URLs exist in the data today. Local `/images/...` and Unsplash/picsum images aren't resized. Serving the 168 KB event image at full size into an 800 px card on mobile is the only real waste.
- No `<img>` has `width`/`height` attributes (grep finds none). Aspect-ratio containers mostly hide this, but add intrinsic sizes where images aren't in a fixed-ratio box to avoid layout shift (CLS).
- `components/Logo.tsx:25-38` (Footer) always downloads **both** logos (27 + 29 KB) and hides one with CSS. That's a minor waste. A `<picture>` with `prefers-color-scheme` won't work because the theme is a class, but the footer is below the fold, so `loading="lazy"` on both images is the cheap fix.

### P4 — Low: font loading
- **Impact: L · Effort: L**
- `index.html:47-52`: preconnect to both Google hosts, a `preload` of the CSS, and the `media="print" onload` swap with a `<noscript>` fallback. It doesn't block rendering. It loads **six weights** (300–800). Check which weights `tailwind.config.js` and the components actually use (probably 400/500/600/700/800) and drop the rest.
- The `onload` handler is what forces `script-src 'unsafe-inline'` (S3). Self-hosting Inter (for example the `@fontsource-variable/inter` package, about 1 variable WOFF2) removes two third-party origins and the privacy disclosure for Google Fonts (PR1), and allows a strict CSP. Recommended.

### P5 — Medium: runtime dependency on Google Sheets has no timeout, no visible error, and a stale fallback
- **Impact: M · Effort: M**
- Requests per page view: Home makes **3** Sheets calls (`pages/Home.tsx:129-141`: events, presidentMessage, managingCommittee). About makes **4** (`pages/About.tsx:225-228`). Events makes 1. Each is a separate `values` call. They could be a single `values:batchGet`.
- **Rate limits:** Sheets read quota is about 300 requests per minute per project (60 per minute per user per project). Once the per-project limit is reached, everyone gets 429 errors. At around 75 About-page views per minute, real visitors would start getting the fallback. That's unlikely for normal traffic but easy to cause on purpose with the public key (S2).
- **Slow or down:** `fetchWithFallback` (`utils/fetchWithFallback.ts:5-19`) only falls back when the request **rejects**. `fetch` has no timeout, so a hanging connection leaves a spinner until the browser gives up, which can take minutes. The architecture review also notes that no page reads `useFetch().error`. Add `AbortSignal.timeout(5000)` to the Sheets fetch.
- **Fallback goes stale silently:** `/data/events.json` and the other files are whatever was committed last. During a Sheets outage visitors see old events without any notice. Building the JSON from Sheets at build time (S2) solves both problems.
- **Fallback on a missing file:** because of the SPA rewrite, a missing `/data/x.json` returns `index.html` with HTTP 200, so `res.ok` passes and `res.json()` throws a SyntaxError (also noted by the architecture review). Live check: `/data/events.json` correctly returns `application/json`.
- **Missing env vars:** `utils/googleSheets.ts:9-11` only logs `console.error`. The Render build **succeeds** without `VITE_GOOGLE_SHEETS_API_KEY` or `VITE_GOOGLE_SHEET_ID`, and the site then requests `…/spreadsheets/undefined/values/events?key=undefined` on every page view, gets a 400, and falls back. Nothing tells anyone. Fail the build in `vite.config.ts` when `mode === 'production'` and the variables are missing, unless the build-time-JSON approach replaces them.

---

### SEO1 — Medium: every route serves the homepage's head; soft 404s
- **Impact: M · Effort: M (prerender) / L (partial)**
- Raw HTML for **every** URL (`/events`, `/about`, `/does-not-exist`) is the same `index.html`, with `<link rel="canonical" href="https://cvoca.org/">`, `og:url https://cvoca.org/` and the homepage title and description (`index.html:9-34`). `hooks/useSEO.ts` fixes these after JavaScript runs.
  - **Googlebot** renders JS, so it eventually sees the correct per-page canonical. But the raw HTML and the rendered HTML disagree on canonical, which is a known cause of Google picking the homepage as canonical for subpages. **Remove the canonical (and `og:url`) from `index.html`** and let `useSEO` add it, or prerender.
  - **Social and messaging crawlers** (WhatsApp, LinkedIn, Facebook, X, Slack) don't run JS. Every shared link shows the homepage title, description and image. For an association that shares event links on WhatsApp, this is the most visible SEO problem.
  - **Unknown URLs return HTTP 200** (live `curl https://cvoca.org/does-not-exist` → 200). `NotFound` sets `noindex` through JS (`pages/NotFound.tsx:6-10`), which Google respects after rendering, but it's still a soft 404. Its title also doubles up: `'Page Not Found - CVOCA'` becomes "Page Not Found - CVOCA | CVOCA" (`hooks/useSEO.ts:31`).
- **Fix:** prerender the 8 static routes at build time. Options: `vite-plugin-prerender`/`vite-ssg`-style static generation, React Router 7 "framework mode" prerendering, or a small script that writes `dist/<route>/index.html` with the right `<title>`, `<meta>`, canonical and OG tags. Render serves real files before the rewrite applies, so known routes get correct heads and true 404s become possible: make the catch-all rewrite only cover known routes, or serve a `404.html`.

### SEO2 — Low: social-sharing image
- **Impact: L-M · Effort: L**
- `og:image` and `twitter:image` are the **WebP logo** (`index.html:23,32`, `constants.ts:3`) with `twitter:card=summary_large_image`. A square logo cropped into a 1.91:1 card looks poor. WebP isn't reliably supported by LinkedIn or older WhatsApp. Add a 1200×630 JPG/PNG share image with `og:image:width`/`height`/`alt`.

### SEO3 — Low: sitemap, robots, meta
- **Impact: L · Effort: L**
- `public/robots.txt` is fine. `Disallow: /api/` refers to a path that doesn't exist and is harmless. It points at the sitemap.
- `public/sitemap.xml` is generated by `scripts/generate-sitemap.js` with **`lastmod` = build date for every URL** (`scripts/generate-sitemap.js:24`), so every deploy claims every page changed. Google learns to ignore `lastmod` that's always "now". Either drop `lastmod` or derive it from real content dates. `changefreq` and `priority` are ignored by Google and harmless. The live sitemap still says `2026-07-20`.
- Each page has its own title, description and canonical through `useSEO` (`pages/*.tsx`, checked: Home, About, Membership, Events, Blog, Digital Outreach, Contact, Privacy). `meta keywords` (`index.html:12`) is ignored by search engines. Google Search Console verification is commented out (`index.html:41`). Check that the property is verified some other way (DNS) and that the sitemap is submitted.
- `theme-color` `#2563eb` (`index.html:44`) may not match the DESIGN.md brand colour (design review's area).

### SEO4 — Low: structured data
- **Impact: L · Effort: L**
- `utils/schema.ts`: Organization (as `ProfessionalService`), WebSite, LocalBusiness and Breadcrumb are well formed. Issues:
  - `getEventSchema` (`utils/schema.ts:108-150`) marks **every** event, past ones included (`pages/Events.tsx:437` uses `filteredEvents`, which includes past events when the time filter is "all"), as `EventScheduled` with `availability: InStock`. Google's Event guidelines discourage marking up past events as available. `startDate` is a date only, without a time or timezone (`event.time` is passed but unused). `image` may be a relative `/images/...` path, and schema should use absolute URLs. The schema set also changes as users filter, which is harmless.
  - `numberOfEmployees: 2400 members` (`utils/schema.ts:51-55`) misuses the property. Members aren't employees. Remove it.
  - `priceRange: "$$"` on LocalBusiness doesn't make sense for an association. Organization and LocalBusiness are emitted on `/contact` with different `@type`s and no shared `@id`, so link them or emit one.

---

### PR1 — Medium: the privacy policy doesn't describe what the site does
- **Impact: M (trust / compliance with India's DPDP Act 2023) · Effort: L**
- `pages/PrivacyPolicy.tsx` claims things that **aren't true**:
  - "Contact Forms", "Membership Registration" and "Event Registration" collection (lines ~40-43). The site has no forms. Registration happens on Razorpay pages (`rzp.io`, `pages.razorpay.com`) and Google Forms (`forms.gle`).
  - "Cookies … analytics tracking", "Analytics" use, "Service Providers … analytics" (lines ~50, 59, 69, 98-99). There's **no analytics and no cookies**. The only browser storage is `localStorage['theme']` (`App.tsx:30,39`).
  - "Secure password storage with encryption", "Regular security audits" (lines ~80-81). The site has no accounts.
  - "Last Updated: {new Date()…}" (line 28) always shows **today's date**, which is misleading and contradicts line 110.
- It **leaves out** what actually happens:
  - **Google Fonts** (`index.html:47-52`): every visitor's IP address and user agent go to Google on every page.
  - **Google Maps embed** on /contact (`pages/Contact.tsx:116`): Google can set cookies there. The full page URL is sent as referrer.
  - **Google Sheets API** (`utils/googleSheets.ts:29`): the visitor's browser contacts `sheets.googleapis.com` directly.
  - **Cloudinary, Unsplash, picsum** image hosts, Render and Cloudflare hosting and their logs, and the third-party destinations for registration and payment (Razorpay, Google Forms, WhatsApp).
- **Fix:** rewrite it to be short and accurate. Say no cookies or analytics, list the third parties and why each is used, give a fixed "Last updated" date, and name the contact (it currently lists `president@cvoca.org`, while the rest of the site uses `info@cvoca.org`, so pick one). Self-hosting fonts (P4) and a click-to-load map would remove two of these disclosures.

### PR2 — Low: what the Sheets data exposes
- See S2: the whole spreadsheet is effectively public. Check that no tab holds personal data (phone numbers, emails) beyond what's meant to be shown publicly.

---

### OPS1 — Medium: no error monitoring, uptime check or alerting
- **Impact: M · Effort: L**
- There's no Sentry or equivalent, no `window.onerror` reporting, and `ErrorBoundary.componentDidCatch` (`components/ErrorBoundary.tsx:21-23`) only writes to `console.error`. Sheets failures are logged to the console and never surface (P5). There's no uptime check.
- **Fix (cheap):** a free uptime monitor (UptimeRobot, Better Stack, or a Render health notification) on `https://cvoca.org/` plus a keyword check. A free Sentry browser SDK hooked into `ErrorBoundary` and `fetchWithFallback`'s catch, so stale-fallback events are visible. A Google Cloud budget alert on the Sheets project (S2).

### OPS2 — Low: build and deploy configuration
- **Impact: L · Effort: L**
- A missing env var doesn't fail the build (P5).
- `npm install` in the build instead of `npm ci` (S7).
- `render.yaml` uses the deprecated `env: static`. The current Blueprint spec is `runtime: static`. It's moot until the Blueprint is linked (S1).
- `public/_redirects` (`/* /index.html 200`) is Netlify syntax. Render ignores it, and it's misleading next to `render.yaml:33-36`. Remove it or document that it isn't used.
- **Redirects work live:** `http://cvoca.org/` → 301 → `https://cvoca.org/`, and `https://www.cvoca.org/` → 301 → `https://cvoca.org/`. That's good, and it means the domain and Cloudflare setup is correct.
- The 404 setup is soft (SEO1).

---

## Prioritised fix list

Do these in order. Each is small on its own.

| # | Fix | Finding | Effort |
|---|---|---|---|
| 1 | In Google Cloud Console, restrict the Sheets key to the referrer `https://cvoca.org/*` and to **Sheets API only**. Make sure no billable API is enabled on that project. Add a budget alert. Rotate the key if it was ever unrestricted. Check that the spreadsheet has no private tabs. | S2, PR2 | L |
| 2 | Get the headers live: link `render.yaml` as a Blueprint, or enter the headers in the Render dashboard. In the same change: add `frame-ancestors 'self'`, drop `X-XSS-Protection`, drop HSTS `preload` for now, add `Cache-Control: public, max-age=31536000, immutable` for `/assets/*`. Roll out the CSP as Report-Only first, then enforce it. Check with `curl -sI`. | S1, S3, S4 | L |
| 3 | Fix the CLS: make the Suspense fallback (`components/LoadingSpinner.tsx:5`) at least viewport height so the footer can't appear and then jump. Don't animate the LCP hero `<h1>`. Re-run Lighthouse. | P2 | L |
| 3b | Rewrite the privacy policy to match reality, with a fixed date. | PR1 | L |
| 4 | Add an uptime monitor and basic error reporting (Sentry free tier, or at least a logged-fallback signal). | OPS1 | L |
| 5 | Add a timeout to the Sheets fetch, show the error state, and fail the production build on missing env vars. | P5 | L |
| 6 | Run `npm audit fix` and switch the build to `npm ci && npm run build`. Remove `host: '0.0.0.0'` from the dev config. | S7 | L |
| 7 | Remove the canonical and `og:url` from `index.html`. Add a 1200×630 JPG share image. Fix the NotFound title. Drop the build-date `lastmod`. Fix the event schema for past events. Remove `numberOfEmployees`. | SEO1–4 | L |
| 8 | Self-host Inter with fewer weights and remove the `onload` handler. Then remove `'unsafe-inline'` from `script-src`. | P4, S3 | L-M |
| 9 | **Structural:** generate the Sheets JSON at build time (with a scheduled Render deploy hook) and prerender the 8 routes. This removes the public key, the runtime Sheets dependency, the stale fallback, the soft 404 and the homepage-only social previews in one go. Coordinate with the architecture review. | S2, P5, SEO1 | M |
| 10 | Tidy-ups: lazy-load the footer logos, add image `width`/`height`, tighten `img-src` once images are on Cloudinary, use `values:batchGet` if runtime Sheets stays, remove `public/_redirects`. | P3, S3, OPS2 | L |

---

## Lighthouse results (mobile, live site)

`npx lighthouse@12.6.0 https://cvoca.org/<page> --form-factor=mobile` (headless Chrome, default simulated throttling), one run per page on 2026-10-25. A single run varies by about ±5 points.

| Page | Perf | A11y | Best practices | SEO | FCP | LCP | TBT | CLS | Speed Index | Transfer |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `/` | 61 | 94 | 100 | 92 | 2.3 s | 3.5 s | 80 ms | **0.653** | 5.0 s | 237 KiB |
| `/events` | 46 | 96 | 100 | 100 | 3.9 s | 5.2 s | 0 ms | **0.403** | 8.7 s | 212 KiB |
| `/about` | 56 | 84 | 100 | 100 | 2.6 s | 4.1 s | 50 ms | **0.653** | 5.4 s | 235 KiB |
| `/membership` | 56 | 94 | 100 | 100 | 2.5 s | 4.2 s | 0 ms | **0.653** | 5.4 s | 288 KiB |

Failing non-performance audits, for the design and accessibility review: `color-contrast` on all four pages (for example the tiny `text-[0.6rem]` and `text-[10px]` labels in the header logo), `heading-order` (Home, About, Membership), `list`/`listitem` (About), `link-text` on Home (3 links with non-descriptive text, which is why Home's SEO score is 92). Best practices is 100 everywhere. Lighthouse doesn't penalise a missing CSP in its score.

JSON reports (not committed) are in the scratchpad: `C:\Users\karan\AppData\Local\Temp\claude\C--Users-karan-Downloads-code-projects-cvoca-website-google--claude-worktrees-early-website-review-b04e34\22cb1318-b0df-48f8-8bfe-17f070953741\scratchpad\lh\`.

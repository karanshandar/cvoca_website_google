# Architecture Review — CVOCA Website

Scope: system-level architecture only (structure, data flow, build/deploy, SEO, images). Line-level code quality is covered by a separate review.
Reviewed at commit `f02b98c` on 2026-10-25. Read-only: no code was changed.

---

## 1. Executive summary

**The site is mostly simple, with one over-built area.** About 4,400 lines, three runtime dependencies (react, react-dom, react-router-dom), no state library, no CSS-in-JS, no test or lint tooling, and a 4-line Vite config. That is the right size for an association's brochure site. The flat `pages/ components/ hooks/ utils/` layout fits that size and doesn't need restructuring.

The real complexity is in the **data layer**. Content comes from **two sources of truth at runtime**: a public Google Sheets API key used straight from the browser, plus hand-maintained JSON copies of the same data as a "fallback". On top of that there are **three different fetch patterns** and **no caching or error UI**. This is where most of the risk and maintenance cost sits:

- The fallback JSON has to be kept in sync with the Sheet by hand. If it drifts, visitors silently see stale content whenever Sheets fails.
- Every page visit makes 1–4 Sheets API calls (About makes four separate calls). Nothing is cached, so going back to a page fetches everything again.
- No page ever shows `error`. A failed JSON fetch on Home, Membership or Contact leaves a spinner that never stops.

**Single biggest recommendation:** pull the Google Sheets data **at build time** into `public/data/*.json`, so the browser only ever reads static JSON. That one change deletes the fallback layer, the API key in the bundle, the runtime Sheets dependency, the `connect-src` CSP exception and most of the type casts. The cost is that content editors need a redeploy, which a Render deploy hook can automate, to publish Sheet edits. If changes must appear instantly, keep the runtime fetch but put it behind one cached `getData(name)` function (details in §3, finding D1).

The build pipeline and SEO layer are **mostly proportionate**, with a few small dead or misleading pieces: the in-place JSON minifier, `_redirects` on Render, unused Cloudinary helpers, an unused `blog.json`, and duplicated address/route constants. The important gaps for a simple site are: a type-check step in the build (`tsconfig` isn't `strict` and `vite build` doesn't type-check), an error state for data fetches, and no way to stop the light-theme flash for dark-mode users.

---

## 2. Architecture overview

```
                        Render static site  (render.yaml: build, headers, SPA rewrite)
                                 │
   npm run build ──► minify-json.js (REWRITES public/data/*.json in place)
                 ──► generate-sitemap.js (writes public/sitemap.xml)
                 ──► vite build ──► dist/
                                 │
 Browser ── index.html (static meta, fonts) ── index.tsx ── App.tsx
                                                   │  BrowserRouter, theme state, global JSON-LD,
                                                   │  ErrorBoundary > Suspense > 9 lazy routes
                                                   ▼
   pages/*.tsx ── useSEO() (mutates <head>)   SchemaMarkup (JSON-LD <script>)
        │
        ├─ useFetch(() => fetch('/data/x.json'))                         home, outreach, membership, contact
        ├─ useFetch(() => fetchWithFallback(sheetsFn, '/data/x.json'))   events, committees, reports, presidents
        └─ useFetch(() => fetchPresidentMessage().catch(() => null))     + home.json "presidentDefault"
   Footer ── its own useState/useEffect fetch                             contact.json, socialMedia.json

   utils/googleSheets.ts ──► sheets.googleapis.com/v4 (API key in bundle), one request per tab
   utils/imageUtils.ts   ──► rewrites res.cloudinary.com URLs (2 of ~25 images); local /images/*.webp are passed through unchanged
```

| Area | Verdict |
|---|---|
| Folder layout, `constants.ts`, `types.ts` at root | Fine for this size. Leave as is. |
| Routing + lazy loading | Fine, slightly more than needed. ErrorBoundary placement has one gap. |
| Data layer | **Over-built and fragile.** Two sources of truth, three patterns, no cache, no error UI. |
| Build scripts | Sitemap generator is OK; the JSON minifier does more harm than good. |
| Deploy config | `render.yaml` is good; `_redirects` is redundant on Render. |
| SEO | Proportionate in size, but per-page OG tags don't reach social crawlers (client-side SPA). |
| Images / Cloudinary | A cheap helper, but mostly unused. Trim it. |

---

## 3. Findings

Impact = how much the fix improves correctness, maintenance or performance. Effort = how much work it takes to fix.

### Data layer

**D1. Two runtime sources of truth for the same content (Sheets + fallback JSON).** Impact **High** · Effort **Med**
- `utils/fetchWithFallback.ts:5-19`, used at `pages/About.tsx:225-228`, `pages/Events.tsx:372`, `pages/Home.tsx:130,137`.
- `public/data/events.json`, `managingCommittee.json`, `committees.json`, `annualReports.json` and `pastPresidents.json` duplicate Sheet tabs and must be updated by hand. When Sheets fails (quota, bad key, missing env var at build, which `utils/googleSheets.ts:9-11` only logs), visitors silently get whatever the JSON last held. Commit `c29a2a0` ("source homepage events from Google Sheets so upcoming events show") suggests this drift has already caused a visible bug.
- The browser-side API key (`utils/googleSheets.ts:6,25`) also forces the CSP `connect-src https://sheets.googleapis.com` (`render.yaml:24`) and makes every visitor use up quota.
- **Recommendation (simplest single path):** add a `scripts/fetch-sheets.js` that runs before `vite build`, calls Sheets once per tab, applies the existing `convertValue`/`fetchCommittees` transforms, and writes `public/data/*.json`. Pages then use plain JSON only. If it fails, the build fails loudly instead of shipping stale data. Editors publish with a Render deploy hook, triggered by a button, an Apps Script on edit, or a daily cron. This deletes `fetchWithFallback.ts`, the runtime half of `googleSheets.ts`, the `VITE_*` keys in the bundle and the CSP exception.
- **If instant updates are a hard requirement:** keep the runtime fetch but (a) cache per tab in a module-level `Map<string, Promise>`, (b) use `values:batchGet` so About makes one request instead of four, and (c) hide the fallback inside one `getData('events')` function so pages don't wire both sources together.
- Ask the content owners how often Sheet data changes and how fast it must go live. That answer decides between the two options.

**D1 addendum: keep Google Sheets as the editing tool.** Sheets exists so non-technical association staff can edit the site like an Excel file. That goal is right and should stay. What changes is *when* the site reads the Sheet, not *where* people edit.

Recommended setup: **"edit the Sheet, click Publish"**
1. Editors change rows in the same Google Sheet as today.
2. A custom menu in the Sheet, **CVOCA → Publish website**, built from about 10 lines of Apps Script, calls the Render deploy hook URL (stored in Script Properties, not in the Sheet).
3. Render runs `npm run build`. A new `scripts/fetch-sheets.js` reads every tab with the existing transforms from `googleSheets.ts` and writes `public/data/*.json`, then `vite build` runs. The site is live in about 2 minutes.
4. If a row is malformed (bad date, missing title), the build fails, the **current site stays up**, and Render emails the developer. Today, bad data breaks the live page.
5. Safety net: a nightly Render cron job or Apps Script time trigger calls the same deploy hook, so forgotten clicks still go live by the next morning.

The editor experience is the same plus one click. The browser only reads static JSON: no API key, no quota, no fallback copies to keep in sync.

**Also move the JSON-only content into the Sheet:** home, membership, contact, socialMedia and digitalOutreach. Then everything an editor can change lives in one place, and the repo's `public/data/` becomes generated output (gitignored). Today outreach updates need a developer commit (`f02b98c`).

**Alternative if edits must appear instantly without a click:** keep the runtime fetch, but switch from the API key to **File → Share → Publish to web (CSV)** URLs. These need no key or quota and use the same editing experience. Generate the fallback JSON *automatically* at build time instead of editing it by hand, plus nightly redeploys. The trade-offs: two data paths remain, and bad data reaches visitors directly.

**Not recommended for this client:** a headless CMS (Decap, Tina, Sanity, Strapi), WordPress, or Notion as a backend. Each one is a new tool to learn, needs a login to manage, and often costs money. None of them beats a spreadsheet for tabular content like events, committees and past presidents.

**D2. Three different fetch patterns for one job.** Impact **Med** · Effort **Low**
- Plain JSON through `useFetch`: `pages/Home.tsx:120-125`, `pages/Membership.tsx:177`, `pages/Contact.tsx:46`, `pages/DigitalOutreach.tsx:324`.
- Sheets + fallback: see D1.
- Sheets with no JSON fallback, falling back to a *different* JSON field instead: `pages/Home.tsx:132-133` + `home.json` `presidentDefault` (`pages/Home.tsx:253,265`).
- Hand-written `useState`/`useEffect` instead of `useFetch`: `components/Footer.tsx:20-41`.
- **Recommendation:** after D1 there is one pattern: `useFetch(() => getJson('contact'))`. Move Footer onto it.

**D3. No error state anywhere, so a failed fetch means a spinner that never stops.** Impact **Med** · Effort **Low**
- `useFetch` returns `error` (`hooks/useFetch.ts:12,26`), but no caller reads it. `pages/Home.tsx:164`, `pages/Membership.tsx:181` and `pages/Contact.tsx:50` render `<LoadingSpinner />` while `!data`, so they spin forever on failure. Footer renders an empty box (`components/Footer.tsx:43-48`).
- This is made worse by the SPA rewrite (`render.yaml:34-37`, `public/_redirects:1`). A missing `/data/x.json` returns `index.html` with **HTTP 200**, so the `res.ok` checks in `fetchWithFallback.ts:14` and `Footer.tsx:33-34` pass, and then `res.json()` throws a `SyntaxError`.
- **Recommendation:** one shared `getJson(path)` that checks `res.ok` *and* `content-type`, plus a small "Couldn't load — retry" state that pages show when `error` is set.

**D4. No caching across navigation.** Impact **Med** (only while runtime Sheets is kept) · Effort **Low**
- `useFetch` refetches on every mount (`hooks/useFetch.ts:17-35`). Going Home → Events → Home makes 3 + 1 + 3 Sheets calls, and `events` is fetched by both Home and Events. Static JSON is mostly saved by the HTTP cache. Sheets calls are not.
- **Recommendation:** remove the problem with D1, or add a module-level promise cache inside `getData`. Don't add React Query or SWR; that would be over-engineering at this scale.

**D5. The Sheets layer is untyped, so every caller casts.** Impact **Low** · Effort **Low**
- `fetchSheetData` returns `Record<string, unknown>[]` (`utils/googleSheets.ts:23,51`), so callers use `as unknown as Promise<CvoEvent[]>` (`pages/Events.tsx:372`, `pages/Home.tsx:130,133,140`, `pages/About.tsx:229`). Type conversion depends on hard-coded field names (`utils/googleSheets.ts:73-106`), so adding a new numeric or date column means editing this function.
- **Recommendation:** after D1 the JSON is typed once at the `getJson<T>` boundary. If runtime Sheets stays, make the wrappers generic (`fetchSheetData<CvoEvent>('events')`).

**D6. Dead data.** Impact **Low** · Effort **Low**
- `public/data/blog.json` is never fetched (`pages/Blog.tsx` only links to `blog.cvoca.org`), and `BlogPost` (`types.ts:80`) and `NavLink` (`types.ts:48`, which collides by name with react-router's `NavLink` used in `Header.tsx:3`) are unused.

### Structure and routing

**S1. Flat folders, root `constants.ts` / `types.ts`: appropriate.** Impact — · Effort —
- 9 pages, 7 components, 2 hooks, 4 utils. Feature folders or an `src/` move would add churn without benefit. `constants.ts` (6 lines) is a good single home for site constants. Make it the *only* one (see B3/SEO2).

**S2. Lazy loading every route: harmless, marginal benefit.** Impact **Low** · Effort **Low**
- `App.tsx:11-19`. The page chunks are small (the biggest page is about 600 lines). Most of the JS is React and the router, which load anyway. So each navigation goes chunk → spinner → data → spinner (Suspense fallback, then each page's own spinner). This is acceptable to keep. Removing it would cut one network hop per navigation. Not worth changing on its own.

**S3. ErrorBoundary never resets after navigation.** Impact **Low** · Effort **Low**
- `App.tsx:61-75` wraps all routes in one boundary with no reset. After any render error, or a stale chunk 404 after a redeploy, every header link keeps showing "Something went wrong" until a full reload. **Fix:** key the boundary on `location.pathname`.

**S4. Theme handling causes a flash and ignores the OS preference.** Impact **Low** · Effort **Low**
- `App.tsx:30-40` reads `localStorage` during render and applies `.dark` in an effect, after first paint. `index.html` has no pre-paint script, so dark-mode users see a light flash on every load. `prefers-color-scheme` is never consulted, and the unguarded `localStorage` access throws in some private modes. **Fix:** a 3-line inline script in `index.html` `<head>`. Overlaps with the design review.

### Build and deploy pipeline

**B1. `scripts/minify-json.js` rewrites tracked source files in place.** Impact **Med** · Effort **Low**
- `scripts/minify-json.js:26` writes back into `public/data/`, and it runs on every `npm run build` (`package.json:8`). That's why every JSON file in git is one minified line. Content edits are hard to read, diffs are unreviewable, and a local build leaves the working tree dirty. The saving is tiny: 35 KB total, and Render serves it gzip/brotli, which removes whitespace anyway.
- **Recommendation:** delete the script and the `minify-json` npm script, and pretty-print the JSON once. If minification is ever wanted, do it into `dist/`, not into the source.

**B2. `public/_redirects` duplicates `render.yaml` routes.** Impact **Low** · Effort **Low**
- `public/_redirects:1` uses the Netlify/Cloudflare convention. Render applies the rewrite from `render.yaml:34-37` (or the dashboard). Keeping both suggests two places to edit. History shows confusion here (`268ac0b` / `879d8b4` revert). Confirm the Render service is Blueprint-managed, then delete `_redirects`.

**B3. `scripts/generate-sitemap.js`: fine, but it duplicates routes and BASE_URL.** Impact **Low** · Effort **Low**
- `scripts/generate-sitemap.js:9,12-21` copies `BASE_URL` (from `constants.ts:1`) and the route list (from `App.tsx:64-71`). `lastmod` is the build date for every page (`:23`), so it tells crawlers nothing useful. For 8 fixed URLs, a hand-written `public/sitemap.xml` without `lastmod`/`changefreq`/`priority` (Google ignores the last two) is simpler. Keeping the script is also acceptable. Either way, drop `lastmod`.

**B4. No type-check in the build; `tsconfig` is not strict.** Impact **Med** · Effort **Low**
- `vite build` strips types without checking them. `package.json:8` has no `tsc --noEmit`, and `tsconfig.json` has no `"strict": true`. Leftover template options remain: `experimentalDecorators`, `useDefineForClassFields`, `types: ["node"]` for browser code, `allowJs`, and an unused `@/*` path alias (`tsconfig.json:4-5,13-15,18,21-25`). Type errors can ship today.
- **Recommendation:** add `"typecheck": "tsc --noEmit"` and run it in `build`. Turn on `strict` (fix the fallout separately). Remove the unused options.

**B5. `render.yaml`: appropriate.** Impact — · Effort —
- Build, publish path, env vars, security headers and SPA rewrite in one file is the right amount. Header details (deprecated `X-XSS-Protection`, HSTS `preload`, CSP contents) are left to the security review. If D1 is adopted, the `VITE_GOOGLE_*` env vars become build-only secrets and are no longer shipped to browsers.

**B6. `vite.config.ts`: minimal and correct.** No action.

### SEO layer

**SEO1. Client-side meta tags don't reach social crawlers.** Impact **Med** · Effort **Med**
- `hooks/useSEO.ts:29-86` updates `<head>` after JS runs. Google renders JS, so titles and descriptions work for search. WhatsApp, LinkedIn, Facebook and X read only the raw `index.html` (`index.html:18-33`), so every shared link previews as the homepage. For an association whose members share event links on WhatsApp, this matters more than JSON-LD does.
- **Recommendation (proportionate):** pre-render the 8 static routes at build time (e.g. `vite-react-ssg` or a small Puppeteer/`react-dom/server` prerender step), or at minimum emit one HTML file per route with its own `<title>`/OG tags. Don't move to Next.js for this.
- Minor: `ogType: 'event'` (`pages/Events.tsx:365`, `useSEO.ts:9`) isn't a valid Open Graph type. `twitter:site` and the title format are hard-coded in two places (`useSEO.ts:31,57,75`).

**SEO2. JSON-LD is a bit more than needed, and it triplicates contact data.** Impact **Low** · Effort **Low**
- `utils/schema.ts` (170 lines) defines Organization (typed as `ProfessionalService`), WebSite, LocalBusiness, Event and Breadcrumb schemas. The address and phone appear in `schema.ts:24-36` **and** `schema.ts:78-87` **and** `public/data/contact.json`, plus the Contact page meta description (`pages/Contact.tsx:41`). `ProfessionalService` is already a `LocalBusiness`, so the Contact page emits the same entity twice. `numberOfEmployees` is used for *members* (`schema.ts:51-55`), which is semantically wrong.
- Event schemas are built from `filteredEvents` (`pages/Events.tsx:430`), so the structured data changes with the visitor's filter UI. Past events are marked `InStock`/`EventScheduled` (`schema.ts:142,145`). Also, JSON-LD injected by an SPA is only seen by Google's renderer.
- **Recommendation:** keep Organization + Event (the ones that can earn rich results). Drop the WebSite, LocalBusiness and Breadcrumb schemas (breadcrumbs on a one-level site add little). Read address and phone from one place. Build Event schema from upcoming events, not filtered ones. `SchemaMarkup.tsx` (27 lines) is fine as is.

**SEO3. `useSEO` itself is proportionate.** A single 89-line hook with no library (react-helmet etc.) is the right choice. Keep it. Just deduplicate the title logic, and pre-render if SEO1 is addressed.

### Images / Cloudinary

**I1. Cloudinary helper covers 2 of ~25 images; most of it is unused.** Impact **Low** · Effort **Low**
- Only 2 URLs in `public/data/digitalOutreach.json` are Cloudinary. Everything else is local `/images/**/*.webp` (640 KB total), which `getOptimizedImageUrl` returns unchanged (`utils/imageUtils.ts:33-35`). `isCloudinaryUrl` (exported), `ImageSizePresets.THUMBNAIL`/`HERO` and `getOptimizedImageUrlWithPreset` (`utils/imageUtils.ts:9,67,73,84-89`) are unused. `VITE_CLOUDINARY_CLOUD_NAME` is documented in `.env.example:14` and `README.md:118` but never read.
- The approach itself (string-inject `f_auto,q_auto,w_N`) is a cheap, sensible pattern *if* editors put Cloudinary URLs into Sheets as `docs/cloudinary-guide.md` describes. Decide whether that workflow is real.
- **Recommendation:** if editors use it, trim `imageUtils.ts` to `getOptimizedImageUrl` + the 3 presets in use, and remove the phantom env var. If they don't, delete the helper and the guide and keep committing WebP files. Local images get no responsive `srcset` either way, which is fine at 640 KB.

### Missing for a simple site

| Gap | Why | Effort |
|---|---|---|
| `tsc --noEmit` in build + `strict` (B4) | Catch type errors before deploy | Low |
| Error/retry state for data (D3) | No infinite spinners | Low |
| Pre-rendered HTML per route (SEO1) | Correct link previews on WhatsApp/LinkedIn | Med |
| Pre-paint theme script (S4) | No dark-mode flash | Low |
| Cache-Control for `/assets/*` (immutable) in `render.yaml` | Hashed assets can be cached forever; check what Render sets by default | Low |
| A one-paragraph "how content is published" section in README | Editors and devs need to know which source wins: Sheet vs JSON | Low |

Not missing (and shouldn't be added): a state library, a data-fetching library, a component library, a CMS, SSR, analytics frameworks, i18n, or a test suite beyond a smoke build.

---

## 4. Ranked delete / merge / simplify list

Ordered by value ÷ effort. Items 1–2 are the structural ones; the rest are quick cleanups.

| # | Action | Type | Impact | Effort | Refs |
|---|---|---|---|---|---|
| 1 | Keep Sheets as the editor; add a "Publish website" menu in the Sheet (Apps Script → Render deploy hook) plus a nightly redeploy; move Sheets fetch to build time (`scripts/fetch-sheets.js` → `public/data/*.json`); move the JSON-only content into the Sheet too; then delete `utils/fetchWithFallback.ts`, the runtime half of `utils/googleSheets.ts`, the `VITE_*` keys from the bundle, and the CSP `connect-src` entry. *Alternative if instant updates are required: a single cached `getData()` with `batchGet`.* | Simplify / Delete | High | Med | D1, D4, D5 |
| 2 | Merge all data loading into one `getJson<T>(name)` + `useFetch` pattern (Footer included) and render `error` | Merge | Med | Low | D2, D3 |
| 3 | Delete `scripts/minify-json.js` + npm script; pretty-print JSON once | Delete | Med | Low | B1 |
| 4 | Add `typecheck` to build, enable `strict`, remove template leftovers from `tsconfig.json` | Simplify | Med | Low | B4 |
| 5 | Delete `public/_redirects` (after confirming Render uses `render.yaml`) | Delete | Low | Low | B2 |
| 6 | Delete `public/data/blog.json`, `BlogPost`, `NavLink` types | Delete | Low | Low | D6 |
| 7 | Trim `utils/imageUtils.ts` to what's used, or delete it + `docs/cloudinary-guide.md` if the Cloudinary workflow isn't real; remove `VITE_CLOUDINARY_CLOUD_NAME` docs | Delete / Simplify | Low | Low | I1 |
| 8 | Cut JSON-LD to Organization + upcoming-Event; single source for address/phone | Simplify | Low | Low | SEO2 |
| 9 | Key `ErrorBoundary` on pathname; add pre-paint theme script | Simplify | Low | Low | S3, S4 |
| 10 | Replace the sitemap generator with a static file, or at least drop `lastmod`/`changefreq`/`priority` and import routes from one list | Simplify | Low | Low | B3 |
| 11 | Pre-render the 8 routes so per-page OG tags reach social crawlers | Add (gap) | Med | Med | SEO1 |
| — | Keep as is: folder layout, `constants.ts`, `types.ts`, `useSEO`, `SchemaMarkup`, `vite.config.ts`, `render.yaml`, lazy routes | Keep | — | — | S1, S2, SEO3, B5, B6 |

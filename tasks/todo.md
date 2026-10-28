# Batch D1: per-route link previews + self-hosted Inter

## Status: DONE (2026-10-28). Committed on `main` in three commits, not pushed. See Review below.

> **For agentic workers:** executed inline with superpowers:executing-plans; steps use `- [ ]` checkboxes.

**Goal:** Link previews (WhatsApp, LinkedIn, etc.) show each page's own title and description, and the site loads Inter from its own origin so the CSP can drop `'unsafe-inline'` scripts and Google Fonts.

**Architecture:** One data file, `seo/pages.json`, holds each static route's title, description, keywords and noindex flag. The pages (through `useSEO`), the sitemap script and the build all read it. A small Vite build plugin (`seo/routeHeads.ts`, wired in `vite.config.ts`) rewrites the built `dist/index.html` head with the `/` values, then writes `dist/<route>/index.html` for every other route with that route's title, description, canonical, `og:*` and `twitter:*`. Bodies are unchanged, so the SPA still boots. Inter comes from `@fontsource-variable/inter` (one variable woff2 per unicode subset, `font-display: swap`).

**Tech stack:** React 19, Vite 7, Tailwind 3, Vitest 4, Node `^20.19.0 || >=22.12.0`.

**Source:** session brief (Batch D1) and `tasks/review-architecture.md` SEO1, `tasks/review-security-performance.md` SEO1, P4, S3, PR1.
The previous contents of this file (the Batch C plan and its review) are preserved in git history at `7cd1942`.
Execution: inline on `main`, no worktree/branch/push; plan approval waived by the session that started this one.

---

## Global constraints
- Minimal, targeted changes. No page UI changes (D2 owns THEMES and UI components).
- No `any`, no `@ts-ignore`, no casts to silence errors.
- Every value inserted into HTML is escaped (`& < > " '`).
- `dist/index.html` gets **no** canonical or `og:url`: Render's SPA rewrite also serves it for unknown URLs (Batch B decision).
- A build must leave `git status` clean.
- CSP after this batch: `script-src 'self'`; `style-src 'self' 'unsafe-inline'`; `font-src 'self'`; everything else unchanged.

## Decisions (and why they differ from the brief's example)
- **Vite plugin instead of a separate Node script.** The brief suggested "a small Node script after `vite build`". A `writeBundle` plugin runs at the same point (after `dist/index.html` is written), but it's TypeScript, so it shares `pageTitle()` with `useSEO` instead of copying the title rule into JS. It is also typechecked and runs on every `vite build`.
- **Data in JSON.** `scripts/generate-sitemap.js` is plain Node and can't import TS on Node 20.19, so the route list and SEO text live in `seo/pages.json`. TS reads it through `seo/pages.ts`, which adds the types.
- **Render serving.** Render docs: "Render does not apply redirect or rewrite rules to a path if a resource exists at that path." A Render feature request (feedback.render.com, "Configurable trailing slashes") says `page1/index.html` is served at both `/page1` and `/page1/` with no redirect. Checked live on two Render static sites (`rndr-id` header): `jekyll.onrender.com/about` and `gatsby.onrender.com/page-2` both return 200 with the subpage's own `<title>`, no redirect, with or without the trailing slash. So `/about` serves `dist/about/index.html` before the `/* → /index.html` rewrite applies. `/about/` is also served, and its canonical points to `/about`. The CVOCA service itself can only be checked after a deploy (see Review).
- **`og:type`.** `'event'` isn't a valid Open Graph type (review SEO1). Since these tags now reach crawlers, Events uses the default `website` and `'event'` is removed from the union.
- **`<meta name="title">`** is non-standard and `useSEO` never updated it, so it went stale on navigation. Removed from `index.html`.
- **No font preload.** Vite hashes the woff2 file name, and the CSS that references it is already a render-blocking `<link>` in `<head>`, so a preload would need extra plugin code for little gain.

## Review focus
1. **Value with `&`, `"` or `<`** (e.g. "Chartered & Cost"): escaped in the generated head, raw in `useSEO` (`setAttribute` escapes itself). Test: `renderRouteHead` escapes.
2. **`index.html` template changes and a tag disappears**: the build must fail loudly, not ship a homepage head on `/events`. Test: missing tag throws.
3. **Client-side navigation after landing on `/events`**: `useSEO` must reuse the static canonical/`og:url` tags, not add second ones. Checked in the browser (count of `link[rel=canonical]` = 1).
4. **Unknown URL (`/does-not-exist`)**: still gets `dist/index.html` with no canonical, then NotFound sets noindex. Checked with curl.
5. **Privacy policy noindex**: its generated head must say `noindex, nofollow`. Test.

---

## Task 1: Shared SEO data + head generator (TDD)
**Files:** create `seo/pages.json`, `seo/pages.ts`, `seo/routeHeads.ts`, `tests/routeHeads.test.ts`; modify `vite.config.ts`, `scripts/generate-sitemap.js`.

**Interfaces (produces):**
- `seo/pages.json`: `{ "<route>": { "title": string, "description": string, "keywords"?: string, "noIndex"?: boolean } }`, keys in sitemap order: `/`, `/about`, `/membership`, `/events`, `/blog`, `/digital-outreach`, `/contact`, `/privacy-policy`. Text copied verbatim from each page's current `useSEO` call.
- `seo/pages.ts`: `type StaticRoute`, `interface PageSEO`, `PAGE_SEO: Record<StaticRoute, PageSEO>`, `pageTitle(title: string): string` (`'Home'` → `SITE_NAME`, else `` `${title} | CVOCA` ``), `routeSEO(route: StaticRoute)` → `PageSEO & { canonicalUrl }`.
- `seo/routeHeads.ts`: `escapeHtml(s: string): string`; `renderRouteHead(html: string, page: PageSEO, canonicalUrl?: string): string`; `routeHeadsPlugin(): Plugin`.

- [x] Write `tests/routeHeads.test.ts`: for `/events`, rendered from the real `index.html`, the output has exactly one each of `<title>Events | CVOCA</title>`, description, keywords, `robots index, follow`, `og:title`, `og:description`, `og:type website`, `og:url https://cvoca.org/events`, `canonical https://cvoca.org/events`, `twitter:title`, `twitter:description`; `escapeHtml('a & "b" <c>')` = `a &amp; &quot;b&quot; &lt;c&gt;`; a description with `"><script>` comes out escaped; `/privacy-policy` → `noindex, nofollow`; no canonical arg → no canonical/`og:url`; a template missing `og:title` throws; the body is untouched; every route in `PAGE_SEO` renders.
- [x] Run `npm test`: fails (module missing).
- [x] Implement. Each tag is replaced by one anchored regex; zero matches throws `Error("route heads: <tag> not found in index.html")`. Canonical and `og:url` are inserted before `</head>`. The plugin (`apply: 'build'`, `writeBundle`) reads `<outDir>/index.html`, rewrites it for `/` without a canonical, and writes `<outDir><route>/index.html` for the other routes.
- [x] Sitemap reads routes from `Object.keys` of `seo/pages.json` (fs + `JSON.parse`).
- [x] `npm test` and `npm run typecheck` pass.

## Task 2: Pages use the shared data
**Files:** `hooks/useSEO.ts`, the 8 static pages, `index.html`.
- [x] `useSEO` uses `pageTitle()` (one rule, no other change); drop `'event'` from `ogType`.
- [x] Each static page calls `useSEO(routeSEO('/x'))` and drops its now-unused `canonical` import. NotFound unchanged.
- [x] `index.html`: remove `<meta name="title">`; comment that the head values are replaced at build from `seo/pages.json`.
- [x] Build; inspect every `dist/<route>/index.html` head; `git status` clean.
- [x] Commit: `feat(seo): per-route head tags in built HTML for link previews`.

## Task 3: Self-host Inter, tighten CSP, privacy policy
**Files:** `package.json`/lock, `index.tsx`, `tailwind.config.js`, `index.html`, `render.yaml`, `docs/account-owner-setup-guide.md`, `pages/PrivacyPolicy.tsx`.
- [x] `npm i @fontsource-variable/inter`; `import '@fontsource-variable/inter';` in `index.tsx` (wght axis only); Tailwind `sans: ['"Inter Variable"', 'sans-serif']`.
- [x] Remove the Google Fonts preconnects, preload, `media="print" onload` link and `<noscript>` from `index.html`.
- [x] Check `dist/index.html` has no inline `<script>` without `src` and no `on*=` handler. Then the CSP in `render.yaml` and the setup guide: `script-src 'self'`, `style-src 'self' 'unsafe-inline'`, `font-src 'self'`.
- [x] Privacy policy: delete the Google Fonts `<li>`; `LAST_UPDATED` stays `'28 October 2026'` (already today's date).
- [x] Commit: `perf: self-host Inter and drop 'unsafe-inline' scripts and Google Fonts from the CSP`.

## Task 4: Verify
- [x] `npm run typecheck`, `npm test`, `npm run build`; `git status` clean.
- [x] `vite preview`: `curl /events` raw has the Events title and OG tags; `/does-not-exist` has the homepage head and no canonical.
- [x] Browser at 375 and 1440 px, light and dark: computed `font-family` is Inter Variable, `document.fonts` loaded; network shows local woff2 and no Google Fonts hosts; no overflow; console clean; navigating between routes updates title and canonical with one tag each.
- [x] Local server with the new CSP as a response header: no violations on any route, including the Maps embed on `/contact`.

## Task 5: Review and record
- [x] Fresh reviewer subagent on the full diff (superpowers:requesting-code-review); fix Critical and Important findings.
- [x] Fill in the Review section; commit `docs: record Batch D1 in tasks/todo.md`.

---

## Review

### What changed
- **Per-route link previews** (commit `cee63b0`).
  - New files:
    - `seo/pages.json` holds the SEO text for the 8 static routes, copied verbatim from the pages.
    - `seo/pages.ts` adds the types, `pageTitle()` and `routeSEO()`.
    - `seo/routeHeads.ts` has `escapeHtml`, `renderRouteHead` and the `writeBundle` Vite plugin.
    - `tests/routeHeads.test.ts` adds 22 tests.
  - Changed files:
    - `vite.config.ts` registers the plugin.
    - `scripts/generate-sitemap.js` reads its routes from the JSON. `public/sitemap.xml` is byte-identical.
    - `useSEO` uses `pageTitle()`, and `'event'` is dropped from `ogType`.
    - The 8 pages call `useSEO(routeSEO('/x'))`.
    - `index.html` loses `<meta name="title">` and gains a comment.
  - Build output: `dist/<route>/index.html` for the 7 non-root routes. `dist/index.html` gets the `/` values and no canonical.
- **Self-hosted Inter and a stricter CSP** (commit `50fcd6f`).
  - Inter now comes from `@fontsource-variable/inter@^5.3.0`: weight axis 100–900, `font-display: swap`, 7 unicode-range subsets. The browser downloads only `inter-latin` on this site.
  - Tailwind `sans` is now `"Inter Variable"`.
  - All Google Fonts tags are removed from `index.html`.
  - The CSP in `render.yaml` and in the setup guide is now `script-src 'self'`, `style-src 'self' 'unsafe-inline'` and `font-src 'self'`.
  - The privacy policy no longer lists Google Fonts. `LAST_UPDATED` stays at 28 October 2026, which is already today.
- Docs: no README or other doc mentioned Google Fonts, apart from the setup guide's CSP line. `DESIGN.md` still says "Inter", which is still true.

### Deviations (rulings)
- **Vite `writeBundle` plugin instead of a separate post-build Node script.** It runs at the same point and is TypeScript, so it shares `pageTitle()` with `useSEO` and is typechecked. If this is wrong, it costs moving about 20 lines into a script.
- **SEO data is in JSON, not a TS module.** The Node sitemap script can't import TS on Node 20.19.
- **`og:type 'event'` removed and `<meta name="title">` removed.** These tags now reach crawlers, so invalid or stale values would ship.
- **No font preload.** The woff2 file name is hashed, and the CSS that loads it is already render-blocking in `<head>`.
- **Unused font subsets are kept** (the package's default `index.css`). Browsers don't download them, and trimming them would need per-subset imports.

### Verification
- `npm run typecheck` exit 0. `npm test` 63/63 (41 before, plus 22 new). `npm run build` exit 0 and logs "Wrote per-route head tags for 8 routes". `git status` is clean after the build.
- TDD: `tests/routeHeads.test.ts` failed first because the module was missing, then passed.
- Every `dist/<route>/index.html` head was inspected:
  - Each has the right title, description, keywords, robots, `og:*`, `twitter:*` and canonical, and `&` is escaped.
  - Privacy has `noindex, nofollow` and no keywords.
  - Bodies are byte-identical to `dist/index.html`.
- `vite preview` (Vite's own convention) serves `dist/events/index.html` only at `/events/`, and `/events` at `events.html`. So the raw-fetch checks used a Render-like server (scratchpad). That server serves a file or `<dir>/index.html` if one exists, otherwise falls back to `/index.html`, and sends the `render.yaml` CSP as a header.
  - `curl` on all 8 routes returned each route's own head.
  - `/does-not-exist` got the home head with no canonical.
- Built-in browser on the Render-like server:
  - **375 px light and dark, and 1440 px light and dark:** computed `font-family` is `"Inter Variable", sans-serif` and `document.fonts.check` is true. The only font request is `/assets/inter-latin-wght-normal-*.woff2`, with zero requests to Google Fonts hosts. Horizontal overflow is 0 on every route.
  - **Client-side navigation across all 8 routes plus a 404:** title, canonical, `og:url` and robots updated each time, with exactly one canonical and no duplicate meta tags.
  - **CSP:** full loads of all 9 URLs showed no violations, and the Maps embed on `/contact` renders. Control check: an injected inline script and an inline `onerror` handler were both blocked and reported, so the console capture does catch violations.
  - **Not covered locally:** the Sheets API request under `connect-src`, because there are no Sheets env vars locally. That directive is unchanged.
- Code review: a fresh reviewer subagent (Opus) read the full diff and built the project in a temporary worktree. Verdict: ready to merge. No Critical or Important findings, and all 5 review-focus items pass.

### Deferred minors (from review)
- `routeHeadsPlugin().writeBundle` file writing has no unit test. Every build exercises it, and it was inspected by hand.
- No test for the "tag appears twice" branch of `replaceTag`. The missing-tag branch is tested.
- The build-note HTML comment in `index.html` ships in `dist/`. It's harmless.
- Carried over from before this batch, not changed: client-side keywords go stale when navigating to a page without keywords; `/privacy-policy` is in the sitemap but noindex; unknown URLs carry a static `index, follow` until NotFound's JS sets noindex.

### Left to do
Everything that needs the client's Render or Google access is collected in `docs/account-owner-setup-guide.md`, so it can all be done in one session:
- **Part C:** response headers (CSP Report-Only, then enforced after a week; HSTS; `Cache-Control`; etc.) and the build command.
- **Part D (new):** post-deploy checks of the per-route files and link previews (D1); removing the `/* → /index.html` rewrite so unknown URLs return a real 404 (D2–D3).

Developer prerequisites before Part D (not done in this batch):
- The build must ship a `dist/404.html` page. Render staff on the community forum say a static site serves `/404.html` for paths that match no file and no rule. Don't remove the rewrite until it exists.
- Remove the `routes:` catch-all rewrite from `render.yaml` at the same time, so linking the Blueprint later doesn't bring it back.

Not account work: **D2** (DigitalOutreach THEMES and the remaining UI components) is a separate session.

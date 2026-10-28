# Batch B: privacy, SEO and config fixes

## Status: DONE (2026-10-28). Tasks 1–8 committed on `main` in one commit, not pushed. See Review below.

Source: the Batch B items of the pending-items summary, from `tasks/review-security-performance.md` (PR1, SEO1–4, S2/S3 notes, P5, OPS2), `tasks/review-architecture.md` (S3, S4, SEO2, B3) and `tasks/review-design.md` §5 App shell.
The previous contents of this file (the Batch A plan and its review) are preserved in git history at `3fe727d`.
Execution: inline (superpowers:executing-plans) on `main`, as the user asked; plan approval was waived by the user.

---

## Global constraints
- Minimal, targeted changes only. No refactors outside the files each task names.
- No new runtime dependencies. The share image is produced once with local tooling and committed as a static file.
- Colours from DESIGN.md / `tailwind.config.js` tokens: light `theme-color` = primary `#2563eb`, dark = `background.dark` `#0f172a`.
- Out of scope: Batches C and D (dead code incl. `_redirects`, docs, tooling, prerendering, font self-hosting, THEMES), content questions, anything needing client Google/Render access.
- No test runner exists, so each task is verified with `npm run typecheck`, `npm run build` and the built-in browser.

## Review focus (failure modes no single task exercises)
1. **Theme with storage blocked** (private mode, `localStorage` throws): the page must still render, follow the OS setting, and the toggle must still work for the session.
2. **OS dark + nothing stored:** first paint dark, and the choice is *not* written to storage until the user toggles (so a later OS change still applies).
3. **Sheets not configured** (local dev, preview builds): no request to `…/undefined/…`, no red console errors, JSON fallback shown.
4. **Events with no upcoming events** (today's fallback data): no Event JSON-LD at all, rather than past events marked as scheduled.
5. **A render error, then navigation:** the next route renders normally without a full reload.

---

## Task 1: Privacy policy rewrite
**Files:** `pages/PrivacyPolicy.tsx`
- [x] Replace the body copy with short, accurate sections, keeping `PageHero tone="light"` and the local `Section`:
  - Intro: no forms, accounts, cookies, analytics or tracking on this site.
  - 1. What this website stores: only `localStorage['theme']` on the visitor's device, never sent to CVOCA.
  - 2. Services the site uses, and why: Render + Cloudflare (hosting, server logs), Google Fonts, Google Sheets API (site content), Google Maps embed on /contact (may set cookies), Cloudinary and Unsplash (images).
  - 3. Registration, payments and messaging: Razorpay, Google Forms, WhatsApp; what you enter there is handled under their terms and passed to CVOCA to run the membership or event. Keep the existing "we do not sell" statement.
  - 4. Your choices and rights: browser controls; contact CVOCA to access/correct/delete registration data it holds.
  - 5. Contact: `info@cvoca.org` (mailto link) and the office address. Then a short "Changes to this page" note.
- [x] "Last updated: 28 October 2026" as a fixed string (constant `LAST_UPDATED`), replacing `new Date()`.
- [x] Lists use `list-disc pl-5` (hanging indent) instead of `list-inside ml-4`.
- [x] SEO description updated to match the new copy.

## Task 2: `index.html` meta and share image
**Files:** `index.html`, `constants.ts`, new `public/images/og-share.jpg`
- [x] Remove `<link rel="canonical">`, `og:url` and `twitter:url` (all hard-coded to the homepage). `useSEO` already sets canonical and `og:url` on every route (NotFound uses `window.location.href`).
- [x] `theme-color`: two tags, `#2563eb` with `media="(prefers-color-scheme: light)"` and `#0f172a` with `media="(prefers-color-scheme: dark)"`.
- [x] Generate a 1200×630 JPG (logo-dark-theme on a `#0f172a` background with primary/secondary glow, name and "Mumbai · since 1973") with a one-off script in the scratchpad (WPF via PowerShell, which can decode WebP through WIC). Commit only the JPG.
- [x] `og:image` and `twitter:image` → `https://cvoca.org/images/og-share.jpg`; add `og:image:width` 1200, `og:image:height` 630, `og:image:alt`, `twitter:image:alt`. `constants.ts` `DEFAULT_OG_IMAGE` → `/images/og-share.jpg`.

## Task 3: Theme before first paint
**Files:** new `public/theme-init.js`, `index.html`, `App.tsx`
- [x] `public/theme-init.js` (IIFE, ES5, in try/catch): stored `'dark'|'light'` wins, otherwise `matchMedia('(prefers-color-scheme: dark)')`; toggles `dark` on `<html>`.
- [x] `index.html`: `<script src="/theme-init.js"></script>` in `<head>` before the stylesheets (external and blocking, so a future CSP can drop `'unsafe-inline'`).
- [x] `App.tsx`: initial state = `document.documentElement.classList.contains('dark') ? 'dark' : 'light'` (one source of truth: the script). The effect only syncs the class. `toggleTheme` writes `localStorage` inside try/catch, so an untouched visitor keeps following the OS.

## Task 4: App shell
**Files:** `App.tsx`
- [x] Add a `RouteErrorBoundary` (same pattern as `ScrollToTop`) that renders `<ErrorBoundary key={pathname}>`, so navigating clears an error.
- [x] `<main id="main-content" tabIndex={-1} className="flex-grow focus:outline-none">`.

## Task 5: Structured data
**Files:** `utils/schema.ts`, `pages/Events.tsx`, `pages/Contact.tsx`
- [x] Remove `numberOfEmployees` from the Organization schema.
- [x] Remove `getLocalBusinessSchema` (and with it `priceRange`); Contact emits only the breadcrumb. The global Organization schema (`ProfessionalService`, a LocalBusiness subtype, with the same address, phone and hours) is already on every page, so /contact no longer describes the entity twice.
- [x] `getEventSchema`: relative `imageUrl` → absolute (`${BASE_URL}${path}`).
- [x] Events: build `eventSchemas` from an `upcomingEvents` memo (date ≥ today, soonest first, max 10), independent of the filters, so past events are never marked `EventScheduled`/`InStock`.

## Task 6: Sitemap and `render.yaml`
**Files:** `scripts/generate-sitemap.js`, `public/sitemap.xml`, `render.yaml`
- [x] Sitemap: routes become a plain path list; output only `<loc>`. Regenerate and commit `public/sitemap.xml`.
- [x] `render.yaml`: `env: static` → `runtime: static`. (`X-XSS-Protection` is already absent and HSTS already has no `preload`, from the quick-wins work; leave HSTS as `max-age=31536000`.)

## Task 7: Sheets timeout and missing config
**Files:** `utils/googleSheets.ts`, `utils/fetchWithFallback.ts`
- [x] `export class SheetsNotConfiguredError extends Error`. When `VITE_GOOGLE_SHEETS_API_KEY` or `VITE_GOOGLE_SHEET_ID` is missing: one `console.warn` at module load in dev only (replacing the `console.error`), and `fetchSheetData` throws `SheetsNotConfiguredError` before any request.
- [x] `fetch(url, { signal: AbortSignal.timeout(5000) })`.
- [x] `fetchWithFallback`: skip its `console.error` when the error is a `SheetsNotConfiguredError` (quiet fallback); other failures still log.

## Task 8: Verify, review, document, commit
- [x] `npm run typecheck` and `npm run build` pass; `git status` shows no build-generated changes (sitemap stable).
- [x] Browser (dev server): every route at 375 and 1440 px, light and dark: no overflow, no console errors (no Sheets 400s now).
- [x] Theme: storage cleared + emulated OS dark/light → correct first paint with no flash; toggle persists; reload keeps choice.
- [x] `<head>` on each route: canonical and `og:url` = that route, `og:image` = share image.
- [x] JSON-LD on /, /events, /contact read from the DOM.
- [x] Skip link moves focus to `<main>`.
- [x] ErrorBoundary: temporary forced throw on one route, navigate away, confirm recovery, then revert.
- [x] Fresh-reviewer code review of the full diff (superpowers:requesting-code-review); fix findings.
- [x] Fill in the Review section; commit on `main` (not pushed, `.claude/` excluded).

---

## Review

### What changed
- **Privacy policy:** rewritten as six short sections that match what the site does. No forms, accounts, cookies or analytics; the only storage is `localStorage['theme']`. It names the services the site really uses (Render/Cloudflare, Google Fonts, Google Sheets, the Google Maps embed, Cloudinary/Unsplash) and the external registration and payment destinations (Razorpay, Google Forms, WhatsApp, plus Drive, blog and social links). Fixed "Last updated: 28 October 2026" (`LAST_UPDATED` constant). The contact is `info@cvoca.org` as a mailto link. Lists use a hanging indent.
- **`index.html`:** the homepage-only `canonical`, `og:url` and `twitter:url` are gone (`useSEO` sets canonical and `og:url` per route). `theme-color` is `#2563eb` (light) and `#0f172a` (dark) with media queries. New share image `public/images/og-share.jpg` (1200×630, 48 KB: logo, name and "Mumbai · Since 1973" on the brand dark background), with `og:image:width/height/alt` and `twitter:image:alt`. `DEFAULT_OG_IMAGE` points at it.
- **Theme:** `public/theme-init.js`, a blocking external script in `<head>`, applies a saved choice or else the OS setting before first paint. `App.tsx` takes its initial state from `<html class>`, and only an explicit toggle writes `localStorage` (inside try/catch). So untouched visitors keep following the OS, and blocked storage doesn't break the page.
- **App shell:** `RouteErrorBoundary` keys `ErrorBoundary` on the pathname, so navigating away clears an error. `<main tabIndex={-1}>` with `focus:outline-none` (a transparent outline) means the skip link moves focus.
- **Structured data:** removed `numberOfEmployees` and the whole `getLocalBusinessSchema` (with `priceRange`). /contact now emits only the breadcrumb, because the global Organization (`ProfessionalService`) already carries the address, phone and hours. Event JSON-LD comes from the next 10 upcoming events, whatever the visitor's filters, so past events are never marked scheduled. Relative event images become absolute URLs.
- **Sitemap:** only `<loc>` per URL. `public/sitemap.xml` is regenerated and now identical after every build.
- **`render.yaml`:** `env: static` → `runtime: static`.
- **Sheets:** when the env vars are missing, `fetchSheetData` throws `SheetsNotConfiguredError` before any request; there's one dev-only `console.warn`, and `fetchWithFallback` falls back without logging. Requests time out after 5 s (`AbortSignal.timeout`), so a hanging request falls back to the JSON.

### Rulings (deviations from the plan)
1. **`render.yaml` headers already done.** `X-XSS-Protection` was already absent and HSTS already had no `preload` (quick-wins work), so only `runtime: static` changed. HSTS stays `max-age=31536000` without `includeSubDomains`, as the security review advised starting out. Cost if wrong: one header value.
2. **Contact duplicate entity: emit one** (delete LocalBusiness) rather than share an `@id`. It is simpler and also removes `priceRange`. Cost if wrong: re-add one small schema.
3. **Share image made with a browser canvas**, not PowerShell/WPF: the PowerShell route was blocked (it needed an execution-policy bypass). The canvas drew the real logo with the site's Inter font. A one-shot local Node receiver in the scratchpad saved the bytes. Only the JPG is committed.
4. **`twitter:url` removed too** (not named in the brief): it was the same homepage-only URL as `og:url`.
5. **Policy footer heading `h3` → `h2`:** after Batch A it was an `h3` with no `h2` of its own, and it is a section sibling.
6. **Final review by a fresh reviewer subagent** (Opus): no Critical or Important findings. The four Minors are deferred below.

### Verification
- `npm run typecheck` and `npm run build` pass; a build leaves `git status` unchanged (the sitemap is stable).
- Browser (dev server), all 9 routes × 375/1440 px × light/dark (36 loads): no horizontal overflow, the right theme class, exactly one `h1`.
- `<head>` per route: canonical and `og:url` = that route (404 = its own URL), `og:image` = the share image, no `twitter:url`.
- JSON-LD: / = Organization + WebSite (no `numberOfEmployees`). /contact = Organization + WebSite + Breadcrumb (no LocalBusiness). /events with today's fallback data = no Event entries. With three fallback events temporarily future-dated (then reverted with `git checkout`): 3 Events, soonest first, `/images/...` made absolute, and unchanged after switching the filter to Past.
- Theme: OS dark + nothing stored → dark, storage still empty. Toggle → light saved, and it persists across a reload over OS dark. OS light + cleared → light. `theme-init.js` was checked in Node with mocks, including throwing `localStorage` (6 cases).
- Skip link: Tab → "Skip to main content", Enter → focus on `<main>`, outline transparent.
- ErrorBoundary: temporary throw on `/blog?boom`, then header link to Events → Events renders (throw reverted with `git checkout`).
- Console: no errors on any route and no requests to `sheets.googleapis.com` (no env vars locally); one dev warning per load.
- Privacy page read at 375 px in dark: lists indent correctly, and the link is readable.
- **Not verified:** the 5 s timeout firing on a real hanging Sheets request (no key locally; checked by reading the code). The no-flash first paint was checked by the script order in `dist/index.html` and the dark spinner screenshot, not on a throttled production preview.

### Deferred minors (from the final review)
- `theme-color` follows only the OS, not the in-site toggle (a two-line update in App.tsx's theme effect).
- Event dates (`YYYY-MM-DD`) are parsed as UTC in both the filter and the new schema memo. Harmless in IST; fix both together with a local-date parser.
- The ErrorBoundary copy still says only "refresh the page", though navigating away now also recovers.
- `og:image:alt` is static in `index.html`; `useSEO` doesn't update it if a page ever passes its own `ogImage` (none does today).

### For the client to confirm
- Privacy contact `info@cvoca.org` (the old policy said `president@cvoca.org`).
- The privacy statement that registration details are shared with CVOCA only to run the membership or event, and never sold.
- The share image design (logo, full name, "Mumbai · Since 1973").
- `render.yaml` still isn't live until the account owner links the Render Blueprint or copies the headers into the dashboard (`docs/account-owner-setup-guide.md`, Part C).

### What's left
- Batches C (dead code incl. `_redirects`, docs, tooling) and D (prerendering, self-hosted font, THEMES, leftover components).
- The deferred minors above.

# Quick Wins — Post-Review Fixes

## Status: COMPLETED (2026-10-25). See the Review section at the end.

Source: the four read-only reviews in `tasks/` (2026-10-25):
`review-architecture.md`, `review-maintainability.md`, `review-design.md`, `review-security-performance.md`.

> The previous contents of this file (the completed 2025 SEO implementation log) are preserved in git history at `f02b98c`.

---

## Scope

Small, low-risk fixes only. Each phase is one commit. Phases are ordered so the safety net (type checking) lands first.

**In scope:** CLS fix, mobile menu, About tab overflow, React types + typecheck, `minify-json`, fetch error states, small bugs, `npm audit`.

**Out of scope (separate later plans):**
- Build-time Google Sheets → JSON, plus the "Publish website" menu in the Sheet (`review-architecture.md` D1).
- Shared UI components built from `DESIGN.md` tokens (`review-design.md` §6–8).
- Also deferred: `strict: true`, ESLint/Vitest/CI, contrast and heading sweeps, prerendering, privacy policy rewrite, and the Render header/caching settings (those are dashboard changes for the site owner).

---

## Phase 1 — React types + typecheck (safety net)

Why: `@types/react` isn't installed, so React is `any` and nothing is type-checked. `vite build` never runs `tsc`.

- [x] `npm i -D @types/react@^19 @types/react-dom@^19`
- [x] `tsconfig.json`:
  - Remove `experimentalDecorators` and `useDefineForClassFields: false`. They're unused, and they cause the 3 `ErrorBoundary` errors.
  - Add `"include": ["**/*.ts", "**/*.tsx"]` and `"exclude": ["node_modules", "dist", "scripts"]`.
  - Leave `strict` off; it's a later plan.
- [x] `package.json`: add `"typecheck": "tsc --noEmit"` and prefix `build` with `tsc --noEmit &&`.
- [x] Run `npm run typecheck` and fix the real errors that come up. Keep fixes to type annotations only, with no behaviour changes. List anything non-trivial in the Review section.
- [x] Verify: `npm run typecheck` passes and `npm run build` passes.

## Phase 2 — Stop `minify-json` rewriting source files

Why: `scripts/minify-json.js:26` writes back into `public/data/`, so every tracked JSON file is one unreadable line and every build dirties the working tree. The saving is negligible, because Render already serves brotli.

- [x] Remove `node scripts/minify-json.js &&` from `build` and remove the `minify-json` script (`package.json:8,10`).
- [x] Delete `scripts/minify-json.js`.
- [x] Pretty-print the 11 `public/data/*.json` files with 2-space indents. Formatting only, no content changes. Make this a separate commit so the diff is easy to skip.
- [x] Verify: each file parses (`node -e "JSON.parse(...)"`), `npm run build` leaves `git status` clean except `public/sitemap.xml`, and the site renders the same data.

## Phase 3 — Dependency security (`npm audit`)

Why: there are 13 advisories (9 high), all in dev/build tooling (vite, rollup, source-map-js). `react-router-dom` < 7.17.1 also has advisories. Render runs `npm install`, which ignores the lockfile.

- [x] Run `npm audit fix`, staying within the current ranges (no `--force`).
- [x] Run `npm update react-router-dom react react-dom` (still 7.x and 19.x).
- [x] `render.yaml:6`: change `npm install && npm run build` to `npm ci && npm run build`.
- [x] Verify: `npm audit` shows 0 high, `npm run build` passes, and dev-server navigation between all routes still works.

## Phase 4 — CLS fix (mobile Lighthouse 46–61, CLS 0.65)

Why: the Suspense fallback and the page-level spinners are only `min-h-[400px]`. On a phone the footer renders in the first viewport and then gets pushed down about 6,000 px.

- [x] `components/LoadingSpinner.tsx`: add an optional `fullPage` prop that uses `min-h-screen` instead of `min-h-[400px]`.
- [x] Use `<LoadingSpinner fullPage />` in the 4 places that replace a whole page:
  - The `App.tsx:62` Suspense fallback
  - `pages/Home.tsx:165`
  - `pages/Contact.tsx:51`
  - `pages/Membership.tsx:182`
- [x] Leave the in-section spinners as they are: About tab (`:235`), Events list (`:473`) and DigitalOutreach (`:353`).
- [x] Also add `role="status"` and sr-only "Loading…" text to the spinner (one line, `review-design.md` §5).
- [x] Verify: Lighthouse mobile on the local preview (`npm run build && npm run preview`) for `/`, `/about` and `/membership`. Target CLS ≤ 0.1. Record before and after numbers.

## Phase 5 — Mobile menu (invisible close button)

Why: on dark-hero pages at the top of the page, the open menu's white overlay makes the CVOCA wordmark, the logo and the close X white on white (`review-design.md` screenshot 01).

All changes are in `components/Header.tsx`:
- [x] Treat `isOpen` like `scrolled` when choosing colours: `textColorClass` (`:117`) and the toggle button classes (`:148`) use the light-background variant when the menu is open.
- [x] Toggle button:
  - Add `aria-expanded={isOpen}` and `aria-controls="mobile-menu"`.
  - Use a state-aware `aria-label` ("Open menu" / "Close menu").
  - Add `id="mobile-menu"` to the overlay.
- [x] Close the menu when `location.pathname` changes (`useEffect`), and on the Escape key.
- [x] Wrap the overlay links in `<nav aria-label="Main">`.
- [x] Not included: a focus trap. It belongs with the shared `Modal` primitive in the components plan.
- [x] Verify at 375 px in light and dark mode on `/` (dark hero) and `/privacy-policy` (light hero):
  - The wordmark and the X are visible with the menu open.
  - Escape closes the menu.
  - Browser back closes the menu.
  - The desktop header is unchanged at 1440 px.

## Phase 6 — About tab bar overflow at 375 px

Why: the 3 tabs need 403 px (`px-6` plus `scale-105` on the active tab), so the page scrolls sideways (`review-design.md` screenshot 02).

- [x] `pages/About.tsx:16` `TabButton`: `px-3 sm:px-6 text-xs sm:text-sm`, and drop `scale-105`. The active state already has `bg-primary` and a shadow.
- [x] `pages/About.tsx:590` `<nav>`: `space-x-1 sm:space-x-2`, and add `role="tablist"`. `TabButton` gets `role="tab"` and `aria-selected={active}`.
- [x] Verify there's no horizontal scroll at 320, 375 and 768 px (`document.documentElement.scrollWidth <= innerWidth`) and that the labels stay on one line.

## Phase 7 — Fetch error states

Why: no page reads `useFetch().error`.
- Home, Contact and Membership spin forever when their data fails to load.
- Events wrongly says "no upcoming events".
- The Footer disappears entirely.
- Plain `fetch().then(r => r.json())` skips `res.ok`, and the SPA rewrite returns `index.html` with a 200 status for a missing file.

- [x] New `utils/fetchJson.ts`: `fetchJson<T>(path)`. It checks `res.ok` and that the `content-type` includes `json`, and otherwise throws a clear `Error`.
- [x] Use it in the 5 plain fetches: `Home.tsx:121,124`, `Contact.tsx:47`, `Membership.tsx:178`, `DigitalOutreach.tsx:325`. Also use it in the `fetchWithFallback.ts:13-17` fallback path.
- [x] New `components/LoadError.tsx`: a short "Couldn't load this content" message with a "Try again" button that reloads the page. Keep it small, with existing classes only.
- [x] Read `error` and render `<LoadError />` in:
  - Home (`homeData`)
  - Contact
  - Membership
  - Events (instead of the empty "no events" state)
  - DigitalOutreach
  - About (tab area and reports)
- [x] `components/Footer.tsx`:
  - Always render the static parts: logo, blurb, Quick Links and the copyright row.
  - Gate only the social icons and the contact info on their data.
  - Load the data with `fetchJson`. Keep the existing `useState`/`useEffect` shape so the change stays small.
- [x] Verify: block `/data/home.json`, `/data/contact.json` and `/data/events.json` one at a time in the browser (request blocking), or rename the file temporarily.
  - The error message shows instead of a spinner.
  - The Footer links stay visible.
  - Normal loading is unchanged.

## Phase 8 — Small bugs

- [x] **Past Presidents Sr. No. breaks on fallback.** `srNo` is only added in `fetchPastPresidents` (`utils/googleSheets.ts:135-138`), not in the JSON fallback. In `pages/About.tsx`, after loading, number the rows with `srNo: p.srNo ?? index + 1`. Then remove the numbering from `fetchPastPresidents` so it lives in one place.
- [x] **Outreach phone CTA uses the wrong contact.** `pages/DigitalOutreach.tsx:294-304` finds the matching phone contact but renders `contacts[0]`. Store the found contact and use its `contact` and `label`.
- [x] **NotFound title shows "CVOCA" twice.** `pages/NotFound.tsx:7`: change `'Page Not Found - CVOCA'` to `'Page Not Found'`. `useSEO` already appends the site name.
- [x] **Events filter defaults.** `pages/Events.tsx:431,434`: `clearFilters` resets `timeFilter` to `'upcoming'`, and `hasActiveFilters` compares against `'upcoming'`, so "Clear" no longer shows on first load.
- [x] **Events hero title.** `pages/Events.tsx:466`: show "Upcoming Events", "Past Events" or "All Events" to match `timeFilter`.
- [x] **Committee role typo drops a member without warning.** `utils/googleSheets.ts:168-187`: add `default: console.warn(...)` naming the unknown role and member.
- [x] Verify each fix on the dev server. For Sr. No., unset `VITE_GOOGLE_SHEETS_API_KEY` locally to force the JSON fallback and check the column shows 1..N and sorts.

## Phase 9 — Final verification and review

- [x] `npm run typecheck`, `npm run build` and `npm audit` all pass.
- [x] Browser pass on every route at 375 px and 1440 px, in light and dark mode. No console errors.
- [x] Lighthouse mobile before/after table for `/`, `/about` and `/membership`.
- [x] Fill in the Review section below.

---

## Review

All 8 fix phases landed as separate commits on `claude/early-website-review-b04e34`. Phase 2 has two: the script removal, and the JSON formatting on its own. Nothing is pushed.

| Phase | Commit | Result |
|---|---|---|
| 1 Types + typecheck | `bc1f5a6` | `@types/react` and `@types/react-dom` added; `tsc --noEmit` runs first in `build`. It surfaced one real error (`EventData.id` was `string`, while `CvoEvent.id` is a `number`), which is now fixed. |
| 2 minify-json | `b41a2cd`, `d4b2e12` | Script deleted. The 11 data files are pretty-printed, and each was verified to parse to identical data. A build now changes only `public/sitemap.xml`. |
| 3 Dependencies | `b474540` | vite 7.3.7, react 19.3.1, react-router-dom 7.18.4; 0 high advisories. Render now runs `npm ci`. |
| 4 CLS | `cb651af` | `LoadingSpinner fullPage` is used in the 4 whole-page spots. The spinner also gets `role=status`. |
| 5 Mobile menu | `5117645` | Logo and close X visible while the menu is open. `aria-expanded`/`aria-controls` added. The menu closes on route change, Escape, and resize past `lg`. |
| 6 About tabs | `8f6a86c` | No overflow at 320, 375 or 768 px. Tabs get tablist/tab roles. |
| 7 Error states | `43abddf` | New `fetchJson` and `LoadError`, used on 6 pages. The Footer always shows its static links. |
| 8 Small bugs | `1d5005c` | Sr. No. fallback, phone CTA contact, 404 title, Events Clear/default and hero title, committee-role warning. |

**Lighthouse, mobile, local `vite preview`:**

| Page | Before (perf / CLS) | After (perf / CLS) | After a11y |
|---|---|---|---|
| `/` | 70 / 0.653 | 94 / 0.000 | 94 |
| `/about` | 72 / 0.653 | 95 / 0.000 | 88 |
| `/membership` | 68 / 0.653 | 92 / 0.000 | 94 |
| `/events` | 80 / 0.407 | 95 / 0.000 | 100 |

Local scores run higher than the live site, which has real network latency (the live site scored 46–61 in the security review). The CLS fix is what carries over.

**Final checks:**
- `npm run typecheck` and `npm run build` pass.
- `npm audit` shows 0 high.
- All 9 routes checked at 375 px and 1440 px, in light and dark mode: no horizontal overflow, no stuck spinners or error states.
- The only console errors are the expected Sheets 400s, because there is no API key locally, so every page runs on the JSON fallback.

### Deviations from the plan
- **Phase 6:** the plan said labels would stay on one line. At 320 px they can't fit on one line even with smaller padding (about 410 px is needed). Below `sm` the tabs now share the full width and labels wrap onto two lines (48 px tap targets). Tablet and desktop are unchanged.
- **Phase 5:** also closes the menu when the viewport grows past `lg`. Without that, the desktop nav could be left with dark text over the dark hero.
- **Phase 8:** the empty-state "Clear all filters" button now shows only when a filter is active. After the Clear fix, it would otherwise have done nothing.
- **Phase 7:** About keeps the all-or-nothing `Promise.all`, so if one dataset fails the whole tab area shows the error. Splitting it was not in scope.

### Known limitations, not fixed here
- **Header contrast on full-page states.** On dark-hero routes, the full-page spinner and the full-page error sit on a light background while the header still uses white text, so the wordmark and menu icon are hard to see. This was already true for the spinner before this work. The root cause is the hard-coded `darkHeroPaths` list in `Header.tsx`. It belongs to the shared-components plan, where `PageHero` reports its own tone.
- **Not verified in the browser:** the outreach phone CTA (no current data entry triggers it) and the committee-role warning (Sheets-only). Both are verified by the type checker and by reading the code.
- **3 moderate `npm audit` advisories remain** in Tailwind 3's `postcss-selector-parser` chain. They affect the build only, and the fix needs Tailwind 4.
- **Fallback event data is all in the past,** so the Upcoming view is empty whenever Sheets is unavailable. The build-time Sheets plan fixes this.

### Next (separate plans)
1. Build-time Google Sheets → JSON, with a "Publish website" menu in the Sheet (`review-architecture.md` D1).
2. Shared UI components from `DESIGN.md` tokens, including `PageHero`/header tone and a `Modal` with a focus trap (`review-design.md` §6–8).
3. Site-owner tasks in the Google Cloud and Render consoles:
   - Restrict the Sheets API key.
   - Make the `render.yaml` headers and caching live.

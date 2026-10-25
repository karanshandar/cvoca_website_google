# Maintainability & Code-Quality Review — CVOCA website

Review date: 2026-10-25 · Branch `claude/early-website-review-b04e34` @ `f02b98c` · Read-only (no code changed)
Scope: code-level quality, content editing, robustness, docs/hygiene, tooling. System architecture and visual design are covered by the sibling reviews (`tasks/review-architecture.md`, design, security/perf).

---

## Executive summary

The codebase is small (≈4,200 lines of TS/TSX), and it already has good foundations: a generic `useFetch` hook, an `Icon` registry, `fetchWithFallback`, lazy routes and an error boundary. Its maintainability problems are **not in the architecture. They are in four places that let errors through silently:**

1. **TypeScript currently checks almost nothing.** `@types/react` and `@types/react-dom` are not installed, so `react` resolves to `any`. All the `React.FC<…>` prop typing, the `useState<T>` generics and the JSX are unchecked. `strict` is off, and nothing runs `tsc`. Running it today fails (3 errors in `ErrorBoundary.tsx`). With `--strict`, it reports 1,625 errors, almost all caused by the missing React types.
2. **Data is cast, never validated.** Every Sheets call site uses `as unknown as Promise<T>`. One header typo in the Sheet, or one missing column, crashes a page at render time (for example `event.tags.forEach` or `event.committee.charAt`). The local JSON already differs from `types.ts`: `pastPresidents.json` has no `srNo`, so the Sr. No. column and its sort break whenever the site falls back to JSON.
3. **Failure handling is inconsistent.** No page reads `useFetch().error`. Home, Contact and Membership spin forever when their JSON fails to load. Events, About and Outreach instead show an empty "nothing here" state. The Footer disappears entirely.
4. **Content is hard for non-developers to edit, and the guidance is wrong.** `npm run build` minifies `public/data/*.json` *in place*, so every tracked JSON file is now one long line (0 newlines). The Sheets guide documents tabs and column names that don't match the code (`teams`, `image`). Several fallback datasets are stale: every event in `events.json` is in the past, and the blog uses placeholder images.

The large page files can be fixed mechanically. Most of their size comes from inline sub-components, a few copy-pasted blocks (two `ImageModal`s, three search inputs, five near-identical theme objects) and hard-coded copy. Splitting them is safe, but it is **less urgent** than items 1–4. Tighten the types first, and the extraction work becomes safer.

**Top 5 (all small and low-risk):** add `@types/react` + `@types/react-dom` and a `typecheck` script · stop `minify-json` rewriting source files · handle `error` and `res.ok` in a shared `fetchJson` helper · fix the `pastPresidents` `srNo` fallback and the `contacts[0]` bug · rewrite the Sheets column reference in the docs.

---

## Findings

Impact (I) and Effort (E) use **H / M / L**. All line numbers refer to `f02b98c`.

### A. Type safety & data contracts

| # | Finding | Evidence | I | E |
|---|---|---|---|---|
| A1 | **React has no type declarations**, so the whole UI is effectively untyped. Props, state generics and event handlers are all `any`. A wrong prop name or a misspelled field on a typed object compiles cleanly. | `package.json:14-26` has no `@types/react` / `@types/react-dom`. `tsc --strict` gives `TS7016 Could not find a declaration file for module 'react'` (40×) and `TS7026` on every JSX element. | H | L |
| A2 | **`tsc` is never run and fails today.** Vite strips types without checking them, so `npm run build` passes whatever the code contains. Running `tsc --noEmit` currently reports 3 errors (`Property 'state'/'props' does not exist on type 'ErrorBoundary'`). These are a side effect of A1 combined with `useDefineForClassFields: false`. | `components/ErrorBoundary.tsx:14,26,45`; `package.json:6-13` (no typecheck script) | H | L |
| A3 | **`strict` is off.** `tsconfig.json` is the AI Studio template: no `strict`, no `include`, plus `experimentalDecorators` and `useDefineForClassFields: false` (no decorators are used), and an `@/*` path alias that Vite doesn't know about and nothing imports. With strict on and React types installed, about 110 real implicit-`any` errors remain (`TS7006`/`TS7031`). That is a manageable list. | `tsconfig.json:1-28` | M | M |
| A4 | **Unsafe double casts at every Sheets call site.** `fetchSheetData` returns `Record<string, unknown>[]`, and each page forces it to a domain type with `as unknown as`. No field is checked. | `pages/About.tsx:229`, `pages/Events.tsx:372`, `pages/Home.tsx:130,133,140` | H | M |
| A5 | **`googleSheets.ts` uses `Map<any, any>` internals and untyped returns.** `new Map()` is implicitly `any`, `member.committeeName` is `unknown`, and the `switch(member.role)` has no `default`. A misspelled role (`"Convenor"`, `"advisors"`) **drops that member without any warning**. | `utils/googleSheets.ts:148,165-187` | M | L |
| A6 | **Type conversion depends on field names.** `convertValue` only knows `id`, `srNo`, `isNew`, `tags` and `date`. Dates convert only when they contain `/`, so `15-09-2026` or `Sep 15, 2026` from the sheet reaches `new Date(...)` unchanged and renders as `NaN`/`Invalid Date`. Empty `tags` → `[]`, but a *missing* `tags` header → `undefined`, which crashes at `Events.tsx:385`. | `utils/googleSheets.ts:73-106` | M | L |
| A7 | **The JSON fallbacks don't match `types.ts`:** <br>• `pastPresidents.json` has no `srNo` (it is only added in `fetchPastPresidents`), so in fallback mode every row shows "-" and sorting by Sr. No. does nothing. <br>• `annualReports.json` has no `isNew`/`description`. That works only because both are optional. <br>• `managingCommittee.json` has an `email` field that is not in `CommitteeMember`. | `utils/googleSheets.ts:132-139`; `pages/About.tsx:316-317,370,448`; `public/data/pastPresidents.json` | M | L |
| A8 | **Dead and loose types.** `NavLink` (it pulls `React` into `types.ts`) and `BlogPost` are unused. `CvoEvent.id: number`, but a non-numeric Sheets id stays a string (`convertValue` returns `value` on NaN), so `getFallbackGradient(id)` returns `undefined`. `OutreachContact.type` allows `'email'`, but `CoordinatorPill` shows a phone icon for it. | `types.ts:2,48-52,80-88`; `pages/Events.tsx:72-82`; `pages/DigitalOutreach.tsx:143-147` | L | L |
| A9 | **Unnecessary local casts.** `(committee.chairperson as CoreMember)` appears where the type is already `CoreMember \| undefined`, and `initiative.stats!`/`contacts!` use non-null assertions right after `has*` checks. | `pages/About.tsx:85,263`; `pages/DigitalOutreach.tsx:241,259` | L | L |

**Recommendation for A4–A7:** add one small `utils/normalize.ts` with a function per domain type, such as `toEvent(row): CvoEvent | null`. Each function defaults the optional fields (`tags ?? []`, `cost ?? ''`), coerces `id`/`srNo`, normalises the date and **drops invalid rows with a `console.warn`** instead of crashing. Run both Sheets rows and JSON rows through it, so the two sources can't drift apart. No library is needed. (If the architecture review's build-time Sheets fetch goes ahead, the same normalisers run in the build script and can *fail the build* on bad rows.)

### B. Robustness & error handling

| # | Finding | Evidence | I | E |
|---|---|---|---|---|
| B1 | **No page reads `useFetch().error`.** The behaviour on failure differs by page: <br>• **Home** (`if (!homeData) return <LoadingSpinner/>`): spins forever <br>• **Contact**, **Membership** (`loading \|\| !data`): spin forever <br>• **Events**: says *"There are no upcoming events scheduled"*, which is wrong <br>• **About**: empty tabs and no reports <br>• **DigitalOutreach**: blank section <br>• **Footer**: hidden entirely if *either* JSON fails | `pages/Home.tsx:164`, `pages/Contact.tsx:50`, `pages/Membership.tsx:181`, `pages/Events.tsx:371,571`, `pages/About.tsx:222`, `pages/DigitalOutreach.tsx:324`, `components/Footer.tsx:44` | H | L |
| B2 | **Plain JSON fetches skip the `res.ok` check.** In five places, `fetch(url).then(r => r.json())` is used directly. Combined with the SPA rewrite (`render.yaml:33-36`, `public/_redirects`), a missing `/data/x.json` returns `index.html` with status 200, so `json()` throws a confusing `SyntaxError`. `fetchWithFallback` *does* check `ok`, but only on the fallback path. | `pages/Home.tsx:121,124`, `pages/Contact.tsx:47`, `pages/Membership.tsx:178`, `pages/DigitalOutreach.tsx:325` | M | L |
| B3 | **`Promise.all` on About is all-or-nothing.** If any one of the four fallback fetches throws, all four datasets are lost (`data ?? [[],[],[],[]]`), including the ones that loaded. | `pages/About.tsx:222-231` | M | L |
| B4 | **The ErrorBoundary never resets.** It wraps `<Routes>` without a `key`, so after one render error every later navigation keeps showing "Something went wrong" until a full reload. It is also the only handler for lazy-chunk load failures after a deploy, which is fine, but it doesn't say so. Header and Footer sit outside it, which is good. | `App.tsx:61-75`; `components/ErrorBoundary.tsx:24-44` | M | L |
| B5 | **NotFound duplicates the suffix in its title.** It passes `'Page Not Found - CVOCA'`, and `useSEO` appends `\| CVOCA`, so the result is *"Page Not Found - CVOCA \| CVOCA"*. Because of the SPA rewrite it also returns HTTP 200 (a soft 404, see the SEO/perf review). It is the only page using `.btn-primary`. `.btn-secondary` and `.btn-outline` are unused. | `pages/NotFound.tsx:8`; `hooks/useSEO.ts:31`; `index.css:9-14` | L | L |
| B6 | **The `googleSheets.ts` module logs at import time.** It calls `console.error('Missing Google Sheets configuration…')` on every page load when the env vars are missing, which is normal in local dev and in previews. It then still sends a request to `…/undefined/values/…?key=undefined`. If the config is missing, it should skip the call and use the fallback. | `utils/googleSheets.ts:9-11,25` | L | L |
| B7 | **The DigitalOutreach phone CTA uses the wrong contact.** It finds the phone contact whose `name === ctaText`, then renders `contacts[0]`. That works today only because the helpline is the first contact. Also, the matching rule (`contact.name !== initiative.ctaText`) only makes sense if you know about it. | `pages/DigitalOutreach.tsx:260,294-304` | M | L |
| B8 | **Events filter UX bugs that come from the logic:** <br>• `hasActiveFilters` treats the *default* `'upcoming'` as active, so "Clear" always shows. <br>• `clearFilters` resets to `'all'`, not to the default. <br>• The hero always says "Upcoming Events", even in the Past view. <br>• `getGoogleCalendarUrl` can produce hour 24+ when it adds 2 hours to a late start. | `pages/Events.tsx:427-434,466,50-55` | L | L |
| B9 | **Timezone-sensitive date parsing.** `new Date('YYYY-MM-DD')` is UTC midnight, then it is compared with local midnight and shown with local `getDate()`. It is correct in IST. West of UTC it shows the previous day and treats a same-day event as past. Home's president date already parses safely with `new Date(y, m-1, d)`, so reuse that one helper. | `pages/Events.tsx:150,394,412`; `pages/Home.tsx:34,154-155` vs `pages/Home.tsx:255-256` | L | L |

### C. Large page files — what to split out

None of the four files is complex. They are long because they contain inline sub-components, hard-coded copy and repeated class strings. Each split below is a move only, with no change in behaviour.

**`pages/About.tsx` (611 lines)**
- `renderTabContent()` (`:233-482`) is a 250-line `switch` with `case` blocks that declare `const`s and even a component (`SortIcon`, `:338`). That component is *redefined on every render*, which remounts it. Move each tab into its own component: `ManagingCommitteeGrid`, `CoreCommitteesTab`, `PastPresidentsTab`. Then each owns its own search and sort state (`:216-220` move with them).
- The past-presidents filter and sort logic (`:306-329`) is a pure function. Move it to `utils/` and it becomes the easiest thing in the repo to unit-test.
- The four `<th>` blocks (`:402-441`) are identical apart from key and label. Map over `[{key,label,align,width}]` instead.
- The mobile card and desktop row each repeat `srNo.padStart` and the village pill (`:370,382` / `:448,457`).
- `CommitteeAccordion`, `CommitteeRoleSection` and `AnnualReportsSection` (`:37-202`) can move unchanged to `components/about/`.
- Hard-coded copy (`:509-579`: heritage, vision, mission, six service cards) should move to `about.json` if non-developers are expected to edit it (see D). Otherwise keep it as a typed array at the top of the file, so it is in one place.

**`pages/Events.tsx` (588 lines)**
- `getGoogleCalendarUrl` and its time parser (`:15-69`) are pure, so move them to `utils/calendar.ts` (and test them).
- `ImageModal` (`:85-138`) is duplicated in `DigitalOutreach.tsx:117-136` (that copy lacks `aria-label` and the "open full size" link). Use one `components/ImageModal.tsx`.
- `EventCard` (`:146-355`, 210 lines) → `components/events/EventCard.tsx`. Inside it, the three "icon + label + value" rows (`:243-275`) are one `MetaRow` repeated.
- The filter bar (`:477-555`) has three `<select>`s with the same 200-character class string. Use one `FilterSelect`.
- The upcoming/past filtering and sorting (`:389-425`) is repeated in `Home.tsx:149-157`. Put it in one `utils/events.ts` with `isUpcoming(event, today)` and `sortByDate`.

**`pages/Home.tsx` (427 lines)**
- Mostly presentational, and the best-structured of the four.
- Its `committee`/`cost` badges (`:53-61`) copy `Events.tsx:225-233`, so extract an `EventBadges` component.
- The IIFE inside JSX that formats the president's date (`:252-261`) should be a `formatDate` helper. Its `try/catch` is dead code, because nothing in it throws. It returns "Invalid Date" instead.
- The static compliance-calendar card (`:321-350`) has a `<button>` nested inside an `<a>`, which is invalid HTML. Also, its URL and copy are hard-coded and so can't be edited as content.

**`pages/DigitalOutreach.tsx` (372 lines)**
- `THEMES` (`:27-113`, 87 lines): the five category themes are identical apart from one colour name. `isDarkCard` is `false` everywhere, so every `theme.isDarkCard ? … : …` branch is dead (`:142,150,151,205,221,222,227,239,242,254`). Two of them even have identical arms (`'text-gray-400' : 'text-gray-400'`, `:150,222,239`). Collapse them into `{ accent: 'emerald', … }` with literal class strings per colour. Keep the full class names written out so Tailwind's scanner still finds them.
- `theme.featureIcon.replace('text-', 'text-opacity-100 text-')` (`:180`) generates class names at runtime. It is fragile and probably does nothing.
- The theme is chosen by an exact match on the `category` string in the JSON (`:115`). If an editor renames a category, the card silently switches to grey. Use an explicit `theme` key in the JSON instead.
- The inline WhatsApp SVG (`:144`) belongs in the `Icon` registry, which already exists for this purpose.

### D. Content editing (non-developer workflow)

| # | Finding | Evidence | I | E |
|---|---|---|---|---|
| D1 | **The build minifies the *tracked source* JSON in place.** `minify-json.js` writes back to `public/data/*.json`. As a result, all 11 committed data files are now one line each (`wc -l` = 0). Anyone editing them in GitHub's web editor faces a single 11 KB line, and every content diff is a whole-file change that can't be reviewed. Vite already copies `public/` as-is, and the size saving (≈16% of 35 KB, before gzip) is negligible. **Fix:** minify into `dist/data/` after `vite build`, or drop the step. Then re-format the source files once. | `scripts/minify-json.js:16-26`; `package.json:8` | H | L |
| D2 | **Content lives in two places, and nothing tells editors which is which.** <br>• *Sheets + JSON fallback:* events, managing committee, committees, annual reports, past presidents, president message (Sheets only, with the default in `home.json`). <br>• *JSON only:* home stats and features, digital outreach, membership, contact, social. <br>• *Hard-coded in TSX:* About copy, Blog page, Privacy Policy, the compliance card, the Header nav. <br>Editors need a one-page "where to change X" table. | `utils/googleSheets.ts:111-199`; `pages/*.tsx` | H | L |
| D3 | **The Sheets documentation is wrong.** The guide tells editors to create **two** tabs, `events` (`title, date, description, image`) and `teams`, and says "headers must be exactly as shown". The code actually reads six tabs (`events`, `managingCommittee`, `committeeMembers`, `annualReports`, `pastPresidents`, `presidentMessage`) and different columns (`imageUrl`, `committee`, `tags`, `cost`, `time`, `location`, `registrationLink` …). `committeeMembers` needs `committeeName, memberName, nativePlace, role` with exact role values (`chairperson`, `advisor`, `convenor`, `jointConvenor`, `specialInvitee`, `subCommittee`), and none of that is written down. | `docs/association-website-implementation-guide.md:189-212`; `docs/cloudinary-guide.md:88` ("managingCommittee or teams tab") | H | L |
| D4 | **The fallback data is stale.** Every event in `events.json` is before today (latest `2026-02-28`, `time: "TBD"`, `cost: "TBD"`). So when Sheets is down, Home shows "More Events Coming Soon" and Events shows "no upcoming events". Events 1–6 have no `registrationLink`, so they show "Registration Closed". The `presidentDefault` message is dated `2026-01-01`. The fallback should be refreshed whenever the Sheet changes, or it is not much of a fallback. A build-time Sheets → JSON snapshot (see the architecture review) fixes this structurally. | `public/data/events.json`; `public/data/home.json` | M | L–M |
| D5 | **Placeholder content.** `blog.json` uses `picsum.photos` images and January 2025 dummy posts. It is **not read by any page** (Blog is static links), so delete it along with `BlogPost`. Outreach "Technology & AI" and "Financial Aid" use Unsplash stock images, and "Technology & AI" has no CTA or contacts. | `public/data/blog.json`; `public/data/digitalOutreach.json` | L | L |
| D6 | **JSON mixes content with presentation.** `home.json` stats carry the CSS `delay` (`"0.4s"`). `iconPath` in home, membership and outreach holds raw SVG path data, which a non-developer can't author. Use `icon: "users"` keys that resolve through `components/Icon.tsx` instead, so the registry is used for data icons too. | `public/data/home.json`; `types.ts:59,65,102,119` | M | M |
| D7 | **Links and images checked.** All 18 local `/images/...` references resolve (verified), and no image is unreferenced. All 11 annual reports are Google Drive `view` links (fine). Two outreach entries have `registrationClosed: true` but still carry a live `ctaLink`, which is harmless but confusing. External URLs were **not** tested for liveness, because that is out of scope for a read-only review. | script check against `public/images` | — | — |

### E. Duplication across pages

| Pattern | Copies | Suggested shared piece |
|---|---|---|
| JSON fetch without `res.ok` / error UI | Home ×2, Contact, Membership, DigitalOutreach, plus Footer's own hand-rolled `useEffect` fetch (`components/Footer.tsx:25-42`, which re-implements `useFetch`) | `utils/fetchJson.ts` (`fetch`, check `ok`, `json()`) + one `<LoadError/>` |
| Dark hero section (`bg-slate-900 pt-32 pb-24` + blurred blobs + eyebrow + h1 + p) | About:488, Blog:85, Contact:66, DigitalOutreach:333, Events:460, Membership:188 (PrivacyPolicy:25 is a variant) | `components/PageHero.tsx` (`eyebrow`, `title`, `subtitle`) |
| `ImageModal` lightbox | Events:85, DigitalOutreach:117 | `components/ImageModal.tsx` |
| Search input with icon | About:276, About:349, Events:496 | `components/SearchInput.tsx` |
| Event date/badge parsing + upcoming filter | Events:150-153/389-423, Home:34-36/149-157 | `utils/events.ts` |
| Committee and cost badges | Events:225-233, Home:53-61 | `EventBadges` |
| "Expand / Read more" text clamp | Events:147-164/287-298, DigitalOutreach:162-164/208-215 | `useExpandable` or `<ExpandableText>` |
| Route list | `App.tsx:64-72`, `Header.tsx:31-39`, `Header.tsx:110` (`darkHeroPaths`), `scripts/generate-sitemap.js:12-21` | One `routes.ts` array used by all four (the sitemap script can import a `.js`/JSON copy). Adding a page currently means touching 4 files. |
| `BASE_URL` | `constants.ts:1`, `scripts/generate-sitemap.js:9` (with "keep in sync" comment) | Fine to leave; or move both to a shared `site.json`. |

### F. Docs & repo hygiene

| # | Finding | Evidence | I | E |
|---|---|---|---|---|
| F1 | **`claude.md` vs `CLAUDE.md`.** Only **`claude.md`** (lowercase) is tracked. It is not a duplicate. Windows' case-insensitive filesystem makes it look like `CLAUDE.md`. On macOS/Linux (case-sensitive), Claude Code and anyone following `README.md:144,193` ("CLAUDE.md") won't find it. Rename it with `git mv claude.md CLAUDE.md`. | `git ls-files` | M | L |
| F2 | **README is out of date:** <br>• versions pinned in prose (`:7-10`) <br>• build steps omit sitemap generation (`:65-68`) <br>• "SPA routing via `public/_redirects`" (`:87`), but Render uses `render.yaml` routes, and `_redirects` is the Netlify format, so one of them is redundant <br>• the structure tree lists `hooks/ (useSEO)` and `utils/ (schema generators)` only <br>• "Accessibility compliant" and Lighthouse numbers are unverified claims <br>• **no section on how to edit content**, which is its most-needed section | `README.md` | M | L |
| F3 | **`tasks/todo.md` is an old, completed SEO log** that names functions that no longer exist (`getPersonSchema`, `getArticleSchema`, `getFAQSchema`). Since CLAUDE.md makes `todo.md` the working plan, archive it (for example `docs/history/2025-seo.md`) and start a fresh one. | `tasks/todo.md` | L | L |
| F4 | **The implementation guide is a 780-line planning doc** with "✅ COMPLETE, January 2026" tables, Plan A/Plan B options and the wrong sheet schema (D3). Split it into a short, accurate **`docs/editing-content.md`** for editors and keep the rest as background. | `docs/association-website-implementation-guide.md` | M | M |
| F5 | **Dead code and unused exports:** <br>• `getOptimizedImageUrlWithPreset`, `ImageSizePresets.THUMBNAIL/HERO` (`utils/imageUtils.ts:65-89`) <br>• `NavLink`, `BlogPost` types <br>• `public/data/blog.json` <br>• `.btn-secondary`/`.btn-outline` CSS <br>• the `@/*` path alias <br>• `VITE_CLOUDINARY_CLOUD_NAME` in `.env.example` and README, which nothing reads <br>• `// eslint-disable-next-line` in `hooks/useFetch.ts:34`, though ESLint isn't installed | as listed | L | L |
| F6 | **Stray leading blank line** at the top of `types.ts`, `About.tsx`, `Events.tsx`, `Home.tsx`, `DigitalOutreach.tsx` and `Header.tsx`, and mixed 2- and 4-space indentation across files. Cosmetic, and fixed for free by a formatter. | line 1 of each | L | L |

### G. Tooling gaps & dependencies

**G1 — Type checking (do this first, H impact / L effort).**
1. `npm i -D @types/react@^19 @types/react-dom@^19`
2. Add the script `"typecheck": "tsc --noEmit"` and run it in `build` (`"build": "tsc --noEmit && …"`). Render then refuses to deploy code with type errors.
3. Remove `experimentalDecorators` and `useDefineForClassFields: false`, which fixes the `ErrorBoundary` errors. Add `"include": ["**/*.ts","**/*.tsx"]`, excluding `scripts`/`dist`.
4. Turn on `"strict": true` in a follow-up PR once the ≈110 implicit-`any` errors are fixed. Most are untyped callback parameters, and they disappear once React types exist.

**G2 — Lint (worth it, but keep it minimal, M impact / L effort).** Use `eslint` + `typescript-eslint` + `eslint-plugin-react-hooks` with the recommended configs only, and nothing stylistic. Its main value here is `react-hooks/rules-of-hooks` and `exhaustive-deps`. `useFetch` already has a disable comment for a linter that isn't there. Add Prettier only if the team wants it: it fixes F6 in one commit, but rewrites every file.

**G3 — Tests (narrow scope only, M impact / L effort).** A full component test setup isn't worth it at this size. Add **Vitest** (it reuses the Vite config, so there is no extra config) for the pure functions that hold the real logic and have already produced bugs:
- `convertValue` / the `fetchCommittees` grouping (`utils/googleSheets.ts`)
- `getGoogleCalendarUrl` (`pages/Events.tsx:15`), once it is extracted
- the upcoming-events filter and the date parsing (B9)
- the `normalize*` functions from A4
- one **data-contract test** that loads every `public/data/*.json` and runs it through the normalisers, so a bad edit to the JSON fails CI

That is roughly 5 small test files.

**G4 — CI.** There is no CI. A single GitHub Action running `npm ci && npm run typecheck && npm test && npm run build` on PRs is enough, so that content-only PRs also get the data-contract check.

**G5 — Outdated dependencies** (`npm outdated`, main checkout, today):

| Package | Installed | In-range latest | Latest major | Plan |
|---|---|---|---|---|
| react-router-dom | 7.9.6 | **7.18.4** | — | **Bump now.** `npm audit` reports 2 *high* advisories for `react-router` < 7.17.1 (open-redirect/XSS etc.). Most target SSR/framework mode, not this SPA, but the fix is a minor bump. |
| react / react-dom | 19.2.0 | 19.3.1 | — | Bump with the router; add the `@types` at the same time |
| vite | 7.3.1 | 7.3.7 | 8.x | Patch now; plan Vite 8 together with plugin-react 6 |
| @vitejs/plugin-react | 5.1.1 | 5.2.0 | 6.x | Same as above |
| tailwindcss | 3.4.18 | 3.4.19 | **4.x** | Stay on 3.x. v4 is a config rewrite (CSS-first config, and `DESIGN.md`'s `json-tailwind` export targets the v3 config). Treat it as its own project. |
| typescript | 5.8.3 | 5.8.3 (`~` pin) | 7.x | Keep 5.x until the strict work is done; then evaluate |
| postcss / autoprefixer / @types/node | minor | minor | — | Bump in place. Keep `@types/node` at 22 to match the Node version |

Suggested rhythm: one "in-range bumps" PR now (`npm update` + `npm audit fix`, then run the typecheck and build). After that, a monthly `npm outdated` check (or Dependabot grouped minor/patch PRs), and major upgrades (Vite 8, Tailwind 4, TS 7) as separate, deliberate tasks. Also pin the Node version (`"engines"` or `.nvmrc`) so Render and local builds match. README says "v18 or higher", but Vite 7 needs Node 20.19+.

---

## Prioritised refactor list

Ordered by value ÷ risk. Each item is one small PR that only touches what it names.

| # | Change | Fixes | Risk | Effort |
|---|---|---|---|---|
| 1 | Install `@types/react`/`@types/react-dom`; clean `tsconfig` (drop decorator flags, add `include`); add a `typecheck` script and run it in `build` | A1, A2 | Low | ~1 h |
| 2 | Stop `minify-json` writing into `public/data` (minify `dist/data` after build, or remove the step); re-format the 11 JSON files once with 2-space indent | D1 | Low | 30 min |
| 3 | Add `utils/fetchJson.ts` (checks `res.ok`), use it in the 5 plain fetches and in Footer; read `error` on every page and show a shared `<LoadError/>` instead of spinning forever or showing a false "no events" message | B1, B2, Footer duplication | Low | 1–2 h |
| 4 | Small bug fixes: `srNo` fallback (number rows in the page or JSON), `contacts[0]` → the found contact, the NotFound title, the Events `clearFilters`/`hasActiveFilters` default, a `default:` warn in the committee `switch` | A5, A7, B5, B7, B8 | Low | 1 h |
| 5 | Write `docs/editing-content.md`: a "where to change X" table plus the exact Sheet tabs, columns, allowed `role` values and date format; fix the guide's wrong schema; update README; rename `claude.md` → `CLAUDE.md`; archive the old `todo.md` | D2, D3, F1–F4 | None (docs) | 2 h |
| 6 | Bump dependencies in range (`react-router-dom` 7.18 for the audit findings, react 19.3, vite 7.3.x patch); add `.nvmrc`/`engines` | G5 | Low | 30 min |
| 7 | Add `utils/normalize.ts` and route Sheets and JSON rows through it; remove the `as unknown as` casts | A4, A6, A8 | Low–Med | 2–3 h |
| 8 | Add Vitest plus ~5 test files for the pure helpers and the JSON data contract; add one GitHub Action | G3, G4 | None | 2–3 h |
| 9 | Extract the shared UI pieces: `ImageModal`, `PageHero`, `SearchInput`, `utils/events.ts` (upcoming filter, date parsing), `utils/calendar.ts` | E, B9 | Low (moves only) | 2–3 h |
| 10 | Split the big pages: About tabs → 3 components (removes the redefined `SortIcon`); `EventCard`/`FilterSelect` out of Events; collapse `THEMES` and the dead `isDarkCard` branches in DigitalOutreach | C | Low–Med | 3–4 h |
| 11 | Delete dead code (`blog.json`, `BlogPost`, `NavLink`, unused image helpers and CSS, the `@/*` alias, the Cloudinary env var); add a single `routes.ts` used by App, Header and the sitemap | F5, E (routes) | Low | 1 h |
| 12 | Turn on `strict: true` and fix the ≈110 implicit-`any`s; add a minimal ESLint (hooks rules) | A3, G2 | Low | 2–3 h |
| Later | Replace `iconPath`/`delay` in the JSON with icon keys; move the About copy into JSON if editors need it; refresh or automate the fallback JSON snapshot (tie it to the architecture review's build-time Sheets fetch); Tailwind 4 / Vite 8 | D4, D6, G5 | Med | — |

Items 1–6 add up to about one working day, carry very little risk, and remove most of the risk of breaking things without anyone noticing. Items 7–12 make the bigger splits safe to do.

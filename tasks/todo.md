# Batch C: cleanup, docs and tooling

## Status: DONE (2026-10-28). Committed on `main` in five commits, not pushed. See Review below.

Source: `tasks/review-maintainability.md` (A3, D2, D3, F1, F2, F4, F5, G1, G3, G4, G5 Node pin) and `tasks/review-architecture.md` (B2, D6, I1).
The previous contents of this file (the Batch B plan and its review) are preserved in git history at `b3e054c`.
Execution: inline (superpowers:executing-plans) on `main`, no worktree/branch/push; plan approval waived by the session that started this one.

---

## Global constraints
- Minimal, targeted changes only. Touch only what each task names. No content changes.
- No `any`, no `@ts-ignore`, no casts added just to silence errors.
- Node floor = Vite 7's own: `^20.19.0 || >=22.12.0`. `.nvmrc` = `22` (matches local Node 22.12 and `@types/node@22`).
- Vitest **4.x** (`^4.1.12`), not 5.x: Vitest 5 needs Node ≥ 22.12, which would contradict the Node 20.19 floor.
- Helpers extracted for tests are pure moves: same logic, same output.
- Out of scope: Batch D (prerender, self-hosted font, THEMES, remaining shared components), ESLint/Prettier, major upgrades, anything needing the client's Google/Render accounts.

## Findings from checking the code first
- `tsc --noEmit --strict` already exits 0 (earlier rounds added React types and typed the code). Turning on `strict` is a config change with no code fallout.
- `.btn-primary/.btn-secondary/.btn-outline` are all live now (`components/ui/Button.tsx` maps its variants to them; `Blog.tsx` uses `secondary`, `Home.tsx` uses `outline`). Keep them.
- `ImageSizePresets` in use: `TEAM_PHOTO`, `EVENT_CARD`, `LARGE`. Unused: `THUMBNAIL`, `HERO`.
- `isCloudinaryUrl` is used only inside `imageUtils.ts`.
- The only ESLint-disable comment is `hooks/useFetch.ts:34`; ESLint is not installed. Replace it with a plain comment saying why the effect runs once.
- README build steps describe a JSON minify step that no longer exists.
- `tsconfig.json`: `paths` (`@/*`, nothing imports it) and `allowJs` (only `.ts/.tsx` are included) are unused. `types: ["node"]` stays (the data-contract test reads files with `node:fs`). `allowImportingTsExtensions` stays (harmless with `noEmit`; out of scope to audit imports).

## Review focus (failure modes no single task exercises)
1. **Sheets date typed as `5/9/2026`** (no zero padding): must become `2026-09-05`, not `2026-9-5` (`convertValue` test).
2. **Committee role misspelt** (`Convenor`): member is dropped with a warning, not crash (grouping test).
3. **Event on today's date**: counts as upcoming, not past (upcoming-filter test pins `today` at local midnight).
4. **Event time `TBD`** or a single start time: calendar link still valid, 2-hour default (calendar test).
5. **A new JSON file added to `public/data/`** with no contract: the data-contract test fails rather than silently ignoring it.

---

## Task 1: Dead code (commit 1)
**Files:** `public/data/blog.json`, `public/_redirects`, `types.ts`, `utils/imageUtils.ts`, `.env.example`, `tsconfig.json`, `vite.config.ts`, `hooks/useFetch.ts`
- [x] Delete `public/data/blog.json` and `public/_redirects` (Render ignores `_redirects`; the live rewrite is in the dashboard, mirrored by `render.yaml` `routes`).
- [x] `types.ts`: remove `NavLink` (and the now-unused `import React`) and `BlogPost`.
- [x] `utils/imageUtils.ts`: un-export `isCloudinaryUrl`; remove `getOptimizedImageUrlWithPreset`, `THUMBNAIL`, `HERO`.
- [x] `.env.example`: remove the Cloudinary block. (README line handled in Task 2.)
- [x] `tsconfig.json`: remove `paths` and `allowJs`.
- [x] `vite.config.ts`: remove `host: '0.0.0.0'`.
- [x] `hooks/useFetch.ts`: replace the `eslint-disable` line with a comment that the fetcher runs once on mount.
- [x] Grep each removed name → no references outside `tasks/review-*` and history. `npm run typecheck` + `npm run build` pass.

## Task 2: Docs (commit 2)
**Files:** `claude.md` → `CLAUDE.md`, `docs/editing-content.md` (new), `docs/association-website-implementation-guide.md`, `docs/cloudinary-guide.md`, `README.md`
- [x] `git mv claude.md claude.tmp.md && git mv claude.tmp.md CLAUDE.md`.
- [x] `docs/editing-content.md`: where-to-change-X table (Sheet tabs / JSON-only / hard-coded TSX); each of the 6 Sheet tabs with the exact headers the code reads; `committeeMembers` roles; `managingCommittee` `President` role used on Home; date format (`DD/MM/YYYY` or `YYYY-MM-DD` in Sheets, `YYYY-MM-DD` in JSON); `tags` comma-separated; `isNew` `TRUE`/`1`; how the JSON fallback relates to the Sheet (used only when Sheets is unreachable/unconfigured; keep it in step by hand); images.
- [x] Implementation guide §2.5 and §6.2: replace the wrong `events`/`teams` tables and steps with a pointer to `docs/editing-content.md`; drop the `VITE_CLOUDINARY_CLOUD_NAME` step.
- [x] `docs/cloudinary-guide.md:88`: "managingCommittee tab".
- [x] README: versions without pinned numbers, Node ≥ 20.19, build steps (typecheck → sitemap → vite build), `typecheck`/`test` scripts, current structure, link to editing doc, drop `_redirects`, Cloudinary env var, minify claims, "Accessibility compliant", Lighthouse/metric claims.
- [x] Check every column name in the doc against `utils/googleSheets.ts` and the page code.

## Task 3: Strict mode + Node pin (commit 3)
**Files:** `tsconfig.json`, `.nvmrc` (new), `package.json`
- [x] `"strict": true` in `tsconfig.json`; `npm run typecheck` exits 0.
- [x] `.nvmrc` = `22`; `package.json` `"engines": { "node": "^20.19.0 || >=22.12.0" }`.

## Task 4: Tests + CI (commit 4), TDD
**Files:** `package.json`, `package-lock.json`, `utils/events.ts` (new), `pages/Events.tsx`, `pages/Home.tsx`, `utils/googleSheets.ts`, `tests/*.test.ts` (new), `.github/workflows/ci.yml` (new)

**Interfaces produced:**
- `utils/events.ts`: `getGoogleCalendarUrl(event: CvoEvent): string` (moved verbatim from `pages/Events.tsx`); `getUpcomingEvents(events: CvoEvent[], limit: number, now: Date = new Date()): CvoEvent[]` (the filter ≥ local midnight / ascending sort / slice used in `Home.tsx` (limit 2) and the `Events.tsx` schema list (limit 10)).
- `utils/googleSheets.ts`: `export function convertValue(...)` (unchanged); `export function groupCommitteeMembers(members: Record<string, unknown>[]): Committee[]` (the body of `fetchCommittees`, now typed with `Map<string, Committee>`); `fetchCommittees` calls it.

Steps:
- [x] `npm i -D vitest@^4.1.12`; add `"test": "vitest run"`.
- [x] `tests/dates.test.ts`: `parseLocalDate('2026-09-05')` → local Y/M/D 2026/8/5 at 00:00; non-ISO input falls back to `new Date(input)`. (Function exists → expect PASS on first run; confirm a deliberately wrong assertion fails once.)
- [x] `tests/googleSheets.test.ts`: write first, run → FAIL (not exported). `convertValue`: `id '7'`→`7`, `id 'abc'`→`'abc'`, `isNew 'TRUE'`/`'1'`→`true`, `'no'`→`false`, `tags 'a, b,,c'`→`['a','b','c']`, empty `tags`→`[]`, `date '5/9/2026'`→`'2026-09-05'`, `date '2026-09-05'` unchanged, other fields unchanged. `groupCommitteeMembers`: two committees grouped in first-seen order, each role lands in its array, `chairperson` set, unknown role dropped + `console.warn` called.
- [x] Export/extract in `googleSheets.ts` → PASS.
- [x] `tests/events.test.ts`: write first → FAIL (module missing). `getUpcomingEvents` with `now` = 2026-09-05 15:00: keeps today and future, drops yesterday, ascending, honours `limit`. `getGoogleCalendarUrl`: `'10:00 AM - 1:30 PM'` → `dates=20260905T100000/20260905T133000`; `'6:00 PM'` → `T180000/T200000`; `'TBD'` → `T090000/T110000`; `'12:00 PM'` → `T120000`; title/description/location URL-encoded; `ctz=Asia/Kolkata`.
- [x] Create `utils/events.ts` (move), switch `Events.tsx`/`Home.tsx` to it → PASS.
- [x] `tests/dataContract.test.ts`: reads every `public/data/*.json`; a table of per-file checks (required string/array fields the pages read, e.g. events `id,title,date(YYYY-MM-DD),time,location,committee,tags[],cost,description`; committees role arrays are arrays; contact/membership/social nested fields; `OutreachContact.type` and `MembershipTier.variant` in their allowed values); fails if a file has no entry.
- [x] `.github/workflows/ci.yml`: on push + pull_request to `main`; `actions/checkout@v4`, `actions/setup-node@v4` with `node-version-file: .nvmrc`, `cache: npm`; `npm ci`, `npm run typecheck`, `npm test`, `npm run build`.

## Task 5: Verify + review
- [x] `npm run typecheck`, `npm test`, `npm run build` pass; `git status` clean after build.
- [x] Dev server in built-in browser: all 9 routes at 375 and 1440 px, light + dark; no console errors beyond the known Sheets-not-configured warning; no horizontal overflow; data on Home, Events, About (3 tabs), DigitalOutreach.
- [x] Fresh reviewer subagent on the full diff (superpowers:requesting-code-review); fix Critical/Important.
- [x] Fill in Review below; commit per task.

---

## Review

### What changed
- **Dead code** (`e32fe1c`): deleted `public/data/blog.json`, `public/_redirects`, the `BlogPost`/`NavLink` types (and `types.ts`'s now-unused React import), `getOptimizedImageUrlWithPreset` and the `THUMBNAIL`/`HERO` presets; `isCloudinaryUrl` is module-private. Dropped `VITE_CLOUDINARY_CLOUD_NAME` from `.env.example` and README, the `@/*` alias and `allowJs` from `tsconfig.json`, and `host: '0.0.0.0'` from `vite.config.ts` (the dev server now listens on localhost only). The `eslint-disable` in `useFetch` became a plain comment. Grep at HEAD finds no references to any removed name outside the review reports.
  - `_redirects`: Render ignores it. The live `/* → /index.html` rewrite is set in the Render dashboard, and `render.yaml` `routes` mirrors it, so there is now one place to look (plus its mirror).
- **Docs** (`023b490`, plus the review fix): `claude.md` → `CLAUDE.md` (two-step `git mv`). New `docs/editing-content.md`: where-to-change table, the six Sheet tabs with exact headers, `committeeMembers` roles, the `President` lookup, date rules, fallback behaviour, JSON contract check. The implementation guide's wrong `events`/`teams` schema and `image` column now point to it; the Cloudinary guide no longer mentions a `teams` tab. README rewritten: no pinned versions, Node floor, real build steps, scripts table, CI, current structure, editing-doc link; no `_redirects`, minify, Lighthouse or "Accessibility compliant" claims.
- **Strict + Node** (`0510556`): `"strict": true`; `engines` `^20.19.0 || >=22.12.0`; `.nvmrc` `22`.
- **Tests + CI** (`5b3c917`): Vitest 4, `npm test`. `utils/events.ts` holds `getGoogleCalendarUrl` (moved unchanged) and `getUpcomingEvents` (the identical filter/sort/slice from Home and the Events schema list). `googleSheets.ts` exports `convertValue` and `groupCommitteeMembers`. Four test files in `tests/` (41 tests). `.github/workflows/ci.yml` runs `npm ci`, typecheck, test, build on push/PR to `main`.

### Deviations
- **Strict mode needed no code fixes**: `tsc --strict` already exited 0 before the flag was set.
- **`.btn-*` CSS kept**: all three classes are live through `components/ui/Button.tsx`.
- **Vitest 4, not 5**: Vitest 5 requires Node ≥ 22.12, which would contradict the Node 20.19 floor.
- **npm 10.9 bug**: `npm i -D vitest` failed with arborist's `edgesOut` error, so the install ran through `npx npm@11`. The lockfile diff is additions only, and npm 10 `npm ci` installs from it cleanly.
- **Four test files, not five**: the upcoming filter and the calendar URL share `tests/events.test.ts` because they share `utils/events.ts`.
- **`groupCommitteeMembers` is not a byte-for-byte move**: typing it reads cells through `cellText`, so a missing `committeeName`/`memberName`/`nativePlace` *column* gives `''` instead of `undefined`. Output is the same for every real Sheet row (cells are always strings); for a missing column it avoids a crash in the About committee search (`nativePlace.toLowerCase()`).
- **Ledger kept outside the repo** (scratchpad), since the work is on `main` without a worktree.

### Verification
- `npm run typecheck` exit 0; `npm test` 41/41 (4 files); `npm run build` exit 0 and `git status` clean afterwards.
- Each new test was watched failing first (missing export / missing module); `parseLocalDate` (existing code) was shown to fail under `TZ=America/New_York` with the UTC bug reintroduced; the contract test was shown to fail on a `28/02/2026` date in `events.json` (restored).
- Built-in browser, dev server: all 9 routes at 375 and 1440 px, light and dark: no horizontal overflow, no `role=alert` errors, no console errors (only the known "Google Sheets is not configured" warning). Home (stats, president message, "More Events Coming Soon", outreach), Events (Past filter: 9 cards with valid calendar links; no Event JSON-LD while nothing is upcoming), About (all three tabs) and DigitalOutreach render data.
- Doc columns checked mechanically against `types.ts` and `googleSheets.ts`: every tab matches (`pastPresidents.srNo` is deliberately undocumented: About numbers rows itself).
- Fresh reviewer subagent on `b3e054c..5b3c917`: no Critical. One Important, fixed: the date advice. A real date cell reaches the site in the Sheet's locale format, which `convertValue` always reads as day/month/year, and the implementation guide recommended Date data validation. Both docs now say to keep `date` columns as Plain text. Also fixed: the doc said CI runs on "every push" (it runs on `main` pushes and PRs).

### Deferred / left
- Reviewer minors not done: the contract test ignores misspelt *optional* keys (for example `imageURL`), which needs an unknown-key check; CI runs `tsc` twice (`typecheck` and inside `build`), which is harmless; `__dirname` → `import.meta.dirname`.
- Batch D: prerendering, self-hosted font, collapsing DigitalOutreach THEMES, the remaining shared components.
- Still open from the reviews and out of this batch: normalisers for Sheets rows (A4–A7), the `as unknown as` casts at Sheets call sites, stale fallback events (D4), `iconPath`/`delay` presentation data in JSON (D6), ESLint/Prettier, in-range dependency bumps (G5), and whether Render should wait for CI before deploying (needs the client's Render dashboard).

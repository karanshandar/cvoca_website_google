# Batch E: row checks, interaction tests, ESLint, minor dependency updates

## Status: DONE (2026-10-29). Committed on `main` in five commits, not pushed. See Review below.

> **For agentic workers:** executed inline with superpowers:executing-plans + superpowers:test-driven-development; steps use `- [ ]` checkboxes.

**Goal:** Every Sheets row and every JSON fallback row passes through one typed normaliser per domain type, so bad rows are dropped with a warning instead of breaking a page; show/hide controls get real interaction tests; a minimal ESLint runs in CI; in-range dependency updates.

**Architecture:** `utils/normalize.ts` holds `toEvent`, `toCommitteeMember`, `toCoreMember`, `toCommittee`, `toCommitteeMemberRow`, `toAnnualReport`, `toPastPresident`, `toPresidentMessage` (each `(row: unknown) => T | null`) and `normalizeRows(dataset, rows, toItem)`, which drops `null` rows with one `console.warn` each. The Sheets wrappers in `utils/googleSheets.ts` run their rows through these and return domain types. `fetchWithFallback` takes the same `toItem` and runs the fallback JSON through `normalizeRows` too. `convertValue` is removed: its coercions (number id/srNo, `isNew`, comma tags, `DD/MM/YYYY` dates) move into the normalisers, so there is one place that converts cells.

**Tech stack:** React 19, Vite 7, Tailwind 3, TypeScript 5.8 strict, Vitest 4. New dev deps: `jsdom@^28` (28 is the newest whose `engines` matches ours, `^20.19 || ^22.12 || >=24`; 29/30 need 22.13+/22.22+), `@testing-library/react`, `@testing-library/dom`, `@testing-library/user-event`, `eslint@^9` + `@eslint/js@^9` (ESLint 10 needs Node 22.13+), `typescript-eslint`, `eslint-plugin-react-hooks`.

**Source:** session brief (Batch E); `tasks/review-maintainability.md` A4–A8, G2, G5; `tasks/review-architecture.md` D5; `docs/pending-tasks.md` X4.
The previous contents of this file (the Batch D2 plan and its review) are preserved in git history at `806f575`.
Execution: inline on `main`, no worktree/branch/push; plan approval waived by the session that started this one.

---

## Global constraints
- Minimal, targeted changes. Valid data renders exactly as before (checked by rendering the current JSON before and after, and by a test that each fallback row normalises to itself).
- No `as unknown as` left at Sheets call sites; no `any`, no `@ts-ignore`.
- Existing node-environment tests stay on node; only the interaction test file opts into jsdom (`// @vitest-environment jsdom`).
- ESLint: recommended configs only, nothing stylistic. A rule is disabled only with a one-line reason.
- No major upgrades (Vite 8, Tailwind 4, TS 7, Vitest 5, ESLint 10, `@types/node` 23+).
- A build leaves `git status` clean. Don't commit `.claude/`. Don't push.
- Each commit message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Decisions
- **Required fields follow `docs/editing-content.md`'s "Required" column.** A row missing one (absent, or blank/whitespace) is dropped. Exception kept from the docs: event `tags` and `cost` may be empty (`[]`, `''`).
- **Dates:** `toIsoDate(value)` in `utils/dates.ts` accepts `YYYY-MM-DD` or `D/M/YYYY` and returns a zero-padded `YYYY-MM-DD`, or `null` for anything else or an impossible date (e.g. `31/02/2026`). An event or president message with no readable date is dropped (before, it showed "Invalid Date"/`NaN`).
- **`id`/`srNo`:** a whole number, or text holding one (`"7"`). Anything else drops an event (id is required); a bad `srNo` is simply left out (the About page numbers presidents by row order anyway, so `srNo` is not shown from data).
- **Optional text** (`fullPricing`, links, `imageUrl`, `description`): blank becomes `undefined`, same as an absent JSON key. `isNew`: `true`, `"TRUE"`/`"true"`, `"1"` → `true`; other given values → `false`; absent/blank → `undefined`.
- **Extra fields are dropped** (e.g. `email` in `managingCommittee.json`), since nothing reads them.
- **Committees:** the two sources have different shapes (Sheets: one row per person; JSON: nested). Sheets rows go through `toCommitteeMemberRow` then the existing `groupCommitteeMembers`; JSON committees through `toCommittee`, which uses `toCoreMember` for the chairperson and every list, defaults missing lists to `[]` (what grouping produces) and drops invalid nested members with a warning naming the committee. A committee needs a `name`.
- **Not-a-list data** (`normalizeRows` given something other than an array) throws, so the page shows its LoadError instead of crashing.
- **JSON-only files** (`home`, `membership`, `contact`, `digitalOutreach`, `socialMedia`) have one source and keep their field-by-field contract check; they get no normaliser. `home.json`'s `presidentDefault` is also run through `toPresidentMessage` in the contract test, since Home falls back to it.
- **Interaction tests render the components directly.** `CommitteeAccordion`, `AnnualReportsSection` (About), `EventCard` (Events) and `BentoCard` (DigitalOutreach) become named exports, and the tests render them with fixture props. Rendering whole pages would need a fetch stub and, for Events, today's date (all fallback events are past).
- **ESLint covers `**/*.{ts,tsx}` only** (the Vite react-ts template's pattern). The three `.js` config/script files are not type-checked either.

## Review focus
1. **Sheets rows with trailing empty cells / missing columns**: Sheets omits trailing blank cells; a row whose optional columns are missing must still load. Test: `toEvent` with only the required fields.
2. **A whole tab with a misspelt header** (e.g. `Title`): every row dropped, one warning each, empty section rather than a crash. Covered by "missing required" tests + `normalizeRows` warning count.
3. **Numbers typed into text columns** (a `year` of `2024` read as a number from JSON, a numeric `term`): accepted as text. Test: `toAnnualReport({ year: 2024, … })` → `year: '2024'`.
4. **Whitespace-only cells** in required columns: treated as missing. Test in `toEvent`.
5. **Keyboard toggles**: Enter and Space on each disclosure button flip `aria-expanded`; the accordion body's `inert` follows. Tested with user-event.

---

## Task 1: Normalisers (TDD)
**Files:** create `utils/normalize.ts`, `tests/normalize.test.ts`; modify `utils/dates.ts`, `tests/dates.test.ts`, `utils/googleSheets.ts`, `tests/googleSheets.test.ts`, `utils/fetchWithFallback.ts`, `pages/Home.tsx`, `pages/About.tsx`, `pages/Events.tsx`, `tests/dataContract.test.ts`, `docs/editing-content.md`.

**Interfaces (produces):**
- `toIsoDate(value: string): string | null` (`utils/dates.ts`).
- `normalizeRows<T>(dataset: string, rows: unknown, toItem: (row: unknown) => T | null): T[]`.
- `toEvent → CvoEvent`, `toCommitteeMember → CommitteeMember`, `toCoreMember → CoreMember`, `toCommittee → Committee`, `toCommitteeMemberRow → CommitteeMemberRow` (`{ committeeName; memberName; nativePlace; role: string }`, exported type), `toAnnualReport → AnnualReport`, `toPastPresident → PastPresident`, `toPresidentMessage → PresidentMessage`; each `(row: unknown) => T | null`.
- `fetchSheetData(tab): Promise<Record<string, string>[]>` (raw cell text). Wrappers: `fetchEvents(): Promise<CvoEvent[]>`, `fetchManagingCommittee(): Promise<CommitteeMember[]>`, `fetchAnnualReports(): Promise<AnnualReport[]>`, `fetchPastPresidents(): Promise<PastPresident[]>`, `fetchCommittees(): Promise<Committee[]>`, `fetchPresidentMessage(): Promise<PresidentMessage | null>`.
- `groupCommitteeMembers(members: CommitteeMemberRow[]): Committee[]`.
- `fetchWithFallback<T>(primaryFetch: () => Promise<T[]>, fallbackJsonPath: string, toItem: (row: unknown) => T | null): Promise<T[]>`.

- [x] Before any change: record what the current JSON renders (Home, Events "All", About all tabs + Sr. No. sort desc, DigitalOutreach) in the browser at 1440px, as the baseline.
- [x] Write `tests/dates.test.ts` cases for `toIsoDate`: `'2026-09-05'` unchanged; `'5/9/2026'` → `'2026-09-05'`; `'25/12/2026'` → `'2026-12-25'`; `'31/02/2026'`, `'2026-13-01'`, `'5 Sep 2026'`, `'05-09-2026'`, `''` → `null`.
- [x] Write `tests/normalize.test.ts`, per normaliser: a valid row returns the expected object; missing optional fields get defaults; each missing required field (and a whitespace-only one) gives `null`; a bad date gives `null` (event, president message); a string id/srNo is coerced (`'7'` → `7`, `'abc'` → event `null` / srNo left out). Plus: tags from a comma string (`'CPE, Taxation,,  GST '` → three tags) and from an array; `isNew` from `'TRUE'`/`'1'`/`'no'`; numeric `year` → text; `toCommittee` defaults lists to `[]`, drops a nameless nested member with a warning; `normalizeRows` keeps valid rows in order, warns once per dropped row with the dataset name and row number, throws on a non-array.
- [x] Run `npm test`: the new tests fail (module/function missing).
- [x] Implement `toIsoDate` and `utils/normalize.ts`.
- [x] Rewire `googleSheets.ts` (remove `convertValue`; move its remaining tests into `normalize.test.ts`; typed wrappers), `fetchWithFallback.ts`, and the three pages; remove every `as unknown as`.
- [x] Extend `tests/dataContract.test.ts`: each of the 5 fallback files normalises with no row dropped and each row equal to its source (ignoring `managingCommittee.json`'s unread `email`); `home.json` `presidentDefault` passes `toPresidentMessage`.
- [x] Run `npm test` and `npm run typecheck`: pass.
- [x] Update `docs/editing-content.md`: rows missing a required value, or with an unreadable date, are left off the site (warning in the browser console); a non-number `id` drops the event.
- [x] Commit: `feat(data): normalise Sheets and fallback rows (Batch E)`.

## Task 2: X4 interaction tests
**Files:** create `tests/interactions.test.tsx`; modify `package.json`/lock (dev deps), `pages/About.tsx`, `pages/Events.tsx`, `pages/DigitalOutreach.tsx` (named exports only), `docs/pending-tasks.md`.

- [x] `npm i -D jsdom@^28 @testing-library/react @testing-library/dom @testing-library/user-event`.
- [x] Write `tests/interactions.test.tsx` (`// @vitest-environment jsdom`, `afterEach(cleanup)`), one `describe` per control:
  - `CommitteeAccordion`: button starts `aria-expanded="false"`, body (`#` + `aria-controls`) has `inert`; click → `true`, no `inert`; click again → back; focus + `{Enter}` and `{ }` each flip it.
  - `AnnualReportsSection` (3 reports): "View Archive" `aria-expanded` false, archive grid has class `hidden`; click → true, text "Hide Archive", grid not `hidden`; Enter/Space flip.
  - `EventCard` (description > 120 chars): "Expand" false → click → true and text "Collapse"; Enter/Space flip; short description shows no button.
  - `BentoCard` (description > 250 chars): "Read More" false, text truncated with `...`; click → true, full text, "Read Less"; Enter/Space flip.
- [x] Run: fails (components not exported).
- [x] Add the named exports. Run `npm test`: all pass, and the node-environment files still run on node.
- [x] Mark X4 done in `docs/pending-tasks.md` (section checkbox, suggested-order row, final checklist).
- [x] Commit: `test(ui): interaction tests for show/hide controls (Batch E, X4)`.

## Task 3: ESLint (minimal)
**Files:** create `eslint.config.js`; modify `package.json`/lock, `.github/workflows/ci.yml`, `README.md`, any file with real findings.

- [x] `npm i -D eslint@^9 @eslint/js@^9 typescript-eslint eslint-plugin-react-hooks`.
- [x] `eslint.config.js`: ignore `dist`; for `**/*.{ts,tsx}`: `js.configs.recommended`, `tseslint.configs.recommended`, `reactHooks.configs.flat.recommended`.
- [x] Add `"lint": "eslint ."`; CI step `npm run lint` after `npm ci`; README scripts table + CI line.
- [x] Run `npm run lint`; fix each real finding at its root; disable only with a one-line reason; check the existing `useFetch` comment is a real disable (or remove it if stale).
- [x] `npm run lint`, `npm run typecheck`, `npm test`: pass.
- [x] Commit: `chore(lint): minimal ESLint with recommended configs (Batch E)`.

## Task 4: Minor dependency updates
**Files:** `package.json`, `package-lock.json`.

- [x] `npm update @vitejs/plugin-react autoprefixer postcss react-router-dom tailwindcss @types/node` (if npm 10 hits the arborist bug, `npx npm@11 update …`).
- [x] Check versions: plugin-react 5.2.x, tailwindcss 3.4.19, @types/node 22.x, no major changes in `package.json`.
- [x] `npm audit` (record the result); `npm ci` from clean; then lint/typecheck/test/build.
- [x] Commit: `chore(deps): in-range updates (Batch E)`.

## Task 5: Verification and review
- [x] `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`; `git status` clean after the build.
- [x] Browser (dev server, `.claude/launch.json`): all 9 routes at 375 and 1440 px, light and dark; Home, Events, About (all tabs, Sr. No. sort), DigitalOutreach match the baseline; no overflow; no new console errors/warnings.
- [x] Break `public/data/events.json` (remove a `title`, set another event's date to `31/02/2026`): Events still renders, one warning per broken row; revert with `git checkout`.
- [x] Fresh reviewer subagent on the full Batch E diff (superpowers:requesting-code-review). Fix Critical/Important; fix or record minors.
- [x] Fill in the Review section; update `docs/pending-tasks.md`, README.

---

## Review

### What changed
- **Row checks** (`9090494`): `utils/normalize.ts` with a `toX` per domain type and `normalizeRows`. Sheets rows and fallback JSON go through the same functions, so the two sources can't drift. Sheets wrappers return domain types; `fetchWithFallback(primary, path, toItem)` normalises the fallback. No `as unknown as` left. `convertValue` is gone; `toIsoDate` (`utils/dates.ts`) reads both date formats and rejects impossible dates. The data-contract test runs the 5 Sheet-backed fallback files through the normalisers and requires every row to come back unchanged. It also caught what the old regex check couldn't (e.g. `2025-02-31`). `docs/editing-content.md` explains skipped rows.
- **X4 interaction tests** (`baa3afd`): jsdom 28 + Testing Library + user-event; `tests/interactions.test.tsx` (per-file `// @vitest-environment jsdom`) covers the About accordion (`aria-expanded` + `inert`), View Archive, Events Expand and Outreach Read More with click, Enter and Space. X4 is ticked in `docs/pending-tasks.md` (section, suggested order, checklist).
- **ESLint** (`118abab`): flat `eslint.config.js`, recommended configs only, `npm run lint` in CI and README. Real findings fixed: Header closes the menu during render instead of setState-in-effect (new Header test); useFetch drops redundant initial setState calls, and its "runs once" comment becomes a real disable with its reason; Events/Home memoise their `data ?? []` fallbacks; About case blocks get braces; an unused catch binding is removed. No other disables.
- **Dependencies** (`0f85a75`): in-range `npm update` (lockfile only): plugin-react 5.2.0, autoprefixer 10.6.2, postcss 8.5.32, react-router-dom 7.18.5, tailwindcss 3.4.19, @types/node 22.20.5. `npm audit`: 0 vulnerabilities. npm 10.9.0 did not hit the arborist bug.
- **Review fixes** (last commit): stale `useFetch` example, two-digit-date wording in the docs, `matchMedia` stub restored after its tests, this section.

### Deviations from the plan
- jsdom 28 and ESLint 9 instead of the latest majors: jsdom 29/30 and ESLint 10 need Node 22.13+/22.22+, but `engines` allows 22.12.
- `convertValue` was removed rather than kept beside the normalisers. They have to coerce JSON values anyway, and two converters would drift. Its test cases moved to `tests/normalize.test.ts`.
- Added a Header interaction test (not planned), because the lint fix changed how the menu closes.
- `npm ci` was verified on a clean `git archive` copy with the new lockfile, not in this checkout. A Vite dev server on port 3000 that predates this batch (not started by it, left running) locks `node_modules/@esbuild/win32-x64/esbuild.exe`. The first `npm ci` here failed with EPERM, and `npm install` restored `node_modules` from the unchanged lockfile. In the clean copy, `npm ci`, lint, typecheck, 140 tests and the build all passed.

### Verification
- `npm run lint`, `npm run typecheck`, `npm test` (8 files, 140 tests), `npm run build`: all exit 0; `git status` clean after the build.
- TDD: each new test was watched failing first. Mutations caught: `inert={false}` → 3 failures; removing the Header close → 1 failure; a broken `events.json` → contract tests fail.
- Browser (dev server): all 9 routes at 375 and 1440, light and dark. No horizontal overflow, every page shows its h1 and content, no stuck spinner. A text hash of each data view matched the pre-change baseline exactly: Home, Events (All), About Managing / Core (all expanded, archive open) / Past / Sr. No. sorted desc, DigitalOutreach. The console shows no errors and no new warnings. The mobile menu closes on browser Back and releases the scroll lock.
- Broken fallback row (`title` removed, one date `31/02/2026`): Events showed 7 of 9 cards, no load error, and one warning per bad row per fetch. Dev StrictMode fetches twice, so the dev console shows each warning twice. Reverted with `git checkout`.
- A fresh reviewer read the full diff: no Critical or Important findings.

### Deferred minors / left for later
The two open items below are tracked in `docs/pending-tasks.md` as X6 (numeric tags) and X5 (owner question).
- `textList` keeps only text items, so a numeric tag in JSON (`2024`) is dropped, while `text()` accepts numbers elsewhere. Sheets cells are always text and the contract test requires text tags, so nothing hits it today.
- Ids like `7a`/`7.5` and unpadded `2026-9-5` dates used to slip through and now skip the row (with a warning). This is intended: the docs now name the exact formats.
- **Question for the owner:** if a Sheets tab has rows but every row is dropped (e.g. a misspelt header), the section shows empty rather than the JSON fallback. Treating "all rows dropped" as a failure in `fetchWithFallback` would show the fallback instead. That is a product decision, so it is left as is.
- Next: Batch F (remaining design items).

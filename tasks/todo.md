# Batch D2: DigitalOutreach themes + remaining shared UI components

## Status: DONE (2026-10-29). Committed on `main` in eleven commits, not pushed. See Review below.

> **For agentic workers:** executed inline with superpowers:executing-plans; steps use `- [ ]` checkboxes.

**Goal:** One brand card style on DigitalOutreach (primary colour + category `Badge`), and the remaining repeated page patterns moved onto small shared components built only from DESIGN.md tokens.

**Architecture:** New primitives in `components/ui/` (`SectionHeader`, `IconTile`, `EmptyState`, `Stat`) and one hook (`hooks/useDisclosure.ts`). `Button` gains two on-colour variants (`onPrimary`, `onPrimaryOutline`, CSS in `index.css` like the other `.btn-*`) and a `disabled` state. Pages are migrated one per commit, with no layout or copy changes. DESIGN.md gets `components:` entries and a motion note.

**Tech stack:** React 19, Vite 7, Tailwind 3, Vitest 4 (node environment; component tests use `react-dom/server` `renderToStaticMarkup`, no new dependencies).

**Source:** session brief (Batch D2); `tasks/review-design.md` §4 DigitalOutreach, §6, §8 items 8/10/13/14; `tasks/review-maintainability.md` §C DigitalOutreach, §E; shared-UI deviations 5, 7, 8, 9 (`80bab57:tasks/todo.md`).
The previous contents of this file (the Batch D1 plan and its review) are preserved in git history at `0f37c22`.
Execution: inline on `main`, no worktree/branch/push; plan approval waived by the session that started this one.

---

## Global constraints
- Minimal, targeted changes. No copy changes, no layout restructuring, no Tailwind config changes.
- Only DESIGN.md tokens in new components (no raw hex, no off-scale radius/shadow).
- Heading outline unchanged: one h1 per page, no skipped levels.
- Keep Batch A a11y: About accordion stays APG (heading > button, `aria-expanded`, `aria-controls`, `inert` on the collapsed body).
- No `any`, no `@ts-ignore`. A build leaves `git status` clean. Don't commit `.claude/`.
- Each commit message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Decisions
- **`useDisclosure` hook instead of a `<Disclosure>` component.** The three disclosures share state, id and ARIA wiring but not markup: an accordion (heading + button, hidden body), and two "expand text" clamps whose panel stays partly visible. A hook removes the duplication without forcing one markup on all three. The accordion adds `inert` itself, since only a fully hidden panel should be inert.
- **`Stat` covers Home and Blog only.** Outreach "Impact" rows are a different pattern (label left, value right, inside a tinted tile), used once. Folding it in would add a layout mode for one caller. It gets the brand colour as part of the THEMES collapse instead.
- **`Stat` uses the light gradient ramp in dark mode** (`dark:from-primary-light dark:to-secondary-light`), as DESIGN.md asks. Labels use the `caption` style (bold, uppercase, `tracking-wide`).
- **`IconTile` follows the DESIGN.md spec** (`w-14 h-14 rounded-xl bg-primary/10`, fills `primary` on group hover). Used where the spec is already copied: Home features, Membership benefits, Contact info rows. Blog's two-tone tiles and the Events 40px meta-row icons are different patterns and stay.
- **`SectionHeader`** renders eyebrow + `h2` + lede with the h2 token (`text-3xl md:text-4xl font-extrabold`) and `text-lg` lede. About and Membership headers were `font-bold` with a `gray-500`/`text-base` lede; they now match Home.
- **`EmptyState`**: dashed card, optional icon circle, optional `h3` title, body text. About's committee empty state gains the dashed card that its past-presidents one already had.
- **On-colour buttons**: `onPrimary` (white, `primary` text) and `onPrimaryOutline` (`primary-dark` fill, white text, white/30 border), with a white focus ring offset against `primary`. They replace the two hand-rolled links in Home's CTA band. They are standard `.btn` size, so the band buttons lose their larger `px-8 py-4` and `hover:scale-105`.
- **Disabled `Button`**: `disabled` prop renders `<button disabled>` with a muted grey style. Used for "Registration Closed" (Events) and "Registrations Closed" (Outreach).
- **Events actions on `Button size="sm"`**: they become pills. External links get Button's external-link icon and "(opens in new tab)" text, so Read More's own icon and Register Now's arrow are dropped to avoid a double icon.
- **Outreach category**: `category` stays in the JSON as the Badge text. No style depends on the exact string any more. The badge sits on an opaque `card` backing, because Badge's dark fill is translucent and the image underneath varies.

## Review focus
1. **Dark mode over photos**: the Outreach category Badge must stay legible on any image. Checked with an in-page contrast measurement against its opaque backing.
2. **Keyboard on disclosures**: Enter and Space toggle, `aria-expanded` flips, a collapsed About body is skipped by Tab. Checked in the browser.
3. **Disabled actions**: "Registration Closed" is not focusable as a link and has no hover fill. Test: Button renders `<button disabled>`.
4. **Empty states**: an empty filter result on Events and About shows the shared component, and the heading outline stays valid. Checked in the browser with a no-match search.
5. **Narrow widths**: two-up Events buttons at `sm` and the Outreach badge at 375px must not overflow. Checked at 375/768/1440.

---

## Task 1: Shared primitives (TDD)
**Files:** create `components/ui/SectionHeader.tsx`, `IconTile.tsx`, `EmptyState.tsx`, `Stat.tsx`, `hooks/useDisclosure.ts`, `tests/ui.test.tsx`; modify `components/ui/Button.tsx`, `index.css`, `vite.config.ts`/test include if needed.

**Interfaces (produces):**
- `SectionHeader({ title: ReactNode; eyebrow?: string; lede?: ReactNode; align?: 'center' | 'left'; className?: string })`, always an `h2`.
- `IconTile({ children: ReactNode; className?: string })`, needs a `group` ancestor for the hover fill.
- `EmptyState({ icon?: IconName; title?: string; children?: ReactNode; className?: string })`. The title is an `h3`.
- `Stat({ value: string; label: string; size?: 'md' | 'lg' })`.
- `useDisclosure(initialOpen = false) → { open: boolean; toggle: () => void; panelId: string; triggerProps: { type: 'button'; onClick; 'aria-expanded': boolean; 'aria-controls': string } }`.
- `Button`: `variant` adds `'onPrimary' | 'onPrimaryOutline'`; new `disabled?: boolean` (only for the `<button>` branch).

- [x] Write `tests/ui.test.tsx` (static render): SectionHeader renders one `h2` and the eyebrow/lede only when given; EmptyState has no `h3` without a title; Stat shows value and label; Button `disabled` gives `<button … disabled` with `btn-disabled`; Button `onPrimary` uses `btn-on-primary`; a test component using `useDisclosure` renders `aria-expanded="false"` and `aria-controls` equal to the panel id.
- [x] Run `npm test`: fails (modules missing).
- [x] Implement; add `.btn-on-primary`, `.btn-on-primary-outline`, `.btn-disabled` to `index.css`.
- [x] `npm test` and `npm run typecheck` pass. Commit `feat(ui): add SectionHeader, IconTile, EmptyState, Stat, useDisclosure and on-colour/disabled Button`.

## Task 2: DigitalOutreach (one commit)
- [x] Delete `CardTheme`, `THEMES`, `getTheme`, the `theme` prop, every `isDarkCard` branch and the `featureIcon.replace(...)`.
- [x] Card shell → `Card padding="none" emphasis` (layout classes only). Subtitle, checks, stat values, Read More → `text-primary dark:text-primary-light`.
- [x] Floating pill → `Badge` with the initiative icon, on an opaque `bg-card-light dark:bg-card-dark` rounded backing; same corner as before.
- [x] Read More/Less → `useDisclosure`. "Registrations Closed" → `<Button disabled>`.
- [x] Commit `refactor(digital-outreach): one brand card style with a category Badge`.

## Task 3: Page migrations (one commit each)
- [x] **Home**: StatCard → `Card` + `Stat size="lg"`; FeatureCard tile → `IconTile`; three section headers → `SectionHeader`; no-events fallback → `EmptyState`; CTA band → `Button variant="onPrimary"` / `"onPrimaryOutline"`.
- [x] **About**: "What We Do", "Leadership & Structure", "Annual Reports & Governance" → `SectionHeader`; accordion and archive toggle → `useDisclosure` (accordion keeps `h3`, `inert`); the two "no match" messages outside the table → `EmptyState`.
- [x] **Events**: expand text → `useDisclosure`; in-card actions → `Button size="sm"` (outline/primary/outline/disabled); empty result → `EmptyState` with "Clear all filters" as `Button size="sm"`.
- [x] **Membership**: "Why Join CVOCA?" → `SectionHeader`; benefit tile → `IconTile`.
- [x] **Blog**: stats bar → `Stat size="md"` ×4 inside the existing Card.
- [x] **Contact**: InfoCard tile → `IconTile`.
- [x] `npm run typecheck` before each commit.

## Task 4: DESIGN.md
- [x] `npm run design:lint` before: **0 errors, 54 warnings** (53 orphaned tokens + the known `button-secondary` contrast).
- [x] Add `components:` entries: `card`, `card-dark`, `badge-primary`, `badge-success`, `badge-warning`, `badge-danger`, `icon-tile`, `icon-tile-hover`, `hero`, `hero-light`, `page`, `page-dark`, `button-primary-hover`, `button-on-primary`, `button-on-primary-outline`. Only values the code really uses.
- [x] Prose: list the new components; document `animate-fade-in-up` and `animate-float` (durations, use, reduced motion).
- [x] Lint after, record counts. Commit `docs(design): component tokens, on-colour buttons and motion`.

## Task 5: Verify
- [x] `npm run typecheck`, `npm test`, `npm run build`; `git status` clean.
- [x] Browser on the dev server: Home, About, Events, Membership, Blog, Contact, DigitalOutreach at 375/768/1440, light and dark: no horizontal overflow, console clean (apart from known Sheets errors), one h1 and no skipped heading levels.
- [x] In-page contrast check on migrated elements, especially every Outreach card text/badge pair.
- [x] Keyboard: accordion, archive toggle, Events Expand, Outreach Read More (Enter/Space, `aria-expanded`); Events buttons reachable, disabled one skipped.
- [x] After screenshots of DigitalOutreach (scratchpad only).

## Task 6: Review
- [x] Fresh reviewer subagent on the full diff (superpowers:requesting-code-review); fix Critical and Important findings.
- [x] Fill in the Review below; commit `docs: record Batch D2 in tasks/todo.md`.

---

## Review

### Commits (on `main`, not pushed)
1. `7fba2c0` docs: plan Batch D2 in tasks/todo.md
2. `36e58c3` feat(ui): add SectionHeader, IconTile, EmptyState, Stat, useDisclosure and on-colour/disabled Button
3. `b64505e` refactor(digital-outreach): one brand card style with a category Badge
4. `268b024` refactor(home)
5. `63ca412` refactor(about)
6. `4d26efb` refactor(events)
7. `18ceea4` refactor(membership)
8. `36cd465` refactor(blog)
9. `72f6b18` refactor(contact)
10. `f297706` docs(design): component tokens, on-colour buttons and motion
11. this record

### What changed visibly, per page
- **DigitalOutreach:** every card uses `primary` for the subtitle, check icons, stat values and Read More (`primary-light` in dark). The five emerald/violet/amber/blue/rose accents are gone. The category pill is a `Badge` (primary-50/700, dark primary-300) with the initiative icon, on an opaque card-coloured backing. It is smaller than the old `px-4 py-2` pill. The card no longer deepens its shadow on hover (it isn't clickable). "Registrations Closed" is a grey pill instead of a `rounded-xl` block.
- **Home:** stat labels are bold caption style, and dark-mode stat numbers use the light gradient ramp. The CTA band's "Join CVOCA Today" and "Contact Support" are standard-size pills (were `px-8 py-4` with `hover:scale-105`). "Contact Support" is solid `primary-dark` with a white/30 border (was `primary-dark/50` + blur). Both have a white focus ring.
- **About:** "What We Do", "Leadership & Structure" and "Annual Reports & Governance" headers are extrabold `text-3xl md:text-4xl` with a `text-lg` gray-600 lede (were bold `text-3xl`, gray-500 base-size lede). The committee no-match message is now a dashed empty-state card, like the past-presidents one. The archive toggle announces expanded/collapsed.
- **Events:** the card actions are pills. Add to Calendar and Read More are outline, Register Now is primary, Registration Closed is disabled grey. The three links show an external-link icon and "(opens in new tab)". Read More lost its own icon and Register Now its arrow. In narrow cards the two pills stack instead of wrapping their labels. Empty result: `py-16` (was `py-24`), bold title, small "Clear all filters" pill.
- **Membership:** "Why Join CVOCA?" header is extrabold with a `text-lg` lede. Benefit icon tiles are 56px `rounded-xl` `primary/10` (were 48px `rounded-2xl` `primary-50`).
- **Blog:** stats bar labels use `tracking-wide`; dark-mode numbers use the light gradient ramp.
- **Contact:** info-row icon tiles are 56px (were 48px).

### Deviations from the plan / brief
1. **Disclosure is a hook (`hooks/useDisclosure.ts`), not a component.** The three users share state and ARIA wiring but not markup. The About accordion keeps `h3 > button` and adds `inert` itself.
2. **`Stat` not used for the Outreach "Impact" rows.** They are a different pattern (label left, value right, inside a tile), used once. They got the brand colour instead.
3. **`IconTile` not used for Blog** (two tones, no hover) **or the Events meta rows** (40px, per-row hues). It was applied on Contact and Membership, where it changes the tile from 48px to 56px (noted by the reviewer). The plan wrongly said the spec was "already copied" there.
4. **Events actions row:** `grid sm:grid-cols-2` became `flex flex-wrap` with `flex-1 whitespace-nowrap` pills. In ~153px columns (1024 and 1440 widths) the pill labels wrapped onto two lines.
5. **Events empty state** picks up the shared styling (padding, bold title, small button), as listed above.
6. **Disabled button text** is gray-600 / gray-300 (6.9:1 / 7.0:1). Disabled controls are exempt from contrast rules, but the label stays readable.
7. **The Outreach "Read More" disclosure has no live data to exercise it:** all four descriptions are under 250 characters. It shares `useDisclosure` with Events, which was keyboard-tested.
8. **DESIGN.md has no entries for dark badges or the resting icon-tile fill.** Their fills are translucent tints that a colour token can't express. 38 orphan warnings remain.
9. `Container`/`Section` were skipped, as allowed.
10. The JSON `category` is kept as the Badge text only. No style or lookup depends on its exact value any more.

### Verification
- `npm run typecheck` exit 0; `npm test` 79/79 (13 new in `tests/ui.test.tsx`); `npm run build` exit 0; `git status` clean afterwards (only the untracked `.claude/`).
- `design:lint`: 0 errors / 54 warnings before, 0 errors / 39 warnings after (38 orphaned ramp shades + the known `button-secondary` contrast).
- Browser (built-in, dev server): Home, About, Membership, Events (default and "All events"), Blog, DigitalOutreach and Contact at 375, 768 and 1440 px, light and dark:
  - no horizontal overflow;
  - exactly one h1 and no skipped heading levels on every page;
  - no console errors or server errors.
- In-page contrast (computed colours, transitions disabled while measuring):
  - **Outreach:** no failures in either theme. Badge 6.16 (light) / 7.41 (dark), disabled button 6.87 / 7.03, stat values ≥ 4.87 (large text).
  - **Home CTA:** onPrimary 6.7, onPrimaryOutline 8.72. "Don't Miss Out" 4.95 / 7.02.
  - **Events buttons:** 5.17 to 11.82.
  - The only flagged elements are unmigrated text over gradients or photos, which the script can't measure: Home compliance card and outreach image pills, About featured report.
- Keyboard:
  - About accordion: Enter opens (`aria-expanded` true, body not inert), Space closes (inert again).
  - Archive toggle: Enter shows the grid, label "Hide Archive".
  - Events Expand: Enter switches to "Collapse", then Tab goes to "Add to Calendar".
  - Disabled "Registration Closed" is not focusable.
  - On-colour buttons show the white focus ring with a `primary` offset.
- Before/after DigitalOutreach screenshots (375 and 1440, light and dark) are in the session scratchpad only, not committed.
- Final review: fresh reviewer on `0f37c22..f297706`. Critical 0, Important 0, verdict "Ready to merge: Yes". The six minors are listed below.

### What's left
- Reviewer minors: fixed in a follow-up commit (2026-10-29):
  - CoordinatorPill hover is `hover:bg-gray-50 dark:hover:bg-slate-700/50`; the dead white/5 classes are gone.
  - `Button` props are a union: `disabled` only exists on the native-button form. A `@ts-expect-error` test pins this (RED on typecheck first).
  - DESIGN.md adds `button-disabled-dark`; lint is still 0 errors / 39 warnings.
  - The new IconTile hover-class test pins existing behaviour, so it passed on first run.
  - Toggle tests need jsdom (a new dev dependency). Moved to `docs/pending-tasks.md` as Developer X4.
  - Checks: typecheck 0, `npm test` 81/81, build 0, status clean; coordinator-link hover checked in the browser.
- Contrast items outside this batch: the Home compliance card (cyan/teal "View Deadlines" ≈ 2.4:1), the off-brand Events meta tiles (rose/emerald) and fallback gradients, and the Outreach page background `dark:bg-slate-950`.
- Recorded follow-up: expose type tokens in Tailwind and restrict `borderRadius` to the four-step scale (review §8 item 10). This was out of scope here.
- `.claude/launch.json` stays untracked.

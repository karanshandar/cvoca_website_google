# Batch D2: DigitalOutreach themes + remaining shared UI components

## Status: IN PROGRESS (2026-10-28)

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

- [ ] Write `tests/ui.test.tsx` (static render): SectionHeader renders one `h2` and the eyebrow/lede only when given; EmptyState has no `h3` without a title; Stat shows value and label; Button `disabled` gives `<button … disabled` with `btn-disabled`; Button `onPrimary` uses `btn-on-primary`; a test component using `useDisclosure` renders `aria-expanded="false"` and `aria-controls` equal to the panel id.
- [ ] Run `npm test`: fails (modules missing).
- [ ] Implement; add `.btn-on-primary`, `.btn-on-primary-outline`, `.btn-disabled` to `index.css`.
- [ ] `npm test` and `npm run typecheck` pass. Commit `feat(ui): add SectionHeader, IconTile, EmptyState, Stat, useDisclosure and on-colour/disabled Button`.

## Task 2: DigitalOutreach (one commit)
- [ ] Delete `CardTheme`, `THEMES`, `getTheme`, the `theme` prop, every `isDarkCard` branch and the `featureIcon.replace(...)`.
- [ ] Card shell → `Card padding="none" emphasis` (layout classes only). Subtitle, checks, stat values, Read More → `text-primary dark:text-primary-light`.
- [ ] Floating pill → `Badge` with the initiative icon, on an opaque `bg-card-light dark:bg-card-dark` rounded backing; same corner as before.
- [ ] Read More/Less → `useDisclosure`. "Registrations Closed" → `<Button disabled>`.
- [ ] Commit `refactor(digital-outreach): one brand card style with a category Badge`.

## Task 3: Page migrations (one commit each)
- [ ] **Home**: StatCard → `Card` + `Stat size="lg"`; FeatureCard tile → `IconTile`; three section headers → `SectionHeader`; no-events fallback → `EmptyState`; CTA band → `Button variant="onPrimary"` / `"onPrimaryOutline"`.
- [ ] **About**: "What We Do", "Leadership & Structure", "Annual Reports & Governance" → `SectionHeader`; accordion and archive toggle → `useDisclosure` (accordion keeps `h3`, `inert`); the two "no match" messages outside the table → `EmptyState`.
- [ ] **Events**: expand text → `useDisclosure`; in-card actions → `Button size="sm"` (outline/primary/outline/disabled); empty result → `EmptyState` with "Clear all filters" as `Button size="sm"`.
- [ ] **Membership**: "Why Join CVOCA?" → `SectionHeader`; benefit tile → `IconTile`.
- [ ] **Blog**: stats bar → `Stat size="md"` ×4 inside the existing Card.
- [ ] **Contact**: InfoCard tile → `IconTile`.
- [ ] `npm run typecheck` before each commit.

## Task 4: DESIGN.md
- [ ] `npm run design:lint` before: **0 errors, 54 warnings** (53 orphaned tokens + the known `button-secondary` contrast).
- [ ] Add `components:` entries: `card`, `card-dark`, `badge-primary`, `badge-success`, `badge-warning`, `badge-danger`, `icon-tile`, `icon-tile-hover`, `hero`, `hero-light`, `page`, `page-dark`, `button-primary-hover`, `button-on-primary`, `button-on-primary-outline`. Only values the code really uses.
- [ ] Prose: list the new components; document `animate-fade-in-up` and `animate-float` (durations, use, reduced motion).
- [ ] Lint after, record counts. Commit `docs(design): component tokens, on-colour buttons and motion`.

## Task 5: Verify
- [ ] `npm run typecheck`, `npm test`, `npm run build`; `git status` clean.
- [ ] Browser on the dev server: Home, About, Events, Membership, Blog, Contact, DigitalOutreach at 375/768/1440, light and dark: no horizontal overflow, console clean (apart from known Sheets errors), one h1 and no skipped heading levels.
- [ ] In-page contrast check on migrated elements, especially every Outreach card text/badge pair.
- [ ] Keyboard: accordion, archive toggle, Events Expand, Outreach Read More (Enter/Space, `aria-expanded`); Events buttons reachable, disabled one skipped.
- [ ] After screenshots of DigitalOutreach (scratchpad only).

## Task 6: Review
- [ ] Fresh reviewer subagent on the full diff (superpowers:requesting-code-review); fix Critical and Important findings.
- [ ] Fill in the Review below; commit `docs: record Batch D2 in tasks/todo.md`.

---

## Review
_(filled in at the end)_

# Shared UI Components from DESIGN.md Tokens

## Status: APPROVED (2026-10-25). In progress.

Source: `tasks/review-design.md` §6 (component inventory), §7 (a11y audit) and §8 items 4, 7 and 12.
Branch: work directly on `main` (as requested). One commit per step below. Nothing is pushed.

> The previous contents of this file (the completed quick-wins plan and its review) are preserved in git history at `a139539`.

---

## Scope

**Build six primitives** in a new `components/ui/` folder (already covered by the Tailwind `content` glob):

| Primitive | Replaces | Main fixes it brings |
|---|---|---|
| `PageHero` | 8 hand-built heroes | One hero pattern; reports its tone to the Header, which replaces `darkHeroPaths` |
| `Card` | ~25 card shells | One radius (`rounded-2xl`), `card-*` tokens, hover lift only when clickable |
| `Button` | ~20 hand-rolled CTAs + `.btn-*` | One shape, focus ring, external-link icon and sr-only "(opens in new tab)" |
| `Badge` | 6+ pill badges | `caption` size instead of `text-[10px]`, brand/status tones with dark variants |
| `Modal` | 2 diverging image lightboxes | `role="dialog"`, `aria-modal`, focus trap, Escape, focus restore |
| `SearchInput` | 3 search fields | Required accessible label, consistent styling |

**Out of scope** (other review items, separate plans): `SectionHeader`, `Container`, `IconTile`, `Stat`, `EmptyState`, `Disclosure`; the site-wide contrast and heading sweeps; the DigitalOutreach `THEMES` collapse (§8 #8); `prefers-color-scheme` (§8 #9); Tailwind config changes (§8 #10); content fixes (Privacy "Last Updated", Blog stats).

**Migration rule:** in each page, replace only the hero, card shells, buttons, badges, search inputs and modals with the primitive. No layout restructuring, no copy changes. Elements that move onto a primitive pick up its token colours, radius and dark variants. That fixes the contrast and off-brand findings *on those elements*. Everything else on the page stays as it is.

### Token whitelist (what primitives may use)
- **Colours:** the `tailwind.config.js` tokens (`primary-*`, `secondary-*`, `accent-*`, `success-*`, `warning-*`, `danger-*`, `background-*`, `text-*`, `card-*`), plus the grays DESIGN.md names (`gray-100`/`gray-700` borders, `gray-900`/white headings, `gray-600`/`gray-400` body), plus `white`/`black` with opacity for overlays.
- **Radius:** `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-full` only.
- **Shadow:** `shadow-sm` to `shadow-2xl` only, no coloured shadows.
- **Type:** Inter; `caption` = `text-xs font-bold uppercase tracking-wide`; no `text-[10px]`, `font-black` or `font-serif`.
- **Motion:** `transition-*`, `-translate-y-1`, and the existing `animate-fade-in-up`/`animate-float`. The reduced-motion rule in `index.css` already neutralises all of it.

### Verification (every commit)
There is no test runner yet (Vitest is a deferred plan), so each commit is checked by:
1. `npm run typecheck` and `npm run build` pass.
2. Dev server, built-in browser: the changed page(s) at 375, 768 and 1440 px, in light and dark mode. No horizontal overflow and no console errors (apart from the known Sheets 400s with no API key).
3. Header readable at the top of the page, after scrolling, and with the mobile menu open.
4. In-page contrast check on the migrated elements: text ≥ 4.5:1 (≥ 3:1 for large text).
5. Keyboard pass: Tab order and a visible focus ring. For modals: focus moves in, Tab stays inside, Escape closes, focus returns to the trigger.

---

## Step 1 — Build the primitives (one commit, no page changes)

All files are new and nothing imports them yet, so the site is unchanged after this commit.

- [x] `components/ui/Button.tsx`
  - Props: `variant: 'primary' | 'secondary' | 'outline'` (the three DESIGN.md defines), `size: 'md' | 'sm'`, plus one of `to` (renders router `<Link>`), `href` (renders `<a>`) or neither (renders `<button type="button">`).
  - Built on the existing `.btn-primary/secondary/outline` classes, so there is one source of truth. `sm` = `px-4 py-2 text-sm min-h-11` (keeps the 44 px tap target).
  - When `target="_blank"`: add `rel="noopener noreferrer"`, the `external-link` icon and sr-only "(opens in new tab)".
  - `index.css`: `.btn-outline` uses `bg-card-light dark:bg-card-dark` instead of `bg-white dark:bg-slate-800` (same colours, tokenised). Add `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2` to all three `.btn-*` classes.
- [x] `components/ui/Card.tsx`
  - Props: `as` (`div` default, also `article`, `section`, `li`), `padding: 'none' | 'md' | 'lg' | 'xl'` (DESIGN spacing: `md` = `p-4`, `lg` = `p-6`, `xl` = `p-8`; default `lg`), `emphasis` (`shadow-xl` instead of `shadow-lg`), `interactive`, `className` (layout only, e.g. grid/flex).
  - Base: `bg-card-light dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-700 shadow-lg`.
  - `interactive`: `transition hover:-translate-y-1 hover:shadow-2xl hover:border-primary/30`. Use it only when the whole card is clickable (fixes the Events "false lift" finding).
- [x] `components/ui/Badge.tsx`
  - Props: `tone: 'primary' | 'success' | 'warning' | 'danger' | 'neutral'`, `children`.
  - Base: `inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide border shadow-sm`.
  - Tones, light then dark: primary `bg-primary-50 text-primary-700` / `bg-primary-900/30 text-primary-300`; success `bg-success-50 text-success-700` / `bg-success/20 text-success-light`; warning and danger follow the success pattern; neutral `bg-gray-100 text-gray-700` / `bg-gray-700 text-gray-200`. Check each pair against 4.5:1 during the step.
- [x] `hooks/useFocusTrap.ts`
  - `useFocusTrap(ref, active)`. While `active`: remember `document.activeElement`, focus the first focusable element in `ref`, keep Tab and Shift+Tab inside. On deactivate, restore focus to the remembered element.
  - A separate hook so the Header mobile menu can reuse it in Step 12.
- [x] `components/ui/Modal.tsx`
  - Props: `open`, `onClose`, `label` (becomes `aria-label`), `children`.
  - Renders through `createPortal` into `document.body`, so transformed ancestors (e.g. hover-lifted cards) can't clip it.
  - `role="dialog"`, `aria-modal="true"`, `useFocusTrap`, Escape closes, a backdrop click closes, body scroll lock (the same `overflow` approach the current modals use).
  - Overlay `fixed inset-0 z-[100] bg-background-dark/95`, and a built-in 44 px close button with `aria-label="Close"`.
- [x] `components/ui/ImageLightbox.tsx`
  - A small wrapper on `Modal` for the image, the "Open full size" link and the hint. Events and DigitalOutreach each have their own diverging copy of this exact UI today.
  - Props: `imageUrl` (`string | null`), `alt`, `onClose`. Keeps the existing `getOptimizedImageUrl(…, LARGE)` call.
- [x] `components/ui/SearchInput.tsx`
  - Props: `label` (required; rendered as an sr-only `<label>` tied to the input by a `useId` id), `value`, `onChange(value: string)`, `placeholder`, `className` (width only).
  - `type="search"`, search icon `aria-hidden`, `rounded-lg` (the DESIGN.md radius for inputs), `bg-card-light dark:bg-card-dark`, `placeholder:text-gray-500`, and the same `focus-visible:ring-primary/50` the current fields use.
- [x] `components/ui/PageHero.tsx`
  - Props: `title` (ReactNode, so a gradient `<span>` can be passed), `eyebrow?`, `lede?`, `tone: 'dark' | 'light'` (default `dark`), `size: 'default' | 'large'` (`large` is Home's taller hero, with room for the overlapping stats), `children?` (e.g. Home's CTAs).
  - Dark: `bg-background-dark` (the same value as `slate-900`), two blur blobs in `primary/10` and `secondary/10` (this drops the `accent` and `purple-500` blobs), white `h1`, lede `text-gray-300`. Eyebrow: the existing white/10 chip with `caption` type.
  - Light (Privacy only): `bg-primary-50 dark:bg-background-dark`, `text-gray-900 dark:text-white`.
  - Reports its tone to the Header (Step 2).
- [x] `typecheck` and `build` pass. Commit: `feat(ui): add shared Button, Card, Badge, Modal, SearchInput and PageHero`.

## Step 2 — Hero tone context (one commit)

- [ ] `components/ui/heroTone.tsx`: `HeroToneProvider` holds `tone: 'dark' | 'light' | null`. `useSetHeroTone(tone)` sets it in a `useLayoutEffect` (before paint, so no flash) and resets it to `null` on unmount. `useHeroTone()` reads it.
- [ ] `PageHero` calls `useSetHeroTone(tone)`.
- [ ] `App.tsx`: wrap `Header` and `main` in `HeroToneProvider`.
- [ ] `Header.tsx`: `isDarkHero = heroTone ? heroTone === 'dark' : darkHeroPaths.includes(location.pathname)`.
  - The list stays as a **temporary fallback** so pages not yet migrated keep working. Step 12 deletes it once every page uses `PageHero`.
- [ ] Verify: no visual change on any route. Commit: `feat(header): read hero tone from PageHero, with path list as fallback`.

## Steps 3–11 — Migrate one page per commit

Ordered from smallest to largest, so the primitives are proven on simple pages first. Each commit is `refactor(<page>): use shared UI components`.

- [ ] **3. NotFound** — `Button to="/"`. The h1 gets `font-extrabold` (DESIGN h1). Add `pt-24` so the fixed header can't cover it on short landscape phones. Also move `LoadError` and `ErrorBoundary` to `Button` in this commit: they are the other two `.btn-*`/hand-rolled users and are tiny.
- [ ] **4. PrivacyPolicy** — `PageHero tone="light"`. This is the first test of the light tone with the context. The "Last Updated" date is out of scope and stays as it is.
- [ ] **5. Contact** — `PageHero` (eyebrow, gradient span in the title). Info and map cards → `Card` (`rounded-3xl` → `rounded-2xl`).
- [ ] **6. Blog** — `PageHero`. Post cards → `Card interactive` (the whole card is a link). "Start Reading" and "Search the archives" → `Button`. Category pills → `Badge`.
- [ ] **7. Membership** — `PageHero` (the hero seam overlay goes away with it, §4 Membership). Tier and benefit cards → `Card` (`rounded-[2.5rem]`, `rounded-[2rem]` and `rounded-3xl` → `rounded-2xl`). Register CTAs → `Button` (see open question 2). The eligibility note's `orange-*` → `warning-*` tokens.
- [ ] **8. Home** — `PageHero size="large"`, with the two CTAs as `Button` children (see open question 3). StatCard, FeatureCard, event and outreach card shells → `Card`. Event committee and cost pills → `Badge` (`text-[10px]` → `text-xs`). Remove the nested `<button>` inside the `<a>` (render the pill as a `<span>`), since that element is being replaced anyway. The `font-serif` quote and the compliance card's palette aren't part of these primitives, so they stay.
- [ ] **9. Events** — `PageHero` (keeps the `timeFilter`-aware title). Event card shell → `Card`, not `interactive`, because the card isn't clickable. Committee and cost pills → `Badge`. Search → `SearchInput label="Search events"`, and the three filter `<select>`s get the same `rounded-lg` so the row matches. Lightbox → `ImageLightbox`; the clickable flyer `<div>` becomes a `<button aria-label="View flyer for {title}">`. Delete the local `ImageModal`.
- [ ] **10. About** — `PageHero`. Heritage, report, service and committee cards → `Card`. The two searches → `SearchInput` (labels "Search committees or members" and "Search past presidents"). Report and status pills → `Badge` (the emerald badge → `success`).
- [ ] **11. DigitalOutreach** — `PageHero`. CTAs → `Button` (this removes the 2.15:1 white-on-amber "Register Now"). Lightbox → `ImageLightbox` with a keyboard-operable trigger `<button>`. Delete the local `ImageModal`. The `THEMES` card styling stays until the separate THEMES plan, so its cards are **not** moved to `Card` here.

## Step 12 — Header cleanup (one commit)

- [ ] Delete `darkHeroPaths` and the fallback: `isDarkHero = heroTone === 'dark'`. Any screen without a `PageHero` (NotFound, loading and error states) now gets the dark-text header. That fixes the "white header text on the full-page spinner/error" limitation from the quick-wins review.
- [ ] Mobile menu: `useFocusTrap` so Tab stays inside the open menu (deferred from quick-wins Phase 5). The trap must include the header's close button, so either the ref goes on a wrapper around both the header bar and the overlay, or the overlay gets its own close button. I'll pick whichever is the smaller diff while implementing.
- [ ] Verify every route at 375 and 1440 px, light and dark: the header is readable at the top, after scrolling, with the menu open, during a slow load (throttled network), and in an error state (blocked `/data/*.json`).
- [ ] Commit: `refactor(header): take hero tone only from PageHero; trap focus in mobile menu`.

## Step 13 — Docs (one commit)

- [ ] `DESIGN.md` Components section: one short paragraph pointing to `components/ui/*` as the implementation of the button, card, badge and hero patterns, and saying new UI should use them.
- [ ] Fill in the Review section below: commits, what changed visibly on each page, deviations, and what's left.
- [ ] Commit: `docs: record shared UI components work in tasks/todo.md`.

---

## Open questions — decided 2026-10-25: all three recommendations accepted

1. **Hero heading size.** DESIGN.md says h1 → `text-4xl md:text-5xl`, but the pages use `md:text-6xl` (Home `md:text-7xl`). Recommendation: follow DESIGN.md (`text-4xl md:text-5xl`, and `md:text-6xl` for Home's `large` hero). Alternative: keep today's sizes and update DESIGN.md instead.
   **Decision: follow DESIGN.md.**
2. **The Membership student-tier CTA uses `secondary` cyan** (3.68:1, the documented caveat). Recommendation: switch both Register CTAs to `primary`, and keep the tiers distinct through each card's Badge and heading. Alternative: keep `secondary`, as the brand caveat allows.
   **Decision: both Register CTAs use `primary`.**
3. **Home's glass "About CVOCA" hero button** (white/10 on dark) has no DESIGN.md variant. Recommendation: use `variant="outline"` (a white card surface), which is a visible change. Alternative: add a fourth `onDark` variant to `Button` and document it in DESIGN.md.
   **Decision: use `variant="outline"`.**

---

## Review

_To be filled in when the work is done._

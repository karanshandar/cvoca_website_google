# Batch A: accessibility and markup fixes

## Status: DONE (2026-10-28). Tasks 1–7 committed on `main` in one commit, not pushed. See Review below.

Source: the pending-items summary of `tasks/review-design.md` §4, §5, §7 and §8 items 3, 5, 6, 11 and 12 (the parts not already done by the quick-wins and shared-UI plans).
The previous contents of this file (the shared UI components plan and its review) are preserved in git history at `80bab57`.
Execution: inline (superpowers:executing-plans), as the user asked; plan approval was waived by the user.

---

## Global constraints
- No layout restructuring and no copy changes. Every change is a class, an attribute, a tag swap or a tiny helper.
- Colours from DESIGN.md tokens only (`primary-*`, `secondary-*`, `danger*`, grays). Radius `rounded-lg/xl/2xl/full` only. No `text-[10px]`, `font-black` or `font-serif`.
- Out of scope: Batches B, C and D (privacy policy, SEO, config, dead code, docs, THEMES collapse, prerendering), content questions, anything needing client accounts.

## Review

### What changed
- **Headings:** every route now has one `h1` and no skipped levels (checked by script on all 9 routes, light and dark, at 375/768/1440 px). Home "President's Communication" → `h2`; Membership gets an sr-only "Membership plans" `h2`; Blog cards → `h2`; DigitalOutreach subtitle → `p`, title → `h2`, "Key Highlights"/"Impact" → `h3`; About member names, archive titles and mobile past-president names → `h3`, committee role labels → `h4`; Footer gets an sr-only "Footer" `h2`.
- **Markup:** About `ServiceCard` renders real `<li>`s (takes `items`); the accordion follows the APG pattern (`<h3><button>`), with only phrasing content inside the button.
- **Keyboard/ARIA:** the Past Presidents headers are `<button>`s inside `<th aria-sort>` (new module-level `SortableHeader`, which also removes the `SortIcon` that was redefined on every render). Accordion, Events "Expand" and Outreach "Read More" have `aria-expanded`/`aria-controls`; the collapsed accordion body is `inert`.
- **Contrast:** `text-primary` text and meaningful icons get `dark:text-primary-light` (About, Blog, Events, Home, Membership, NotFound); small light-mode `text-gray-400` labels → `text-gray-500 dark:text-gray-400`; Blog "Community Contribution" → `secondary-700`; Events month and "Clear" → `danger` tokens; Home CTA paragraph `blue-100` → `primary-50` (4.24 → ~4.9:1); Outreach coordinator chip gets dark variants.
- **Leftovers:** `animate-fadeIn` removed (7 pages); `text-[10px]`/`text-[0.6rem]` → `text-xs` (10 places); `font-black` → `font-extrabold`; `font-serif` removed from the Home quote; `rounded-3xl`/`rounded-[2.5rem]` → `rounded-2xl` (7 places); `aria-hidden` on the 5 inline SVGs.
- **Logo:** new `alt` prop; Header and Footer pass `alt=""`; the auto-switch dark image is always `alt="" aria-hidden`. The Header logo link is labelled "CVOCA home".
- **Contact/Footer:** new `utils/contactLinks.ts` (`getContactHref`) gives `tel:+919167928622` and `mailto:info@cvoca.org`; both lists are wrapped in `<address>`. Footer social icons are 44×44; footer text links are 28 px tall.
- **Header:** theme and menu toggles are 44×44; the theme toggle says "Switch to dark/light mode"; nav links and the logo link get the `ring-primary` focus ring; the header only transitions background, border, shadow and padding; `scroll-padding-top: 6rem` on `html`.

### Rulings (deviations from the plan)
1. **Header root-cause fix (not in the plan).** `textColorClass.includes('text-white')` was also true for the default `"text-gray-900 dark:text-white"`. So the header always showed the white-text logo, and on light-hero pages (Privacy, and 404 at the top) the desktop nav links were `text-white/80` on a light background. `HeaderLogo` and `NavLinks` now take the `onDarkHero` boolean. When not over a dark hero, the logo follows the site theme. Cost if wrong: one prop, easy to revert.
2. **Footer text links: 28 px, not 44 px.** Making each Quick Link 44 px tall would almost double the column height (a layout change). `inline-block py-1` meets WCAG 2.5.8 AA (24 px). The social icons (icon-only) are 44 px.
3. **`animate-fadeIn` removed rather than mapped to `animate-fade-in-up`:** mapping would add a new entrance animation to every page root.
4. **Home CTA `blue-100` → `primary-50`:** not named in the plan, but it was the only remaining text-contrast failure outside the THEMES colours, and it is a one-class token swap.
5. **Events "Clear" kept its `red-*` backgrounds;** only the text moved to `danger-700`/`danger-light`. The dark `danger/20` background looked different from `red-900/20`.
6. **Execution on `main` with no worktree or ledger workspace,** as the user asked; rulings are recorded here instead.
7. **Final review was a self-review** (diff read in full by the author), not a fresh reviewer.

### Verification
- `npm run typecheck` and `npm run build` pass (sitemap restored after each build).
- In-page audit script on all 9 routes (`/`, `/about`, `/membership`, `/events`, `/blog`, `/digital-outreach`, `/contact`, `/privacy-policy`, a 404), light and dark, at 375, 768 and 1440 px: no heading skips, no horizontal overflow. The contrast scan (text vs computed background, header excluded) is clean in dark mode. In light mode it only reports the DigitalOutreach THEMES accents (Batch D) and a false positive (white chip text over a photo on Home).
- Header: correct text, logo and link colours on `/` (dark hero), `/privacy-policy` (light hero) and 404, in both themes. Toggles measured at 44×44 at 375 px. Mobile menu open in light and dark: logo, close button and links visible.
- Keyboard: Past Presidents sort button sorts with Enter, `aria-sort` moves, focus stays. Accordion opens with Space, `aria-expanded` → true, `inert` cleared. Events Expand toggles with Enter (`aria-expanded` true, label "Collapse").
- Footer: social icons 44×44, links 28 px, `tel:`/`mailto:` hrefs correct, logo images `alt=""`.
- Console: only the expected Sheets 400s (no API key locally); no React warnings.
- **Not verified in the browser:** the Outreach "Read More" button. No current description is over 250 characters, so it never renders. Covered by the type checker and by reading the code.

### What's left
- DigitalOutreach THEMES accent colours (amber/emerald text at 2.06–3.77:1) wait for the THEMES collapse (Batch D).
- Home "Learn more" links have identical text (Lighthouse `link-text`); an `aria-label` per card is a one-line follow-up.
- Footer Quick Links and Contact/Footer contact links use the browser's default focus outline rather than the branded ring.
- Batches B, C and D from the pending-items summary.

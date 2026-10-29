# Batch F: brand colours, small a11y fixes, mobile density, Tailwind scales, X6

## Status: DONE (2026-10-29). Committed on `main` in 13 commits, not pushed. See Review below.

The Batch E plan and review that lived here are preserved in git history at `029eef0` (`git show 029eef0:tasks/todo.md`).

**Goal:** close the remaining design-review items that need no client access: off-brand colours and contrast, two small a11y gaps, mobile density on Events/About/Contact, the Tailwind type and radius scales (review-design §8 #10), and pending task X6.

**Approach:** one page/area per commit, smallest change that fixes each item, brand tokens only (DESIGN.md). TDD for logic (X6, the Events filter count). Desktop layouts stay as they are unless noted.

**Spec:** the Batch F brief, `tasks/review-design.md` §4 (Home, Events, DigitalOutreach, Contact, About), §5 Footer, §8 items 10, 13 and 14; `docs/pending-tasks.md` X6.

## Global constraints
- No copy changes; no client-dependent items (X5, Google/Render); no build-time Sheets fetch; no major upgrades.
- Colours only from DESIGN.md tokens; text ≥ 4.5:1, large text and icons ≥ 3:1, in light and dark.
- Keep the named exports and `aria-expanded`/`inert` wiring used by `tests/interactions.test.tsx`.
- `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` pass; `git status` clean after a build; `.claude/` never committed; no push.

## Decisions
- **Events meta tiles:** Time, Location and Entry Fee all use the primary tile. DESIGN.md reserves success/danger for status, and a location or a price isn't a status.
- **Events fallback gradients:** six blends of `primary`, `secondary` and one `accent`, each dark enough for the white initial (large text, ≥ 3:1).
- **Flyers:** blurred backdrop of the same image behind `object-contain`. Flyers carry dates, prices and QR codes near the edges, so `object-cover` would crop content. The backdrop reuses the same URL (no extra request) and is `aria-hidden`.
- **Filters disclosure:** the button reads "Filters" with " (n)" only when n > 0 (n = time/organizer/tag filters away from their default; search stays visible and isn't counted). The panel uses `md:contents`, so at `md`+ the three selects sit in the existing grid exactly as before.
- **Page backgrounds:** DigitalOutreach, About and Contact all move to the DESIGN.md `page` pair `bg-background-light dark:bg-background-dark` (About/Contact used `bg-gray-50`, visually identical).
- **Learn more:** sr-only text ("about {title}") rather than `aria-label`, so the visible text stays the start of the accessible name (WCAG 2.5.3).
- **Radius:** `theme.borderRadius` is replaced (not extended) with `none`, `DEFAULT` (focus-ring corners), `lg`, `xl`, `2xl`, `full`. `rounded-md` (About Core count chip) moves to `rounded-lg`.
- **Type tokens:** `theme.extend.fontSize` gets `h1`, `h2`, `h3`, `body-lg`, `body-md`, `body-sm`, `caption` with the line heights of their Tailwind equivalents and DESIGN.md weights. No page migration in this batch.

## Review focus
1. Events at `md`+ must look exactly as before (selects in the 4-column grid, no Filters button).
2. Below `md`, a collapsed panel must be out of the tab order and the accessibility tree (`hidden`), and the count must follow every select.
3. Removing radius keys must not silently drop a class: every `rounded*` class in the source must appear in the built CSS.
4. A flyer that fails to load must not show two broken-image icons (backdrop is decorative, `alt=""`).
5. Dark mode for every recoloured element (compliance card, meta tiles, Clear button, gradients).

---

## Task 1: X6 numeric tags (TDD)
**Files:** `utils/normalize.ts` (`textList`), `tests/normalize.test.ts`, `docs/pending-tasks.md`.
- [x] Test `keeps numeric tags as text`: `toEvent({ ...event, tags: ['GST', 2024, '', null] })?.tags` → `['GST', '2024']`.
- [x] Run: fails (2024 dropped).
- [x] `textList` maps items through `text()` and drops `undefined`, then trims and drops blanks.
- [x] Run: passes. Tick X6 (section, suggested order row, checklist).
- [x] Commit `fix(data): keep numeric event tags as text (Batch F, X6)`.

## Task 2: Home colours and "Learn more" names
**Files:** `pages/Home.tsx`.
- [x] Compliance card: `primary-50 → secondary-50` surface (dark `primary-900/30 → secondary-900/30`), `primary-100`/`primary-800` borders, hover `border-primary/30`; `Badge` for "Monthly Resource"; icon and eyebrow `primary-700`/`primary-300`; title hover `primary-700`/`primary-light`; "View Deadlines" pill `bg-primary hover:bg-primary-dark text-white` (5.17:1) `rounded-full`. Add the branded focus ring to the card link.
- [x] President strip: `cyan-50`/`blue-50`/`cyan-100` → `secondary-50`/`primary-50`/`secondary-100` (same hex values, now tokens).
- [x] Each "Learn more": `<span className="sr-only"> about {title}</span>`.
- [x] Commit `fix(home): brand compliance card, named Learn more links (Batch F)`.

## Task 3: Events colours, filters disclosure, flyers
**Files:** `pages/Events.tsx`, `tests/interactions.test.tsx`.
- [x] Test `Events filters disclosure` (jsdom, `fetchWithFallback` mocked): the "Filters" button has `aria-expanded="false"` and controls the panel holding the organizer select; Enter/Space toggle it; choosing an organizer makes the name "Filters (1)".
- [x] Run: fails (no button).
- [x] `useDisclosure` for the panel; button `md:hidden` with the count; panel `hidden|grid grid-cols-1 gap-6 md:contents`.
- [x] Meta tiles → primary tile; gradients → brand; "Clear" → `danger-50`/`danger-100`, dark `danger/20`/`danger/30`.
- [x] Flyer: `aria-hidden` blurred `object-cover` copy behind the `object-contain` image.
- [x] Run tests: pass. Commit `feat(events): mobile filters disclosure, brand tiles, flyer backdrop (Batch F)`.

## Task 4: About mobile committee grid; page backgrounds
**Files:** `pages/About.tsx`, `pages/Contact.tsx`, `pages/DigitalOutreach.tsx`.
- [x] About managing grid: `grid-cols-2 gap-4 sm:gap-8`, card `padding="md"` + `sm:p-6`, avatar `w-20 h-20 sm:w-28 sm:h-28`, name `text-base sm:text-lg`, `break-words`.
- [x] Page wrappers → `bg-background-light dark:bg-background-dark` (About, Contact, DigitalOutreach).
- [x] Contact map: `aspect-[4/3] lg:aspect-auto lg:min-h-[400px]`.
- [x] Commits: `feat(about): compact 2-column committee grid on phones (Batch F)`; `fix(contact,outreach): page background pair, map aspect ratio (Batch F)`.

## Task 5: Footer focus rings
**Files:** `components/Footer.tsx`.
- [x] One `LINK_CLASS` constant with `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:rounded` for Quick Links, legal links and `tel:`/`mailto:` links (Contact's info links already have it).
- [x] Commit `fix(footer): branded focus ring on text links (Batch F)`.

## Task 6: Tailwind scales
**Files:** `tailwind.config.js`, `pages/About.tsx` (`rounded-md`), `DESIGN.md`.
- [x] Inventory every `rounded*` class; replace `borderRadius`; add `fontSize` tokens.
- [x] Build; check each used radius class and a scratch `text-h1 … text-caption` compile; check `rounded-md`/`rounded-3xl` no longer compile.
- [x] DESIGN.md: note the `text-h1…text-caption` utilities and the restricted radius scale.
- [x] Commit `chore(tailwind): type tokens as fontSize, radius limited to the scale (Batch F)`.

## Task 7: Verify, review, record
- [x] lint / typecheck / test / build; `git status` clean.
- [x] Browser at 375/768/1440, light and dark, on Home, Events, About, Contact, DigitalOutreach (+ footer): overflow, console, heading outline.
- [x] In-page contrast on every recoloured element; keyboard pass (Filters, footer/contact rings, Learn more names).
- [x] Before/after screenshots (scratchpad only).
- [x] Fresh reviewer on the full diff; fix Critical/Important; fix or record minors.
- [x] Review section below; `docs/pending-tasks.md`; commit `docs: record Batch F`.

## Review

### What changed (commits on `main`, oldest first)
- `f4de572` Plan (this file; Batch E's version is at `029eef0`).
- `2548cc6` **X6:** `textList` runs each item through `text()`, so a numeric tag (`2024`) is kept as `"2024"`. New case in `tests/normalize.test.ts`; X6 ticked in `docs/pending-tasks.md` (section, suggested order, checklist).
- `f9f1cdd` **Home:** compliance card on primary tokens. "View Deadlines" is white on `primary` (5.17:1, was ~2.4:1), `rounded-full` like the other buttons, darkening on card hover. "Monthly Resource" uses `Badge`. The card link gets the branded focus ring. The president strip's `cyan-50`/`blue-50`/`cyan-100` become `secondary-50`/`primary-50`/`secondary-100` (same hex, no visible change). Each "Learn more" link's name is now "Learn more about {initiative}".
- `3b4d6ea` **Events:** below `md`, a "Filters (n)" disclosure holds the time/organizer/tag selects (search stays visible; n counts the selects away from their defaults). At `md`+ the panel is `display: contents`, so the filter grid is unchanged. Time/Location/Entry Fee share one primary tile (no rose or emerald). Fallback gradients are on brand, and Clear uses the `danger` tokens. Flyers sit on a blurred copy of themselves instead of grey bands. New `tests/eventsFilters.test.tsx`.
- `ffd7216` **About:** below `sm` the Managing Committee is a 2-column grid with 80px avatars, about half the previous height at 375px. From `sm` up it is unchanged. Page wrapper → `bg-background-light`.
- `fb834a1` **Contact, DigitalOutreach:** both use the DESIGN.md page pair (`dark:bg-slate-950` and `bg-gray-50` are gone). The Contact map is 4:3 below `lg`.
- `9c8a806` **Footer:** Quick Links, the legal row and the `tel:`/`mailto:` links share `LINK_CLASS` with the branded focus ring. The Contact page links already had one.
- `b48f14a` **Tailwind:** `theme.borderRadius` is only `none`, `DEFAULT`, `lg`, `xl`, `2xl`, `full`. `rounded-md` (About Core count chip) → `rounded-lg`. `theme.extend.fontSize` adds `text-h1` … `text-caption`. DESIGN.md documents both.
- `7596896` **Header:** the mobile menu's `dark:bg-slate-950` → `dark:bg-background-dark` (found by the off-brand sweep).
- `9904db5` **Events:** one fallback gradient darkened (white initial was 2.89:1 at its lightest stop; now ≥ 3.8:1 for all six).
- `fe05125` **Footer, Contact:** the focus ring is `primary-light` in dark mode (`ring-primary` on `card-dark` was 2.83:1).
- `a56febd` **Review fixes:** Contact map capped at 400px below `lg`; the filters test asserts `hidden`/`grid`; DESIGN.md notes that arbitrary radius values still compile.

### Off-brand sweep (pages, components, App, index.css, index.html)
No Tailwind hue outside the brand ramps is left. These remain, on purpose:
- `index.html` / `App.tsx` `theme-color` meta values `#2563eb` / `#0f172a`: they must be literals and match `primary` / `background-dark`.
- Home president-strip dot pattern (`#2563eb`) and Events fallback dot pattern (`#ffffff`): inline `radial-gradient` styles, which can't take a class; both are brand values.

### Deviations from the plan
- Flyer backdrop applies at every width, not only phones. At `md`+ the flyer box is taller than the flyer, so the grey bands were bigger there.
- Contact map: the plan had 4:3 below `lg`. The reviewer found that it reached 677px at 1000px wide, so it is now 4:3 capped at 400px (the old height).
- Two extra fixes from verification, not in the brief: the gradient contrast (`9904db5`) and the dark-mode focus ring (`fe05125`).
- The Header `slate-950` fix (`7596896`) came out of the sweep the brief asked for.
- The Events filters test is a new file (`tests/eventsFilters.test.tsx`) rather than a block in `interactions.test.tsx`, so its module mock of `fetchWithFallback` stays out of the other tests.

### Verification
- `npm run lint`, `npm run typecheck`, `npm test` (9 files, 144 tests) and `npm run build`: all exit 0. `git status` is clean after the build (only the untracked `.claude/`).
- TDD: the X6 test and the filters tests failed before the code (no button / numeric tag dropped). Mutation: dropping the panel's `hidden` toggle fails the filters test.
- Radius: every radius class in the source (`rounded`, `-lg`, `-xl`, `-2xl`, `-full`, incl. `focus-visible:rounded` and the `@apply` in index.css) is in the built CSS. A probe compiles all seven `text-*` type tokens and not `rounded-sm/md/3xl`.
- Browser (dev server): Home, Events, About, Contact and DigitalOutreach at 375, 768 and 1440 in light and dark. No horizontal overflow, one `h1` per page, no heading-level skips, and no console errors (only the existing "Sheets not configured" dev warning). At 768/1440 the Filters button is hidden and the selects sit where they did.
- Contrast (in-page, worst case over gradient stops), light/dark: compliance badge 6.16/7.89, eyebrow 6.16/8.41, title 16.3/15.2, body 9.47/10.3, View Deadlines 5.17/5.17, icon 4.87/6.26; Learn more 5.17/5.75; Clear 5.91/9.19; meta-tile icons 4.75/5.43; fallback initials ≥ 3.83 (large text); committee role (now 12px) 5.17/5.75; footer link 4.83/5.76; focus ring vs footer 5.17 (light) and primary-light ≈ 6 (dark).
- Keyboard: Filters reached by Tab from search; collapsed, the next Tab skips the selects. Enter opens, Space closes, and `aria-expanded` follows. Footer Quick Links, `tel:`, `mailto:`, the legal links and the Contact `tel:`/`mailto:` links all show the ring on Tab. The three "Learn more" names are distinct.
- Screenshots (scratchpad only): before/after of the Home compliance card (375, 1440), Events (375) and the About committee (375).
- A fresh reviewer read the full diff: no Critical, one Important (map height, fixed), five Minor (below).

### Deferred minors / left for later
- `About.tsx` overrides Card padding with `sm:p-6` in `className`, which Card documents as "layout only". It works (the media query comes later in the CSS). A responsive `padding` option on Card would be cleaner.
- DESIGN.md's YAML `rounded:` tokens list only the four steps; `none`/`DEFAULT` are explained in prose only.
- Dark mobile menu: the open header pill (`slate-900/90`) and the overlay (`background-dark`) are now nearly the same colour, as they already were in light mode (both white). Looks like one surface; left as is.
- The compliance card's `ring-offset-2` has a white offset in dark mode, like the `.btn-*` classes.
- Site-wide: `focus-visible:ring-primary` on dark surfaces (Header, buttons, social icons, Events controls) is ~2.8:1. This batch fixed only the footer and Contact text links; a `dark:focus-visible:ring-primary-light` sweep (or a shared focus utility) would fix the rest.
- Still open from the design review, outside this batch: the Events Clear button has only the browser's default focus outline, not the branded ring, Membership hero density (§8 #13), and migrating pages to `text-h1`… (optional).
- X5 (owner question) is unchanged.

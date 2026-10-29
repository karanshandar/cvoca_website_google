# Batch F: brand colours, small a11y fixes, mobile density, Tailwind scales, X6

## Status: IN PROGRESS (2026-10-29). Committed on `main`, not pushed.

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
- [ ] Test `keeps numeric tags as text`: `toEvent({ ...event, tags: ['GST', 2024, '', null] })?.tags` → `['GST', '2024']`.
- [ ] Run: fails (2024 dropped).
- [ ] `textList` maps items through `text()` and drops `undefined`, then trims and drops blanks.
- [ ] Run: passes. Tick X6 (section, suggested order row, checklist).
- [ ] Commit `fix(data): keep numeric event tags as text (Batch F, X6)`.

## Task 2: Home colours and "Learn more" names
**Files:** `pages/Home.tsx`.
- [ ] Compliance card: `primary-50 → secondary-50` surface (dark `primary-900/30 → secondary-900/30`), `primary-100`/`primary-800` borders, hover `border-primary/30`; `Badge` for "Monthly Resource"; icon and eyebrow `primary-700`/`primary-300`; title hover `primary-700`/`primary-light`; "View Deadlines" pill `bg-primary hover:bg-primary-dark text-white` (5.17:1) `rounded-full`. Add the branded focus ring to the card link.
- [ ] President strip: `cyan-50`/`blue-50`/`cyan-100` → `secondary-50`/`primary-50`/`secondary-100` (same hex values, now tokens).
- [ ] Each "Learn more": `<span className="sr-only"> about {title}</span>`.
- [ ] Commit `fix(home): brand compliance card, named Learn more links (Batch F)`.

## Task 3: Events colours, filters disclosure, flyers
**Files:** `pages/Events.tsx`, `tests/interactions.test.tsx`.
- [ ] Test `Events filters disclosure` (jsdom, `fetchWithFallback` mocked): the "Filters" button has `aria-expanded="false"` and controls the panel holding the organizer select; Enter/Space toggle it; choosing an organizer makes the name "Filters (1)".
- [ ] Run: fails (no button).
- [ ] `useDisclosure` for the panel; button `md:hidden` with the count; panel `hidden|grid grid-cols-1 gap-6 md:contents`.
- [ ] Meta tiles → primary tile; gradients → brand; "Clear" → `danger-50`/`danger-100`, dark `danger/20`/`danger/30`.
- [ ] Flyer: `aria-hidden` blurred `object-cover` copy behind the `object-contain` image.
- [ ] Run tests: pass. Commit `feat(events): mobile filters disclosure, brand tiles, flyer backdrop (Batch F)`.

## Task 4: About mobile committee grid; page backgrounds
**Files:** `pages/About.tsx`, `pages/Contact.tsx`, `pages/DigitalOutreach.tsx`.
- [ ] About managing grid: `grid-cols-2 gap-4 sm:gap-8`, card `padding="md"` + `sm:p-6`, avatar `w-20 h-20 sm:w-28 sm:h-28`, name `text-base sm:text-lg`, `break-words`.
- [ ] Page wrappers → `bg-background-light dark:bg-background-dark` (About, Contact, DigitalOutreach).
- [ ] Contact map: `aspect-[4/3] lg:aspect-auto lg:min-h-[400px]`.
- [ ] Commits: `feat(about): compact 2-column committee grid on phones (Batch F)`; `fix(contact,outreach): page background pair, map aspect ratio (Batch F)`.

## Task 5: Footer focus rings
**Files:** `components/Footer.tsx`.
- [ ] One `LINK_CLASS` constant with `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:rounded` for Quick Links, legal links and `tel:`/`mailto:` links (Contact's info links already have it).
- [ ] Commit `fix(footer): branded focus ring on text links (Batch F)`.

## Task 6: Tailwind scales
**Files:** `tailwind.config.js`, `pages/About.tsx` (`rounded-md`), `DESIGN.md`.
- [ ] Inventory every `rounded*` class; replace `borderRadius`; add `fontSize` tokens.
- [ ] Build; check each used radius class and a scratch `text-h1 … text-caption` compile; check `rounded-md`/`rounded-3xl` no longer compile.
- [ ] DESIGN.md: note the `text-h1…text-caption` utilities and the restricted radius scale.
- [ ] Commit `chore(tailwind): type tokens as fontSize, radius limited to the scale (Batch F)`.

## Task 7: Verify, review, record
- [ ] lint / typecheck / test / build; `git status` clean.
- [ ] Browser at 375/768/1440, light and dark, on Home, Events, About, Contact, DigitalOutreach (+ footer): overflow, console, heading outline.
- [ ] In-page contrast on every recoloured element; keyboard pass (Filters, footer/contact rings, Learn more names).
- [ ] Before/after screenshots (scratchpad only).
- [ ] Fresh reviewer on the full diff; fix Critical/Important; fix or record minors.
- [ ] Review section below; `docs/pending-tasks.md`; commit `docs: record Batch F`.

## Review
_To be filled in._

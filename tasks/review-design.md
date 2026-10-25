# CVOCA website: design and UI component review

**Scope:** visual design, brand fidelity, UI components and accessibility. Read-only review. No code was changed.
**Date:** 2026-10-25 · **Branch:** `claude/early-website-review-b04e34` @ `f02b98c`
**Method:** No `/design` skill is available in this environment, so the review was done against `DESIGN.md` (the google-labs-code/design.md brand spec) and `tailwind.config.js`. Steps:
1. Read every page and shared component line by line.
2. Ran `npm run design:lint` and `design:export`, and diffed the export against the Tailwind config.
3. Grepped the code for token drift.
4. Ran the Vite dev server (port 3017, using the parent checkout's `node_modules`; nothing was installed in the worktree) and checked every route in the built-in browser at 375 px, 768 px, 1440 px and 2560 px, in light and dark mode.
5. Ran an in-page script on all 9 routes, in both themes, that measures computed-colour contrast, heading outline, alt text, touch-target size and horizontal overflow. Checked keyboard behaviour by hand.

Screenshots are in `tasks/review-design/`.

Impact and effort scale: **H** = high, **M** = medium, **L** = low.

---

## 1. Executive summary

The site looks polished and modern: dark "glow" heroes, white rounded cards, a blue→cyan gradient accent and consistent Inter type. On desktop it reads well. **But the brand system exists only on paper.** `DESIGN.md` and `tailwind.config.js` agree perfectly (57/57 colours). The pages, however, are built almost entirely from raw Tailwind palette classes and one-off values:

- About **465 `gray-*` and 132 `slate-*` uses**, against **4 uses of the `card` tokens**.
- **Thirteen off-brand hues** in use: emerald, violet, amber, orange, rose, red, cyan, teal, indigo, fuchsia, pink, purple and raw blue.
- **Three radii outside the scale**: `rounded-3xl` (13 uses), `rounded-[2rem]` and `rounded-[2.5rem]`.
- **The shared `.btn-*` classes are used exactly once**, on the 404 page.

There are **no shared layout or UI primitives** beyond Header, Footer, Icon, Logo and Spinner. Every page rebuilds its own hero, card, button, badge, section header, image lightbox and search input. That is why spacing, radius and colour drift from page to page.

The most serious user-facing problems are accessibility and mobile ones:

1. **Mobile menu bug (H):** opening the menu at the top of any dark-hero page turns the CVOCA wordmark **and the close (X) button** white-on-white, so they are invisible (screenshot 01). The menu also has no `aria-expanded`, does not close on Escape, and does not trap focus.
2. **The About page scrolls sideways at 375 px.** The tab bar is 403 px wide (screenshot 02).
3. **Contrast failures in both themes.** `text-primary` is used without a dark variant (2.83:1 on dark cards). `text-gray-400` is used for small labels (2.54:1). There is a white-on-amber CTA (2.15:1), plus the documented `secondary` cyan (3.68:1).
4. **Keyboard-inaccessible interactions:** the event and outreach flyer lightboxes, and the sortable Past Presidents table headers. The modals have no dialog semantics or focus management.
5. **Broken heading order on most pages** (h1→h3, h2→h4, and h2 used as an eyebrow), plus invalid list markup and a `<button>` nested inside an `<a>`.
6. **The theme ignores `prefers-color-scheme`** and flashes light before dark (App.tsx:30-40). The architecture review also flagged this.

**Top recommendation:** before any visual redesign, add 6 to 8 small shared primitives (`PageHero`, `Section`/`SectionHeader`, `Card`, `Button`/`ButtonLink`, `Badge`, `IconTile`, `Modal`, `SearchInput`) built only from DESIGN.md tokens. Then migrate pages to them one at a time. This fixes brand drift, most contrast issues and most of the a11y debt at the same time, with small, low-risk diffs.

---

## 2. Brand fidelity

### 2.1 `npm run design:lint`
- **0 errors, 54 warnings, 1 info.**
- **53 of the warnings** say "`<token>` is defined but never referenced by any component". These refer to DESIGN.md's own `components:` block, which defines only 3 buttons. They do not describe code usage. They are noise until DESIGN.md defines more components (card, badge, icon-tile and so on). Adding those components would silence the warnings *and* document the patterns the pages actually use.
- **1 real warning:** `button-secondary`, white on `#0891b2`, measures **3.68:1**, below AA. DESIGN.md:225-229 already records this as a known caveat. It is still used for normal-size text: Blog "Community Contribution" (12 px), Membership student tier, About `h5` labels.

### 2.2 Does DESIGN.md agree with tailwind.config.js?
| Area | Result |
|---|---|
| Colours | **Identical.** `design:export` matched `tailwind.config.js` on all 57 colour tokens with 0 diffs. |
| Typography | DESIGN.md defines `h1/h2/h3/body-*/caption` tokens, but Tailwind does **not** expose them (no `text-h1` and so on). Code uses ad-hoc sizes instead. DESIGN.md:157 says `h1→text-5xl`, but pages use `text-4xl md:text-6xl` (6 pages) and `text-5xl md:text-7xl` (Home). It says `h2→text-4xl font-extrabold`, but most pages use `text-3xl font-bold`. |
| Radius | DESIGN.md scale is `lg/xl/2xl/full`. The code also uses `rounded-3xl` ×13, `rounded-md`, `rounded-[2rem]` and `rounded-[2.5rem]` (Membership.tsx:41,43; DigitalOutreach.tsx:169). Tailwind defaults allow these silently. |
| Spacing | DESIGN.md `spacing.sm/md/lg/xl` are not in Tailwind (`p-lg` doesn't exist). That part of the spec can't be enforced. |
| Motion | `tailwind.config.js:93-106` defines `fade-in-up` and `float`, but DESIGN.md doesn't mention them. **`animate-fadeIn` is used on 7 page roots** (e.g. About.tsx:486, Membership.tsx:186) **but is defined nowhere**, so it is a silent no-op. |
| Fonts | `index.html:49-51` loads Inter weights 300 to 800. The code also uses `font-black` (900; Events.tsx:215, DigitalOutreach.tsx:244), which the browser synthesises, and `font-serif` (Home.tsx:264), which breaks "Inter for everything" (DESIGN.md:154). |

### 2.3 Token drift in the pages (grep counts across `pages/` and `components/`)
| Pattern | Count | Should be |
|---|---|---|
| `bg-white dark:bg-slate-800` on cards | ~40 | `bg-card-light dark:bg-card-dark` (same values, but tokenised). The `card` tokens are used 4 times in total. |
| Page backgrounds | `bg-background-light`, `bg-gray-50`, `bg-white`, `bg-slate-900/50`, `dark:bg-slate-950` all used for "page" | One `background-*` pair. Home alone alternates three near-whites (Home.tsx:289, 309, 378). DigitalOutreach uses `dark:bg-slate-950` (DigitalOutreach.tsx:331), unlike every other page. |
| Off-brand hues | emerald 28, cyan 26, rose 22, blue 20, violet 15, amber 15, orange 10, red 7, teal 5, others | `primary/secondary/accent` plus `success/warning/danger`. **`warning` and `danger` are never used**, although `orange-*` (Membership.tsx:145-157) and `red-*` (Events.tsx:214, 486) do exactly those jobs. |
| Raw hex in TSX | Home.tsx:216 (`#2563eb`), Events.tsx:197 (`#ffffff`) | `theme('colors.primary')` or a `bg-[radial-gradient]` utility |
| `.btn-primary/secondary/outline` | **1 use** (NotFound.tsx:23) | Every CTA. About 20 hand-rolled button class strings exist, using four different radii (`rounded-full`, `rounded-xl`, `rounded-lg`, `rounded-2xl`) and three paddings. |
| Gradient text | 14 uses, including every About ServiceCard title (About.tsx:25), the Blog stats and the Contact tagline | DESIGN.md:161-164 says "reserve for hero stats/section emphasis — not repeated UI". |
| `primary → accent` purple gradients | Membership tier, About featured report, Home president ring, Events hero blobs | DESIGN.md:142,222 says "accent: sparing highlight only". |
| Arbitrary type sizes | `text-[10px]` ×15, `text-[0.6rem]` (Header.tsx:24) | `caption` (0.75 rem). 10 px uppercase text is also a contrast and readability issue. |
| Shadows | in scale (`sm…2xl`), plus coloured `shadow-primary/50`, `shadow-cyan-500/20` and others | DESIGN.md:184 says don't invent shadows. Minor. |

---

## 3. Visual review (by breakpoint)

**Mobile, 375 px (checked first)**
- Heroes are consistent and attractive. The Home h1 is 48 px over 3 lines, which is a little heavy, but fine.
- **About overflows horizontally** (`scrollWidth > innerWidth`). The 3 pill tabs need 403 px, wrap to two lines and touch the screen edges (screenshot 02).
- **Events:** the filter panel (4 stacked 56 px controls) fills the whole first screen, so no event is visible above the fold (screenshot 03). A "Clear" chip shows on first load even though the user set no filter.
- **Very long pages:** About 11.2 screens, Home 9.3, Outreach 8.6, Membership 6.9. About's Managing Committee renders 14 full-width cards of about 260 px each. Membership's first real content starts at 1,829 px because the two tier cards stack.
- **Event cards:** `object-contain` on a 3:4 box leaves letterbox bands. Long titles break badly ("INVESTOCRAFT 20-/20"). The "Expand" link sits under the fade overlay (screenshot 04).

**Tablet, 768 px**
- The hamburger stays until 1024 px, which is fine.
- **Membership hero shows a visible hard-edged rectangle.** The `w-1/2 h-full bg-gradient-to-l from-blue-900/20` overlay (Membership.tsx:190) ends in a seam in the middle of the hero (screenshot 05).
- The two-up tier cards work well at this width.

**Desktop, 1440 px**
- Strongest breakpoint. Hierarchy is clear and the card grids are balanced. The keyboard focus ring on nav links is the browser default (gold auto-outline), not the `ring-primary` used elsewhere: visible but off-brand.

**Wide, 2560 px**
- Everything caps at `max-w-7xl` (1280 px), so about 50% of the screen is empty background. That's acceptable, but the heroes' blur blobs are sized in fixed `w-96`, so they look tiny.
- The header's `transition-all duration-500` animates `left/width/top` from full-width to a centred pill. Mid-transition it briefly overlaps page content. I captured this in a screenshot during scroll: the nav was drawn over the President quote. Transition only `background/shadow/padding`, or use transforms.

**Dark mode**
- Mostly well paired, with one systematic gap: brand text colours (`text-primary`, `text-secondary`) lack `dark:` variants in about 10 places (see §5.1).
- The DigitalOutreach coordinator chip icon background is `bg-gray-100` with no dark variant (DigitalOutreach.tsx:142), so a light blob appears on dark cards.

---

## 4. Findings by page

> Format: **[Impact/Effort]** finding: `file:line`: recommendation

### Home (`pages/Home.tsx`)
- **[H/L]** Heading skip: h1 → **h3** "President's Communication" (`:250`). Use `h2`, or make it a styled `<p>`.
- **[H/L]** A `<button>` nested inside an `<a>` (`:321-350`, button `:344`). Invalid HTML, and it creates two tab stops. Render the "View Deadlines" pill as a `<span>`.
- **[M/L]** Low contrast in dark mode: "Don't Miss Out" `text-primary` (`:313`), 3.45:1; "Learn more" (`:103`), 2.83:1; event date `text-primary` (`:45`). Add `dark:text-primary-light`. CTA body `text-blue-100` on `bg-primary` (`:410`) is 4.24:1; use `text-white` or `primary-50`.
- **[M/M]** Brand drift: the compliance card uses an off-brand cyan/teal palette (`:322-347`), and its white-on-cyan-500/teal-500 button is **2.4:1**. Hero blob `bg-purple-500` (`:175`). `font-serif` quote (`:264`). Raw hex dot pattern (`:216`). Three section backgrounds (`:289`, `:309`, `:378`).
- **[M/L]** Stat-card gradient numbers use `from-primary to-secondary` in dark mode too (`:16`). DESIGN.md:163 asks for the light ramp on dark.
- **[L/L]** Copy says "Join thousands of professionals" (`:411`) while the stats say 2,400+. Use one consistent figure.
- **[L/L]** Outreach card images use `alt={title}`, duplicating the h3 right below (`:90`). Use `alt=""`. The president photo alt "CVOCA President" (`:227`) should include the name.
- **[L/L]** Three identical "Learn more" links (`:103`): add `aria-label="Learn more about {title}"`. Security review's Lighthouse run also flagged link-text.
- **[L/M]** Two "outline" CTA variants are hand-rolled (`:369`, `:395`, the second hovering to `secondary`) instead of `.btn-outline`.
- **Reuse:** StatCard, FeatureCard, HomeEventCard and OutreachCompactCard are all local. HomeEventCard duplicates the Events badges (`:53-61` ≈ Events.tsx:225-233).

### About (`pages/About.tsx`)
- **[H/L]** **Horizontal overflow at 375 px** from the tab `<nav>` (`:590-594`): 3 × `px-6` pills plus `scale-105` on the active one. Fix: allow `overflow-x-auto` with snap, or use smaller `px-4 text-xs` pills on mobile, or a segmented control that wraps.
- **[H/L]** The tabs have no tab semantics. They sit in a `<nav>` (`:590`) with no `role="tablist"`, `aria-selected` or `aria-controls`. Use `role="tablist"` and `role="tab"` with roving focus, or plain buttons with `aria-pressed`.
- **[H/L]** **Invalid list markup:** ServiceCard wraps `<li>` children in `<div>`s inside a `<ul>` (`:26-33`). Lighthouse flags this. Render `<li className="flex …">`.
- **[H/M]** **Sortable table headers are mouse-only.** `onClick` on `<th>` (`:402-441`) with no button, no `tabIndex` and no `aria-sort`. Put a `<button>` inside each `th` and set `aria-sort`.
- **[M/L]** Search inputs are labelled only by placeholder (`:280`, `:353`). Add `aria-label`, as Events.tsx:503 does.
- **[M/L]** Accordion button has no `aria-expanded`/`aria-controls` (`:67`). Its heading is an `h4` inside a `button` (`:72`).
- **[M/L]** Heading skips: h2 → **h4** member names (`:248`), h4 → **h5** (`:44`), h4 in the archive (`:191`).
- **[M/L]** Contrast in light mode: `text-gray-400` 10 px labels "Chairperson", "Term", "Native Place" (`:83`, `:377`, `:381`) at 2.54:1. "Showing N records" (`:474`). `text-xs text-gray-500` with no dark variant (`:52`) is 3.03:1 in dark. "1973" `text-primary` (`:511`) is 2.83:1 in dark.
- **[M/M]** Off-scale shapes and colours: `rounded-3xl` (`:134`, `:507`, `:519`, `:533`); an emerald badge (`:145`); the featured report uses a `from-primary to-accent` gradient (`:134`).
- **[L/L]** Gradient text on all 6 ServiceCard titles (`:25`) makes it repeated UI, which DESIGN.md says not to do.
- **[L/L]** `animate-fadeIn` (`:486`) is undefined. The archive grid's `hidden opacity-0 …` never animates (`:184`).
- **[L/M]** Mobile density: 14 tall single-column committee cards (`:241-251`). Consider a 2-column compact grid (`grid-cols-2`, 80 px avatars) below `sm`.

### Membership (`pages/Membership.tsx`)
- **[M/L]** Heading order: h1 → h3 tier names (`:50`) with no h2 before them. Add a visually hidden "Membership plans" `h2`, or promote the tier names.
- **[M/L]** `+ GST` uses `text-gray-400` at 2.54:1 (`:53`). Use `gray-500`/`gray-600`.
- **[M/L]** The hero overlay seam is visible at tablet and desktop widths (`:190`, screenshot 05). Use a full-width radial gradient or remove the overlay.
- **[M/M]** Off-scale radii `rounded-[2.5rem]` and `rounded-[2rem]` (`:41`, `:43`) and `rounded-3xl` (`:10`, `:92`). The eligibility note uses `orange-*` where the `warning` token exists (`:145-157`). `blue-900` in the hero (`:190`).
- **[M/L]** The Register CTA hand-rolls a gradient button (`:32`, `:82`) instead of `.btn-primary`/`.btn-secondary`. The student variant inherits the cyan contrast caveat. The professional variant uses accent purple, which overuses accent.
- **[L/L]** The hero has no eyebrow chip, unlike About, Blog, Outreach and Contact. Pick one hero pattern.
- **[L/L]** Benefits icon tile is `rounded-2xl h-12 w-12` (`:11`); DESIGN.md:206 specifies `w-14 h-14 rounded-xl`.

### Events (`pages/Events.tsx`)
- **[H/M]** **Flyer lightbox can't be opened from the keyboard.** The clickable media is a `<div onClick>` (`:170-175`). Wrap it in a `<button aria-label="View flyer for {title}">`.
- **[H/M]** **ImageModal** (`:85-138`) has no `role="dialog"`/`aria-modal`, does not move focus in, has no focus trap, and does not return focus on close. Its alt is the generic "Event Flyer" (`:126`).
- **[M/L]** The "Clear" filter shows on first load because `hasActiveFilters` treats the default `upcoming` as active (`:434`). `clearFilters` then switches the view to "all" (`:431`), not back to the default. The hero always says "Upcoming Events" even when past or all events are shown (`:466`).
- **[M/L]** Contrast: "Clear" `text-red-500` (`:486`) is 3.4 to 3.9:1. Date-badge month `text-red-500` at 10 px (`:214`) is 3.76:1. "Time/Location/Entry Fee" labels `text-gray-400` (`:248`, `:258`, `:271`) and year (`:216`) are 2.54:1. The Expand button `text-primary` (`:292`) is 2.83:1 in dark and sits under the fade overlay.
- **[M/M]** Off-brand palette: a rose location tile (`:254`), emerald fee tile (`:266`) and red month. Six off-brand fallback gradients (`:73-80`). Use `danger`/`success` or the primary ramp.
- **[M/L]** Expand button has no `aria-expanded` (`:290`).
- **[M/M]** Mobile: the filter card takes the full first viewport (screenshot 03). Collapse filters behind a "Filters (n)" disclosure below `md`, or show search plus one row of chips.
- **[L/L]** Event images use `object-contain` in a 3:4 box, which letterboxes (`:183`). The card lifts on hover (`:167`) but isn't clickable, which suggests a false affordance. `font-black` (`:215`).
- **Reuse:** a second copy of ImageModal exists in DigitalOutreach.tsx:117. The Badge and the empty state (`:565-576`) duplicate Home.

### Blog (`pages/Blog.tsx`)
- **[M/L]** No `h2` at all: h1 → h3 (`:52`).
- **[M/L]** Dark mode contrast: subtitle `text-primary`/`text-secondary` 12 px (`:45-46`) at 2.83:1 and 3.68:1 (cyan also fails in light). "Start Reading" (`:62`) 2.83:1. "Search the archives" (`:152`) 3.45:1.
- **[L/L]** The stats bar (`:103-120`) repeats Home's StatCard look with different markup and claims ("10k+ Monthly Readers") that no data source backs. This is a content question.
- **[L/L]** Whole-card external links open in a new tab with no visual or SR indication. Add an external-link icon or "(opens in new tab)" sr-only text. This applies site-wide to `target="_blank"`.

### DigitalOutreach (`pages/DigitalOutreach.tsx`)
- **[H/L]** **White on `amber-500` CTA at 2.15:1** (`:63`, "Register Now"). Amber accent text and stats also fail (`amber-600` 3.19:1 at `:61`, `amber-500` stats 2.06:1 at `:66`, `:244`). Emerald eyebrow text is 3.77:1 (`:33`).
- **[H/M]** The **THEMES map (`:27-113`)** introduces 5 off-brand hue families: emerald, violet, amber, blue and rose. This is the biggest single brand deviation on the site. `isDarkCard` is always `false`, so every `isDarkCard ?` branch is dead (`:142`, `:150`, `:205`, `:222`, `:239`). The maintainability review noted this too. Recommendation: one card style using `primary`, with category shown by an icon plus a `Badge`, or at most `primary/secondary/accent/success`.
- **[M/L]** Semantic inversion: the eyebrow subtitle is an `h2` and the title is an `h3` (`:199-200`). The title should be the `h2` and the eyebrow a `<p>`.
- **[M/M]** The image-click `<div>` is not keyboard accessible (`:172`). The modal close `<button>` has **no accessible name** (`:130`). The modal has no dialog semantics or focus handling (`:117-136`).
- **[M/L]** Labels `text-gray-400` at 10 to 12 px fail contrast ("Key Highlights", "Impact", "Coordinator"; `:150`, `:222`, `:239`). The coordinator icon chip has no dark variant (`:142`).
- **[L/L]** `theme.featureIcon.replace('text-', …)` (`:180`) generates class names at runtime. Tailwind's JIT can't see them, so they are effectively no-ops.
- **[L/L]** `rounded-[2.5rem]` (`:169`). `dark:bg-slate-950` page background (`:331`). Unlike the other pages, there is no `-mt-12` overlap card after the hero, so the rhythm is inconsistent.

### Contact (`pages/Contact.tsx`)
- **[M/L]** Phone and email are plain text (`:22`). Make them `tel:` and `mailto:` links, and wrap the address in `<address>`. Same in the Footer.
- **[L/L]** Each info label is an `h3` (`:21`). They are labels, so a `<dl>`/`<dt>` would be more semantic. Not wrong, though.
- **[L/L]** `rounded-3xl` cards (`:88`, `:110`). Gradient tagline (`:91`).
- **[L/L]** The map iframe is a fixed-height `min-h-[400px]` (`:115`), heavy on mobile. Consider `aspect-[4/3]` below `lg`.
- Otherwise the cleanest page. No contrast failures were measured.

### PrivacyPolicy (`pages/PrivacyPolicy.tsx`)
- **[M/L]** "Last Updated" renders **today's date** on every visit (`:162` → `new Date()`), which is misleading. Use a fixed date.
- **[L/L]** The hero is a light `bg-primary/10`, the only non-dark hero. This is consistent with the header's `darkHeroPaths` list (Header.tsx:110), but visually it's an outlier. Content lists use `list-inside` (`:173` and others), which hurts hanging-indent readability. Prefer `list-outside pl-5`.
- Local `Section` component (`:5-12`) is a good candidate for the shared `Section`.

### NotFound (`pages/NotFound.tsx`)
- **[L/L]** The only page that uses `.btn-primary`, which is good. The h1 "404" is `font-bold text-6xl` (`:14`); DESIGN.md wants h1 extrabold. With `min-h-[60vh]` centring (`:13`), the fixed header can overlap the content on short landscape phones. Add `pt-24`.

---

## 5. Findings by component

### Header (`components/Header.tsx`)
- **[H/L]** **Invisible controls when the menu is open on dark-hero pages** (screenshot 01). `textColorClass` and the toggle colour depend on `!scrolled && isDarkHero` (`:117-119`, `:148`), not on `isOpen`. The overlay is `bg-white` (`:163`), so the "CVOCA" wordmark, the dark-variant logo (`:15`) and the **close X** all go white on white. Fix: treat `isOpen` like `scrolled` when choosing colours.
- **[H/L]** Menu a11y: no `aria-expanded`/`aria-controls` on the toggle (`:146-150`). Escape doesn't close it (verified). No focus trap, so Tab walks behind the overlay. The overlay isn't wrapped in a `<nav aria-label>` (`:162-170`). `aria-label="Toggle menu"` should reflect state ("Open menu"/"Close menu").
- **[M/L]** The menu doesn't close on route change by back/forward or on resize past `lg`. It only closes on link click (`:165`). Add a `useEffect` on `location.pathname`.
- **[M/L]** Touch targets: theme toggle **36×36** (`:77`), menu toggle **40×40** (`:148`), both below the 44 px minimum. Use `p-2.5`/`p-3`.
- **[M/L]** Theme toggle: `aria-label="Toggle theme"` gives no state. Use `aria-pressed` or "Switch to dark mode". Its light-grey bubble (`bg-gray-100`, `:77`) looks out of place on the dark transparent hero header. Mirror the menu button's `text-white hover:bg-white/20` treatment.
- **[M/L]** "ASSOCIATION" `text-primary` at 9.6 px (`:24`) over the dark hero is about 3.5:1 at a tiny size. Use `text-primary-light` when the header is transparent and dark, and raise it to at least 11 px.
- **[L/L]** Nav links get the browser-default focus outline. Add `focus-visible:ring-2 ring-primary ring-offset-2` to match the other components.
- **[L/M]** `transition-all duration-500` on `left/width/top` (`:123`) causes a mid-transition overlap when scrolling (seen at 2560 px). Transition `background-color, box-shadow, padding` only, or use a transform.
- **[L/L]** The decorative "Professional Excellence" in the menu (`:167`) is `text-gray-400` (2.54:1).
- **[L/M]** `darkHeroPaths` (`:110`) is a hard-coded list. A new page with a light hero, or a typo'd path, gets white-on-white header text. A `PageHero` component could report its own tone instead.
- **Sticky behaviour:** a fixed header that becomes a floating pill after 20 px of scroll. It looks good, but on mobile the pill (about 66 px tall plus `top-4`) covers about 10% of the viewport and hides section headings at anchor targets (seen in screenshot 02). Consider `scroll-padding-top` on `html`.

### Footer (`components/Footer.tsx`)
- **[H/L]** **If either JSON fetch fails, the footer stays an empty 200 px box forever**, with no links, legal or social (`:44-50`). Quick Links and the copyright row are static, so render them unconditionally and gate only the data-driven bits.
- **[M/L]** Social icons are **24×24 touch targets** spaced by `space-x-6` (`:11`, `:66`). Add `p-2 -m-2` or `min-w-11 min-h-11`.
- **[M/L]** Contact info is plain text (`:90-95`). Use `tel:`/`mailto:` links and `<address>`. Footer column headings are `h3` with no h2 above them, which breaks the outline on Blog, Events and NotFound. Use `<h2 class="sr-only">Footer</h2>` or make the column titles `<p>`.
- **[L/L]** Footer links are 17 to 20 px tall (`:80-85`, `:101-103`). Add `py-1` for comfortable tapping.
- **[L/L]** The Logo `alt="CVOCA Logo"` sits next to the "CVOCA" text. Use `alt=""` (see Logo).
- **Reuse:** the bottom row (`:101-104`) duplicates Quick Links (Contact and Membership appear twice).

### Icon (`components/Icon.tsx`)
- Good: a central registry, `aria-hidden="true"` on every icon (`:181`), consistent 24 px viewBox.
- **[L/L]** Data-driven icons (feature, benefit and outreach `iconPath`, social, WhatsApp) still use inline `<svg>` and **lack `aria-hidden`** (Home.tsx:24, 93; Membership.tsx:12; DigitalOutreach.tsx:144, 180). Add an `<Icon path=…>` overload so every glyph goes through one component.
- **[L/L]** There's no `title`/label prop for the rare meaningful standalone icon. Fine for now, because all current uses sit next to text.

### Logo (`components/Logo.tsx`)
- **[M/L]** The auto-switch variant renders **two `<img alt="CVOCA Logo">`** (`:28-38`). Screen readers announce the logo twice, plus the adjacent "CVOCA" text. In the header the link's accessible name becomes "CVOCA Logo CVOCA Association". Use `alt=""` when the logo sits beside the wordmark, and give the link `aria-label="CVOCA home"`.
- **[L/L]** Both images load in every theme (`:28-38`). A `<picture>` with a `prefers-color-scheme` media query doesn't work with a class-based theme, so this approach is acceptable. Just mark the hidden one `aria-hidden`.

### LoadingSpinner (`components/LoadingSpinner.tsx`)
- **[M/L]** No `role="status"`, `aria-live` or sr-only "Loading…" text (`:5-6`), so it's silent to screen readers.
- **[M/L]** `min-h-[400px]` (`:5`) swapping to a full page causes the 0.65 CLS that the security/performance review measured. A page-shaped skeleton (hero-height block) would fix both.

### ErrorBoundary (`components/ErrorBoundary.tsx`)
- **[L/L]** Hand-rolls a button with `hover:bg-primary/90` and `font-semibold` (`:35-37`) instead of `.btn-primary`.

### App shell (`App.tsx`, `index.html`, `index.css`)
- **[M/L]** Theme state defaults to `'light'` and ignores `prefers-color-scheme` (App.tsx:30). It's applied in `useEffect` (`:32-40`), so returning dark-mode users see a light flash. Add a tiny inline script in `index.html` `<head>` that sets `class="dark"` before paint, and fall back to `matchMedia`. The architecture review also flagged this.
- **[L/L]** The skip link targets `<main id="main-content">` (App.tsx:52, 60). Add `tabIndex={-1}` on `main` so focus actually moves in every browser.
- **[L/L]** `.btn-outline` hard-codes `bg-white dark:bg-slate-800` (index.css:12) rather than `card-light/card-dark`.
- **[L/L]** `index.html:44` `theme-color` is a single value. Add a dark `media` variant.

---

## 6. Component inventory: reused vs rebuilt

| Pattern | Where it's (re)built | Shared today? | Proposed primitive |
|---|---|---|---|
| Dark page hero (bg-slate-900, 2 blur blobs, eyebrow chip, h1, lede) | About:488, Membership:188, Events:460, Blog:332, Outreach:333, Contact:66, Home:171 (variant), Privacy:159 (light) | ✗, 8 copies with drifting eyebrow, sizes and gradients | **`PageHero`** (`eyebrow`, `title`, `highlight`, `lede`, `tone`). It can also tell Header its tone, which replaces `darkHeroPaths`. |
| Section header (eyebrow + h2 + lede, centred or left) | Home:291, 311, 380; About:126, 544, 584; Membership:224 | ✗ | **`SectionHeader`** |
| Section wrapper (container + vertical rhythm) | `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` ×20+ with `py-12/16/20/24` | ✗ | **`Container`** / **`Section`** |
| Card (white/slate-800, rounded, border, shadow, hover lift) | ~25 variants with radius `xl/2xl/3xl/[2rem]/[2.5rem]` and shadow `sm…2xl` | ✗ | **`Card`** (`as`, `interactive`, `padding`) |
| Button / ButtonLink | ~20 hand-rolled; `.btn-*` used once | Partially (CSS only) | **`Button`** (`variant`: primary, secondary, outline, ghost; `size`; `as={Link\|a}`; external-link icon and sr-text when `target=_blank`) |
| Pill badge (committee, cost, category, year) | Home:53-61, Events:225-233, About:142-147, 382, 457, Outreach:178 | ✗ | **`Badge`** (`tone`: primary, success, neutral, warning) |
| Icon tile | Home:23, Membership:11, 100, 127, Contact:17, Blog:281, Events:141 (`IconWrapper`) | ✗ (Events has a local one) | **`IconTile`** (DESIGN.md:206 spec) |
| Stat block | Home `StatCard`, Blog stats bar, Outreach stats | ✗ | **`Stat`** |
| Image lightbox modal | Events:85, Outreach:117 (two diverging copies) | ✗ | **`Modal`/`Lightbox`** with dialog semantics, focus trap, Escape and restore |
| Search input with icon | About:276, 349; Events:496 | ✗ | **`SearchInput`** (required `label`) |
| Empty state | Home:359, Events:565, About:298, 390 | ✗ | **`EmptyState`** |
| Disclosure (accordion, expand text) | About:62, Events:287, Outreach:208 | ✗ | **`Disclosure`** (handles `aria-expanded`) |
| Header, Footer, Icon, Logo, LoadingSpinner, ErrorBoundary | n/a | ✓ | keep; fixes listed in §5 |

---

## 7. Accessibility audit summary

| Check | Result |
|---|---|
| **Contrast, light** | Fails: `gray-400` small labels (2.54:1, ~15 places), `secondary` cyan text and buttons (3.68:1), amber CTA and stats (2.06 to 3.19:1), emerald eyebrow (3.77:1), `red-500` (3.76:1), `blue-100` on primary (4.24:1), cyan/teal compliance button (~2.4:1). |
| **Contrast, dark** | Fails: `text-primary` with no dark variant on slate-800/900 (2.83 to 3.45:1, ~10 places), `gray-500` with no dark variant (3.03:1). Passes: `primary-light` (5.75:1), `primary-300` (8.1:1), `gray-400` (5.76:1). |
| **Focus states** | Present but inconsistent. 7 components use `focus-visible:ring-primary`. Most links and cards rely on the browser default outline. Nothing removes outlines globally, which is good. |
| **Keyboard-only** | ✗ Flyer lightboxes (Events, Outreach), ✗ sortable `th`, ✗ menu focus trap and Escape, ✗ modal focus management. ✓ Skip link exists. ✓ All buttons are real `<button>` elements except the image `div`s. |
| **Alt text** | No missing alts. Issues: redundant alt equal to the adjacent heading (outreach and event images), duplicate logo alts, generic "Event Flyer" and "Enlarged view". |
| **Heading order** | Broken on Home (h1→h3), About (h2→h4→h5), Membership (h1→h3), Blog (no h2), Outreach (h2 as eyebrow), plus footer h3s with no h2 on several pages. Contact, Privacy and NotFound are fine. |
| **SR labels** | Missing: About search inputs, Outreach modal close button, menu and theme state, spinner status, accordion and expand `aria-expanded`, about tabs. Events filters are labelled correctly. |
| **Touch targets** | <44 px: theme toggle 36, menu 40, footer social 24, footer links ~20 px tall, Events "Clear" 28 px tall, Home "Learn more" 20 px tall. |
| **Motion** | `prefers-reduced-motion` is honoured globally (index.css:17-26). ✓ |
| **Invalid markup** | `<button>` in `<a>` (Home:344), `<div>` children of `<ul>` (About:26-33). |

---

## 8. Prioritised design improvements

| # | Improvement | Impact | Effort | Files |
|---|---|---|---|---|
| 1 | Fix the mobile-menu white-on-white wordmark and close button. Add `aria-expanded`, Escape, close on route change and a focus trap. | H | L | Header.tsx |
| 2 | Fix the About tab-bar overflow at 375 px and give the tabs tab semantics. | H | L | About.tsx:590 |
| 3 | Contrast sweep: add `dark:text-primary-light` wherever `text-primary` is used as text; `gray-400`→`gray-500/600` for small labels; remove the amber CTA (use primary); use the `secondary-700` (#0e7490, 5.36:1) shade for cyan text. | H | L | all pages |
| 4 | Make lightboxes and sortable headers keyboard-operable. Extract one accessible `Modal`. | H | M | Events, DigitalOutreach, About |
| 5 | Fix heading outlines and invalid markup (Home:250, 344; About:26, 248; Membership:50; Blog:52; Outreach:199). | H | L | pages |
| 6 | Footer: always render static links; enlarge touch targets; use tel/mailto/`<address>`. | H | L | Footer.tsx |
| 7 | Add shared primitives (`PageHero`, `SectionHeader`, `Container`, `Card`, `Button`, `Badge`, `IconTile`, `SearchInput`) built only from DESIGN.md tokens, then migrate one page per PR. | H | M | new `components/ui/*` |
| 8 | Collapse DigitalOutreach THEMES to the brand palette and delete the dead `isDarkCard` branches. | M | M | DigitalOutreach.tsx |
| 9 | Theme: respect `prefers-color-scheme`, add a pre-paint script, and add a dark `theme-color`. | M | L | App.tsx, index.html |
| 10 | Extend DESIGN.md: add `components:` for card, badge, icon-tile and hero (this silences 53 lint warnings); document `fade-in-up`/`float` motion; expose typography tokens in Tailwind (`fontSize: { h1: … }`); restrict `borderRadius` to the 4-step scale so off-scale radii stop compiling. | M | M | DESIGN.md, tailwind.config.js |
| 11 | Remove the undefined `animate-fadeIn` (7×), the `font-serif` quote, `font-black`, the raw hex and the `text-[10px]`→`caption` cases. | M | L | pages |
| 12 | Header polish: 44 px toggles, a hero-aware theme toggle, a branded focus ring, a narrower `transition-*`, `scroll-padding-top`. | M | L | Header.tsx, index.css |
| 13 | Mobile density: collapsible Events filters, 2-column committee grid, shorter Membership hero, map aspect ratio. | M | M | Events, About, Membership, Contact |
| 14 | Events UX: a default-aware "Clear", a hero title that follows the time filter, no false hover lift, `object-cover` or a blurred backdrop for flyers. | M | L | Events.tsx |
| 15 | Fix the Membership hero seam; unify the hero eyebrow pattern across pages. | L | L | Membership.tsx |
| 16 | Content and accuracy: Privacy "Last Updated" fixed date; "thousands" vs 2,400+; unbacked Blog stats. | L | L | Privacy, Home, Blog |
| 17 | LoadingSpinner: `role="status"` plus a hero-shaped skeleton, which also fixes the CLS. | M | L | LoadingSpinner.tsx |

**Suggested order:** do 1 to 6 first as small, independent fixes with no visual-direction decisions. Then do 7 (primitives), which makes 3, 8, 10 and 11 largely mechanical during the migration.

---

## 9. Screenshots (`tasks/review-design/`)
| File | Shows |
|---|---|
| `00-home-mobile-hero-light.jpg` | Home hero at 375 px. Low-contrast "ASSOCIATION" and a light theme-toggle bubble on the dark header. |
| `01-mobile-menu-invisible-close.jpg` | **Bug:** menu open on About, with the CVOCA wordmark and close X invisible (white on white). |
| `02-about-tabs-overflow-mobile.jpg` | About tabs overflowing 375 px, edge to edge, labels wrapping. |
| `03-events-filters-mobile.jpg` | Events filter card filling the first viewport; "Clear" visible with default filters. |
| `04-event-card-dark-mobile.jpg` | Event card in dark mode: letterboxed flyer, broken title wrap, low-contrast "Expand" under the fade. |
| `05-membership-tablet-dark.jpg` | Membership at 768 px, dark: hero overlay seam at mid-width; accent-purple tier styling. |

## 10. Notes for maintainers
- Data caveat: every event in the local fallback data is in the past, so "upcoming" views show empty states (the maintainability review confirms this). The Events checks used the "All events" filter.
- Lighthouse a11y failures reported by the security/performance review (color-contrast, heading-order, list/listitem, link-text) are all explained by specific lines above.
- No files other than this report and the screenshots folder were written. Nothing was installed in the worktree, and nothing was committed.

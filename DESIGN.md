---
name: CVOCA
colors:
  # Primary — Royal Blue
  primary: "#2563eb"
  primary-light: "#60a5fa"
  primary-dark: "#1e40af"
  primary-50: "#eff6ff"
  primary-100: "#dbeafe"
  primary-200: "#bfdbfe"
  primary-300: "#93c5fd"
  primary-400: "#60a5fa"
  primary-500: "#3b82f6"
  primary-600: "#2563eb"
  primary-700: "#1d4ed8"
  primary-800: "#1e40af"
  primary-900: "#1e3a8a"
  # Secondary — Cyan
  secondary: "#0891b2"
  secondary-light: "#22d3ee"
  secondary-dark: "#0e7490"
  secondary-50: "#ecfeff"
  secondary-100: "#cffafe"
  secondary-200: "#a5f3fc"
  secondary-300: "#67e8f9"
  secondary-400: "#22d3ee"
  secondary-500: "#06b6d4"
  secondary-600: "#0891b2"
  secondary-700: "#0e7490"
  secondary-800: "#155e75"
  secondary-900: "#164e63"
  # Accent — Purple
  accent: "#7c3aed"
  accent-light: "#a78bfa"
  accent-dark: "#6d28d9"
  accent-50: "#f5f3ff"
  accent-100: "#ede9fe"
  accent-500: "#8b5cf6"
  accent-700: "#6d28d9"
  # Success
  success: "#16a34a"
  success-light: "#bbf7d0"
  success-dark: "#15803d"
  success-50: "#f0fdf4"
  success-100: "#dcfce7"
  success-700: "#15803d"
  # Warning
  warning: "#d97706"
  warning-light: "#fde68a"
  warning-dark: "#b45309"
  warning-50: "#fffbeb"
  warning-100: "#fef3c7"
  warning-700: "#b45309"
  # Danger
  danger: "#dc2626"
  danger-light: "#fecaca"
  danger-dark: "#b91c1c"
  danger-50: "#fef2f2"
  danger-100: "#fee2e2"
  danger-700: "#b91c1c"
  # Semantic surfaces (light/dark pairings)
  background-light: "#f8fafc"
  background-dark: "#0f172a"
  text-light: "#334155"
  text-dark: "#f1f5f9"
  card-light: "#ffffff"
  card-dark: "#1e293b"
typography:
  h1:
    fontFamily: Inter
    fontSize: 3rem
    fontWeight: 800
  h2:
    fontFamily: Inter
    fontSize: 2.25rem
    fontWeight: 800
  h3:
    fontFamily: Inter
    fontSize: 1.25rem
    fontWeight: 700
  body-lg:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: 400
  body-md:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: 400
  body-sm:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: 400
  caption:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: 700
rounded:
  lg: 0.5rem
  xl: 0.75rem
  "2xl": 1rem
  full: 9999px
spacing:
  sm: 0.5rem
  md: 1rem
  lg: 1.5rem
  xl: 2rem
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.full}"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "#ffffff"
    rounded: "{rounded.full}"
  button-outline:
    backgroundColor: "{colors.card-light}"
    textColor: "{colors.text-light}"
    rounded: "{rounded.full}"
---

## Overview

CVOCA is a member-focused professional association. The brand voice is
**professional, trustworthy, and community-oriented** — clear over clever.
Visually the system is light-first with full dark-mode support: clean white
cards on a slate background, a royal-blue primary, and restrained use of a
blue→cyan gradient for emphasis. Every color, type, radius, and elevation
choice below maps to a token in the front matter; new UI must reuse those
tokens rather than introducing one-off values.

## Colors

- **Primary — Royal Blue (`primary`, `#2563eb`):** primary actions, links,
  active states, key numbers. `primary-dark` for hover, `primary-light` for
  subtle accents, `primary-50`/`primary-100` for tinted backgrounds and badge
  fills. In dark mode, prefer `primary-300`/`primary-400` for text on dark
  surfaces.
- **Secondary — Cyan (`secondary`, `#0891b2`):** the second half of the
  signature gradient (`primary → secondary` for headline/stat emphasis) and
  secondary buttons.
- **Accent — Purple (`accent`, `#7c3aed`):** sparing highlight only; not a
  general-purpose color.
- **Success / Warning / Danger:** status only — confirmations, cautions, errors
  and destructive actions respectively. Use the `-50`/`-100` shades for fills,
  the `-700` shades for text.
- **Semantic surfaces:** `background-light`/`background-dark` for page
  backgrounds, `card-light`/`card-dark` for cards and raised surfaces,
  `text-light`/`text-dark` for body copy. These are the canonical light/dark
  pairings — always pair light with dark, never mix.

## Typography

- **Family:** Inter for everything (`fontFamily: Inter`).
- **Headings:** extrabold (`h1`/`h2`, weight 800) to bold (`h3`, weight 700),
  in near-black (`text-gray-900`) / white in dark mode. Heading tokens map to
  Tailwind size classes (`h1`→`text-5xl`, `h2`→`text-4xl`, `h3`→`text-xl`);
  use responsive variants (`text-4xl md:text-5xl`) for hero text.
- **Body:** weight 400, `body-md` default, in `text-gray-600` /
  `text-gray-400` (dark) with relaxed line-height (`leading-relaxed`).
- **Gradient text:** reserve `bg-clip-text` + `bg-gradient-to-r from-primary
  to-secondary` for hero stats and section emphasis — not for body or repeated
  UI. On dark backgrounds, use the lighter ramp (`from-primary-light
  to-secondary-light`) so the gradient stays legible.
- **Captions/labels:** `caption` token — small, bold, uppercase, wide tracking
  (`uppercase tracking-wide`) for eyebrow labels and stat captions.

## Layout

- Content sits in a centered container with horizontal padding; sections use
  generous vertical rhythm (large `py` between sections).
- Card interiors use the `spacing` scale: `md` (1rem) to `xl` (2rem) padding;
  `lg` (1.5rem) is the common card padding.
- Mobile-first: design for small screens first, then enhance at `md`/`lg`
  breakpoints (per project conventions).

## Elevation

A three-step shadow scale conveys depth and interactivity:
- **Rest:** `shadow-lg` for standard cards, `shadow-xl` for emphasized cards
  (e.g. stat cards).
- **Hover:** raise to `shadow-2xl` and lift with `-translate-y-1`.
- **Subtle:** `shadow-sm`/`shadow-md` for inset chips and small badges.
Do not invent shadow values outside this scale.

## Shapes

- **`rounded-2xl` (1rem):** cards and primary surfaces.
- **`rounded-xl` (0.75rem):** icon tiles and inner elements (date badges).
- **`rounded-full`:** buttons and pill badges.
- **`rounded-lg` (0.5rem):** small inputs/controls where a pill is too round.

## Components

- **Buttons** (`.btn-primary`, `.btn-secondary`, `.btn-outline` in `index.css`):
  `rounded-full`, bold, `px-6 py-3`, `shadow-md` → `shadow-lg` on hover.
  `button-outline` is a white/`card` surface with a gray border that fills with
  `primary` on hover.
- **Cards:** `bg-card` + `rounded-2xl` + `shadow-lg`/`xl` +
  `border border-gray-100 dark:border-gray-700`; on hover lift
  (`-translate-y-1`), deepen shadow (`shadow-2xl`), and tint border
  (`hover:border-primary/30`).
- **Pill badges:** `rounded-full`, tiny (`text-[10px]`/`text-xs`), bold,
  `uppercase tracking-wide`, color-coded by meaning — `primary-50`/`primary-700`
  for category, `success-50`/`success-700` for "Free"/positive states.
- **Icon tiles:** `w-14 h-14 rounded-xl bg-primary/10` with a `primary` icon;
  on hover the tile fills `primary` and the icon turns white.

## Do's and Don'ts

**Do**
- Reference tokens (`primary-600`, `card-dark`, `rounded-2xl`) instead of raw
  hex or one-off values.
- Pair light/dark semantic surfaces correctly (`card-light` with `text-light`,
  `card-dark` with `text-dark`).
- Honor `prefers-reduced-motion` — `index.css` already neutralizes animations
  and transitions under that query; keep new motion compatible.

**Don't**
- Hard-code hex colors in components when a token exists.
- Introduce shadows, radii, or font sizes outside the scales above.
- Overuse the `primary → secondary` gradient or the `accent` purple.
- Skip heading levels or use heading weights for body text.

**Known caveat**
- `button-secondary` (white text on `secondary` cyan, `#0891b2`) measures
  ~3.68:1 — below WCAG AA 4.5:1 for normal text. This reflects the existing
  brand, not a new choice. Use it sparingly, prefer it for large/bold labels,
  and pair it with non-color affordances. Revisit in a future brand pass.

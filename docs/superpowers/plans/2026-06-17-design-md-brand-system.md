# DESIGN.md Brand System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a `DESIGN.md` at the repo root that encodes the CVOCA brand at full token fidelity using the `google-labs-code/design.md` format, lints clean (structure + WCAG contrast), and verifiably agrees with the current `tailwind.config.js`.

**Architecture:** Author a `DESIGN.md` (YAML front-matter tokens + Markdown prose) that mirrors the existing brand tokens. The build is unchanged — `tailwind.config.js` stays the source of truth (Phase 1). The `@google/design.md` CLI is used only via `npx` for `lint`, `export`, and `diff` as verification, never as a build input. A future Phase 2 (out of scope) flips `DESIGN.md` to be the source of truth.

**Tech Stack:** `@google/design.md` CLI (run via `npx`, alpha), existing Tailwind v3 config, no new build dependencies.

## Global Constraints

- Run the CLI via `npx --yes -p @google/design.md@0.3.0 designmd ...` only. Do **not** add `@google/design.md` to `dependencies`. (A dev-only convenience npm script that calls `npx` is allowed.) Version pinned to `0.3.0` (alpha) for reproducibility.
- On Windows the package's default `design.md` bin fails (file-association / `.md` handling). You MUST select the `designmd` bin explicitly with `npx -p @google/design.md@0.3.0 designmd <command>`. `npx @google/design.md ...` (no `-p`) does **not** work here — verified.
- The `spec` subcommand is broken in 0.3.0 (it cannot find its bundled `spec.md`). Do not rely on it. `lint` and `export` work and are verified.
- Do **not** modify `tailwind.config.js`, `vite.config.*`, `index.css`, or any shipped output. `export` output is a verification artifact only.
- Encode tokens at **full fidelity**: every shade present in `tailwind.config.js` (the 50–900 ramps, `light`/`dark`/`DEFAULT` aliases, and semantic `background`/`text`/`card` light/dark pairings).
- Keyframe animations (`fade-in-up`, `float`) are **out of the token schema** — do not attempt to encode them; reference them only in prose.
- `DESIGN.md` lives at repo root.

---

### Task 1: Scaffold `DESIGN.md` front matter (full-fidelity tokens) and a dev lint script

**Files:**
- Create: `DESIGN.md`
- Modify: `package.json` (add dev-only `design:lint` and `design:export` scripts)

**Interfaces:**
- Consumes: token values from `tailwind.config.js` (`theme.extend.colors`).
- Produces: `DESIGN.md` with valid YAML front matter that `lint` accepts; npm scripts `design:lint` and `design:export`.

- [ ] **Step 1: Confirm the toolchain runs**

The format/CLI are verified working (v0.3.0) via the `designmd` bin. Sanity-check it resolves:

Run: `npx --yes -p @google/design.md@0.3.0 designmd lint --help`
Expected: prints lint usage, exit 0. (The `spec` subcommand is broken in 0.3.0 — do not use it. The token schema is: `colors` = flat name→hex map; `typography` = name→{fontFamily, fontSize, fontWeight}; `rounded`/`spacing` = name→dimension; `components` = name→{backgroundColor, textColor, rounded} with `{token.ref}` references. Lint accepts these — verified.)

- [ ] **Step 2: Create `DESIGN.md` with the token front matter**

Create `DESIGN.md` with exactly this front matter (prose sections are added in Task 2). Values are copied verbatim from `tailwind.config.js`. Quote keys that start with a digit (e.g. `"2xl"`).

```md
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
```

- [ ] **Step 3: Add dev-only npm scripts**

In `package.json`, add to the `scripts` object (do not touch `dependencies`):

```json
    "design:lint": "npx --yes -p @google/design.md@0.3.0 designmd lint DESIGN.md",
    "design:export": "npx --yes -p @google/design.md@0.3.0 designmd export --format json-tailwind DESIGN.md"
```

- [ ] **Step 4: Lint the front matter**

Run: `npm run design:lint`
Expected: PASS. If `lint` reports unknown property names in `components` or `typography`, or rejects a token key, reconcile against the `spec` output from Step 1 (e.g. drop an unsupported `components` property, rename a key) and re-run until it passes. Do not change any color hex values to satisfy lint — those are verbatim from the config. If a WCAG contrast warning fires on a token *pairing* (e.g. `button-outline` text on card), note it for Task 2's Do's/Don'ts rather than altering brand hexes.

- [ ] **Step 5: Commit**

```bash
git add DESIGN.md package.json
git commit -m "feat: add DESIGN.md token front matter and dev lint scripts"
```

---

### Task 2: Write the prose sections

**Files:**
- Modify: `DESIGN.md` (append the 8 canonical prose sections after the front matter)

**Interfaces:**
- Consumes: the token front matter from Task 1.
- Produces: a complete `DESIGN.md` with Overview, Colors, Typography, Layout, Elevation, Shapes, Components, Do's/Don'ts.

- [ ] **Step 1: Append the prose sections**

Append the following after the closing `---` of the front matter:

```md
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
  UI.
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
```

- [ ] **Step 2: Lint the complete file**

Run: `npm run design:lint`
Expected: PASS (structure valid, no contrast errors on declared component token pairs). Fix any structural issues `lint` reports; do not alter brand hex values.

- [ ] **Step 3: Commit**

```bash
git add DESIGN.md
git commit -m "docs: add DESIGN.md prose sections (overview through do's/don'ts)"
```

---

### Task 3: Verify token fidelity against `tailwind.config.js`

**Files:**
- (No file changes expected; this task is verification. Any fix lands in `DESIGN.md`.)

**Interfaces:**
- Consumes: complete `DESIGN.md` from Task 2; current `tailwind.config.js`.
- Produces: confirmation that exported tokens match the config (animations excepted), recorded in the plan's Review section.

- [ ] **Step 1: Export tokens to a Tailwind config**

Run: `npm run design:export > design-export.tmp.json`
Expected: a JSON Tailwind theme fragment containing the color, typography, spacing, and rounded tokens.

- [ ] **Step 2: Compare exported colors against the source config**

Open `design-export.tmp.json` and `tailwind.config.js` side by side. Confirm every color hex in `theme.extend.colors` of `tailwind.config.js` appears in the export with the same value:
- primary/secondary/accent/success/warning/danger ramps and `light`/`dark`/`DEFAULT` aliases
- semantic `background`/`text`/`card` light/dark values

Expected: all hex values agree. The export will **not** contain `theme.extend.animation` or `keyframes` (`fade-in-up`, `float`) — this is the documented, expected gap, not a failure.

- [ ] **Step 3: Reconcile any genuine mismatch**

If a *color value* differs (a real fidelity bug), correct the token in `DESIGN.md` to match `tailwind.config.js`, re-run `npm run design:lint`, and re-export. If the only differences are the animation/keyframes block and structural shape (alias naming), no change is needed.

- [ ] **Step 4: Clean up the temp export**

Run: `rm design-export.tmp.json`
Expected: temp file removed; `git status` shows no stray files.

- [ ] **Step 5: Commit (only if `DESIGN.md` changed in Step 3)**

```bash
git add DESIGN.md
git commit -m "fix: align DESIGN.md tokens with tailwind.config.js"
```

If nothing changed, skip the commit and record the verification result in the Review section below.

---

## Review

_(Fill in after execution.)_
- Lint result:
- Export/config comparison result (note the expected animation gap):
- Any token corrections made:

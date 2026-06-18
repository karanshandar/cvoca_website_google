# Design Spec: Formalize CVOCA Brand System with `DESIGN.md`

**Date:** 2026-06-17
**Status:** Approved for implementation planning
**Author:** Brainstorming session (Claude + rockykaru)

## Goal

Create a single, human- and machine-readable source of truth for the CVOCA
website's brand system, using the
[`google-labs-code/design.md`](https://github.com/google-labs-code/design.md)
format spec. Today the brand lives implicitly in `tailwind.config.js` and
component class strings. A `DESIGN.md` makes it explicit, lintable (including
WCAG contrast), and diff-able over time — and sets up an eventual migration to
`DESIGN.md` as the build source of truth.

## Why `design.md` (not `nexu-io/open-design`)

Two repos were evaluated:

- **`nexu-io/open-design`** — a heavy local *authoring studio* (daemon, desktop
  app, MCP, 100+ skills, 150 brand systems) that *generates* artifacts
  (HTML/PDF/PPTX/MP4). Nothing it produces ships into this React/Vite app. Out
  of scope for formalizing tokens; potentially useful later only for redesign
  mockups.
- **`google-labs-code/design.md`** (chosen) — a lightweight *format spec + CLI*
  (`@google/design.md`, npm, Apache-2.0, **alpha**). A `DESIGN.md` is YAML front
  matter (machine-readable tokens) + Markdown prose (rationale). The CLI offers
  `lint` (structure + WCAG contrast), `diff` (regression detection), and
  `export --format json-tailwind` (tokens → Tailwind config). It is the only one
  of the two that integrates with the deployable build path.

Neither tool runs in production. With `design.md`, only its *exported config*
would ever feed the build (`tailwind.config` → `vite build` → deploy); the CLI
itself is a dev/CI tool.

## Approach: phased B → A migration

The long-term destination is **`DESIGN.md` as the source of truth** (Option A).
We get there in two phases so that alpha-format risk never touches the build
until the format matures.

### Phase 1 — Author and verify (this spec's scope)

- Author `DESIGN.md` at the repo root with **full-fidelity tokens** (see Token
  Fidelity below), plus prose for the canonical sections.
- `tailwind.config.js` remains the build source of truth. **No build change.**
- Use the CLI via `npx` only (do **not** add `@google/design.md` as a build
  dependency):
  - `npx @google/design.md lint DESIGN.md` — validate structure + contrast.
  - `npx @google/design.md export --format json-tailwind DESIGN.md` — generate a
    Tailwind theme and **diff it against the current config** purely to verify
    the two agree. The export output is a verification artifact, not a build
    input.
- On Windows, invoke the CLI as `designmd` (not `design.md`) to avoid file
  association conflicts.

### Phase 2 — Make `DESIGN.md` the source of truth (deferred)

- Triggered when the format leaves alpha and stabilizes.
- Generate the Tailwind theme from `DESIGN.md` via `export`; `tailwind.config.js`
  becomes derived. Because Phase 1 tokens are already complete, this is a small,
  low-risk change.
- Out of scope for this spec — captured here only to justify Phase 1 decisions.

## Token Fidelity

Because Option A is the destination, tokens are encoded at **full fidelity now**
so a future `export` reproduces the Tailwind theme without silently dropping
colors:

- Encode the **full 50–900 ramps** for `primary`, `secondary`, `accent`,
  `success`, `warning`, `danger` as real tokens (not just key shades).
- Encode the **semantic light/dark pairings** currently in the config
  (`background.light/dark`, `text.light/dark`, `card.light/dark`).
- Prose carries the *usage* rules layered on top of the raw tokens.

## Known limitation: animations

The `design.md` flat token schema (colors, typography, spacing, rounded,
components) **cannot express keyframe animations**. The project's two animations
— `fade-in-up` and `float` — and their keyframes will **not** live in
`DESIGN.md`. They stay in a thin hand-written Tailwind layer. Even in Phase 2,
expect the build config to be: `export`ed tokens + a small manual layer
(animations, and any edge tokens the schema can't represent) merged on top. This
is documented so it is not a surprise during the Phase 2 flip.

## `DESIGN.md` structure (canonical section order)

YAML front matter (tokens) followed by these prose sections:

1. **Overview** — CVOCA brand identity and voice (professional, member-focused
   association; trustworthy, community-oriented).
2. **Colors** — token table + semantic roles (primary = royal blue `#2563eb`,
   secondary = cyan `#0891b2`, accent = purple `#7c3aed`, plus
   success/warning/danger) + dark-mode pairings + when to use each.
3. **Typography** — Inter; extrabold/bold headings, body
   `text-gray-600 dark:text-gray-400 leading-relaxed`; the `from-primary
   to-secondary` gradient-text rule.
4. **Layout** — container widths, section rhythm, spacing tokens, card padding
   conventions.
5. **Elevation** — the shadow scale and its usage (`shadow-lg`/`xl` at rest,
   `shadow-2xl` on hover).
6. **Shapes** — `rounded` tokens and where each applies (`rounded-2xl` cards,
   `rounded-xl` icon tiles, `rounded-full` buttons/pills).
7. **Components** — token-referenced recipes for buttons (`.btn-primary`,
   `.btn-secondary`, `.btn-outline`), cards (rest + hover lift
   `-translate-y-1` + `hover:border-primary/30`), pill badges
   (`uppercase tracking-wide`, color-coded), and icon tiles (`bg-primary/10`).
8. **Do's / Don'ts** — anti-patterns: raw hex instead of tokens, one-off
   shadows/radii outside the scale, headings that skip the type scale,
   animations that ignore `prefers-reduced-motion`.

## Source material (current brand, from the codebase)

- **Tokens:** `tailwind.config.js` — color ramps, semantic pairings, Inter font,
  `fade-in-up`/`float` animations + keyframes.
- **Component recipes:** `index.css` (`.btn-*` classes, reduced-motion guard)
  and representative components (`pages/Home.tsx`: `StatCard`, `FeatureCard`,
  `HomeEventCard` show card/badge/icon-tile/gradient patterns).

## Success criteria

- `DESIGN.md` exists at repo root, encodes the full current token set at full
  fidelity, and documents the 8 canonical sections.
- `npx @google/design.md lint DESIGN.md` passes (structure + WCAG contrast).
- `export --format json-tailwind` output diffed against `tailwind.config.js`
  shows the token values agree (animations excepted, per the limitation above).
- No change to `tailwind.config.js`, the build, or any shipped output.

## Out of scope

- Phase 2 (making `DESIGN.md` the build source of truth).
- Adding `@google/design.md` as a project dependency.
- Any visual redesign or component changes.
- Adopting the `nexu-io/open-design` toolkit.

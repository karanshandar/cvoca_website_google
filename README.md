# CVOCA Website

Official website for CVO Chartered & Cost Accountants Association (CVOCA) - A premier professional association for Chartered and Cost Accountants in Mumbai, India since 1973.

**Editing content?** See [docs/editing-content.md](docs/editing-content.md): which content lives in the Google Sheet, which in JSON files, and the exact Sheet tabs and columns.

## Tech Stack

Exact versions are in `package.json`.

- **Framework**: React 19 with TypeScript (strict mode)
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 3
- **Routing**: React Router 7
- **Tests**: Vitest
- **Content**: Google Sheets API at runtime, with JSON fallbacks in `public/data/`
- **Hosting**: Render (Static Site)

## Features

- 📱 Responsive, mobile-first layout
- 🎨 Dark mode (follows the OS, with a toggle)
- ⚡ Lazy-loaded routes, WebP images, build-time Tailwind CSS
- 🔒 Security headers (CSP, HSTS and others)
- 🔍 Per-page meta tags, JSON-LD structured data, sitemap

## Local Development

### Prerequisites

- Node.js 20.19+ or 22.12+ (Vite 7's minimum; `.nvmrc` pins 22)
- npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cvoca_website_google
```

2. Install dependencies:
```bash
npm ci
```

3. Optional: set up the Google Sheet connection. Without it, the site uses the JSON files in `public/data/`.
```bash
cp .env.example .env.local
```
Then fill in `VITE_GOOGLE_SHEETS_API_KEY` and `VITE_GOOGLE_SHEET_ID` in `.env.local`.

4. Run the development server:
```bash
npm run dev
```

The site will be available at `http://localhost:3000`

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server on port 3000 |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`) |
| `npm test` | Unit tests and the `public/data/*.json` data-contract check (Vitest) |
| `npm run build` | Production build into `dist/` (see below) |
| `npm run preview` | Serve the production build locally |
| `npm run design:lint` / `design:export` | Lint `DESIGN.md` / export its tokens |

### Build for Production

```bash
npm run build
```

This command:
1. Type-checks the code (`tsc --noEmit`); type errors stop the build
2. Writes `public/sitemap.xml` (`scripts/generate-sitemap.js`)
3. Bundles the application with Vite into `dist/`, then writes `dist/<route>/index.html` for each page (with that page's title, description and link-preview tags, from `seo/pages.json`) and `dist/404.html`

## Continuous Integration

`.github/workflows/ci.yml` runs `npm ci`, `npm run typecheck`, `npm test` and `npm run build` on every push and pull request to `main`.

## Deployment (Render)

Pushes to `main` deploy automatically on Render. Render runs `npm ci && npm run build` and publishes `dist/`.

The live service is configured in the Render dashboard (environment variables, a `/* → /index.html` rewrite and the security headers). `render.yaml` records the intended settings; Render applies it only if the service is linked as a Blueprint. It has no catch-all rewrite, because every page has its own HTML file and `dist/404.html` handles unknown URLs. The dashboard rewrite is removed in step R3 of the pending tasks. What still needs the client's Google or Render access is listed in [docs/pending-tasks.md](docs/pending-tasks.md).

### Environment Variables

| Variable | Description | How to Get |
|----------|-------------|------------|
| `VITE_GOOGLE_SHEETS_API_KEY` | Google Sheets API key | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `VITE_GOOGLE_SHEET_ID` | Your Google Sheet ID | From spreadsheet URL: `docs.google.com/spreadsheets/d/[SHEET_ID]/edit` |

Locally they go in `.env.local` (git-ignored); in production, in the Render dashboard. Both are built into the public JavaScript bundle, so the API key must be restricted in Google Cloud (see the account owner guide).

## Project Structure

```
cvoca_website_google/
├── components/          # Shared components (Header, Footer, Icon, ...)
│   └── ui/              # UI building blocks (Button, Card, Badge, Modal, PageHero, ...)
├── pages/               # One component per route
├── hooks/               # useFetch, useSEO, useFocusTrap
├── utils/               # Google Sheets client, JSON fallback, dates, events, schema, images
├── tests/               # Vitest tests
├── public/
│   ├── data/            # JSON content and Sheet fallbacks
│   ├── images/          # WebP images
│   ├── theme-init.js    # Sets the theme before first paint
│   ├── robots.txt
│   └── sitemap.xml      # Generated at build time
├── scripts/
│   └── generate-sitemap.js
├── docs/                # Editing, setup and image guides
├── types.ts             # Shared data types
├── constants.ts         # Site URL and name
├── App.tsx              # Routes
├── index.tsx            # Entry point
├── index.html
├── DESIGN.md            # Design tokens and component recipes
├── render.yaml          # Mirror of the Render service settings
└── CLAUDE.md            # Development guidelines
```

## Contributing

Please refer to `CLAUDE.md` for development guidelines and best practices.

## License

Copyright © 2025 CVOCA. All rights reserved.

## Contact

- Website: https://cvoca.org
- Email: info@cvoca.org
- Phone: +91-9167928622
- Address: 304, Jasmine Apartment, Dadasaheb Phalke Road, Dadar (E), Mumbai, Maharashtra 400014

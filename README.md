# CVOCA Website

Official website for CVO Chartered & Cost Accountants Association (CVOCA) - A premier professional association for Chartered and Cost Accountants in Mumbai, India since 1973.

## Tech Stack

- **Framework**: React 19.2.0 with TypeScript
- **Build Tool**: Vite 7.2.4
- **Styling**: Tailwind CSS 3.4.17
- **Routing**: React Router DOM 7.9.5
- **Hosting**: Render (Static Site)

## Features

- 📱 Fully responsive design (mobile-first approach)
- 🎨 Dark mode support
- ⚡ Optimized performance (WebP images, minified JSON, build-time CSS)
- 🔒 Comprehensive security headers
- 🔍 SEO optimized with structured data
- ♿ Accessibility compliant

## Local Development

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cvoca_website_google
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The site will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

This command:
1. Minifies all JSON data files
2. Builds and bundles the application with Vite
3. Generates optimized static assets in `dist/`

### Preview Production Build

```bash
npm run preview
```

## Deployment (Render)

This site is configured for automatic deployment on Render.

### Deployment Configuration

The deployment is managed by `render.yaml` which configures:
- Static site hosting
- Build command: `npm install && npm run build`
- Publish directory: `./dist`
- Security headers (CSP, HSTS, X-Frame-Options, etc.)
- SPA routing via `public/_redirects`

### Automatic Deployments

Pushes to the `main` branch automatically trigger deployments on Render.

### Manual Deployment

1. Push changes to GitHub:
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

2. Render will automatically:
   - Pull the latest code
   - Run `npm install`
   - Run `npm run build` (includes JSON minification)
   - Deploy static files from `dist/`

### Environment Variables

No environment variables are currently required for production deployment.

## Project Structure

```
cvoca_website_google/
├── components/          # Reusable React components
├── pages/              # Page components (Home, About, Events, etc.)
├── hooks/              # Custom React hooks (useSEO)
├── utils/              # Utility functions (schema generators)
├── public/             # Static assets
│   ├── images/         # WebP images (logos, events, committee)
│   ├── data/           # JSON data files
│   ├── _redirects      # Render SPA routing rules
│   ├── robots.txt      # SEO robots file
│   └── sitemap.xml     # SEO sitemap
├── scripts/            # Build scripts
│   └── minify-json.js  # JSON minification utility
├── index.html          # HTML template
├── index.tsx           # Application entry point
├── App.tsx             # Main app component
├── render.yaml         # Render deployment config
└── CLAUDE.md           # Development guidelines

```

## Performance Optimizations

- ✅ Build-time Tailwind CSS generation (66KB → 10KB gzipped)
- ✅ WebP image format (72% smaller than PNG)
- ✅ Lazy-loaded routes for code splitting
- ✅ Lazy-loaded images (below-the-fold)
- ✅ Minified JSON data files (16% reduction)
- ✅ Optimized fonts (Google Fonts with display=swap)

### Performance Metrics

- First Contentful Paint: ~150-250ms improvement
- Largest Contentful Paint: ~200-400ms improvement
- Total transfer size: ~200KB reduction per page load
- Expected Lighthouse score: 90+

## SEO Features

- Comprehensive meta tags (Open Graph, Twitter Cards)
- Structured data (JSON-LD schemas for Organization, Events, Articles)
- Dynamic SEO with `useSEO` hook
- Sitemap and robots.txt
- Canonical URLs
- Geo tags for local SEO (Mumbai, Dadar)

## Security

Comprehensive security headers configured in `render.yaml`:
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- WebP support: 95%+ browsers (Chrome 23+, Firefox 65+, Safari 14+, Edge 18+)

## Contributing

Please refer to `CLAUDE.md` for development guidelines and best practices.

## License

Copyright © 2025 CVOCA. All rights reserved.

## Contact

- Website: https://cvoca.org
- Email: info@cvoca.org
- Phone: +91-9167928622
- Address: 304, Jasmine Apartment, Dadasaheb Phalke Road, Dadar (E), Mumbai, Maharashtra 400014

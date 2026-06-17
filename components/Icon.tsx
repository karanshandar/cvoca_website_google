import React from 'react';

type IconVariant = 'stroke' | 'fill';

interface IconDef {
  viewBox: string;
  variant: IconVariant;
  paths: string[]; // one or more `d` attribute strings
}

// Registry of static (non-data-driven) icons used across the site.
// Path data is copied verbatim from the original inline <svg> markup so
// rendering is pixel-identical. Icons whose `d` comes from data/props
// (e.g. socialMedia.json svgPath, initiative.iconPath) are NOT here —
// they stay inline because their paths are dynamic.
const ICONS = {
  // Arrows / chevrons
  'arrow-right': { viewBox: '0 0 24 24', variant: 'stroke', paths: ['M9 5l7 7-7 7'] },
  'arrow-long-right': { viewBox: '0 0 24 24', variant: 'stroke', paths: ['M17 8l4 4m0 0l-4 4m4-4H3'] },
  'chevron-down': { viewBox: '0 0 24 24', variant: 'stroke', paths: ['M19 9l-7 7-7-7'] },
  'chevron-up': { viewBox: '0 0 24 24', variant: 'stroke', paths: ['M5 15l7-7 7 7'] },
  sort: { viewBox: '0 0 24 24', variant: 'stroke', paths: ['M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4'] },

  // Contact / info
  location: {
    viewBox: '0 0 24 24',
    variant: 'stroke',
    paths: [
      'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z',
      'M15 11a3 3 0 11-6 0 3 3 0 016 0z',
    ],
  },
  phone: {
    viewBox: '0 0 24 24',
    variant: 'stroke',
    paths: [
      'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
    ],
  },
  email: {
    viewBox: '0 0 24 24',
    variant: 'stroke',
    paths: ['M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'],
  },
  clock: { viewBox: '0 0 24 24', variant: 'stroke', paths: ['M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'] },
  calendar: {
    viewBox: '0 0 24 24',
    variant: 'stroke',
    paths: ['M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'],
  },

  // Actions / UI
  search: { viewBox: '0 0 24 24', variant: 'stroke', paths: ['M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'] },
  'zoom-in': {
    viewBox: '0 0 24 24',
    variant: 'stroke',
    paths: ['M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7'],
  },
  check: { viewBox: '0 0 24 24', variant: 'stroke', paths: ['M5 13l4 4L19 7'] },
  close: { viewBox: '0 0 24 24', variant: 'stroke', paths: ['M6 18L18 6M6 6l12 12'] },
  menu: { viewBox: '0 0 24 24', variant: 'stroke', paths: ['M4 6h16M4 12h16M4 18h16'] },
  download: {
    viewBox: '0 0 24 24',
    variant: 'stroke',
    paths: ['M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'],
  },
  'external-link': {
    viewBox: '0 0 24 24',
    variant: 'stroke',
    paths: ['M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'],
  },
  filter: {
    viewBox: '0 0 24 24',
    variant: 'stroke',
    paths: [
      'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z',
    ],
  },

  // Theme toggle
  sun: {
    viewBox: '0 0 24 24',
    variant: 'stroke',
    paths: [
      'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z',
    ],
  },
  moon: {
    viewBox: '0 0 24 24',
    variant: 'stroke',
    paths: ['M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'],
  },

  // Glyphs
  ticket: {
    viewBox: '0 0 24 24',
    variant: 'stroke',
    paths: ['M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z'],
  },
  tag: {
    viewBox: '0 0 24 24',
    variant: 'stroke',
    paths: ['M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z'],
  },
  'shield-check': {
    viewBox: '0 0 24 24',
    variant: 'stroke',
    paths: [
      'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    ],
  },
  'badge-check': {
    viewBox: '0 0 24 24',
    variant: 'stroke',
    paths: ['M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'],
  },
  'academic-cap': {
    viewBox: '0 0 24 24',
    variant: 'stroke',
    paths: [
      'M12 14l9-5-9-5-9 5 9 5z',
      'M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z',
    ],
  },
  'id-card': {
    viewBox: '0 0 24 24',
    variant: 'stroke',
    paths: [
      'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    ],
  },
  'book-open': {
    viewBox: '0 0 24 24',
    variant: 'stroke',
    paths: [
      'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    ],
  },
  pencil: {
    viewBox: '0 0 24 24',
    variant: 'stroke',
    paths: ['M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z'],
  },

  // Decorative
  quote: {
    viewBox: '0 0 24 24',
    variant: 'fill',
    paths: [
      'M14.017 21L14.017 18C14.017 16.054 15.392 14.471 17.227 14.102C17.388 14.07 17.483 14.043 17.483 14.043C17.483 14.043 17.483 12.879 17.483 12.022C16.326 12.022 15.196 11.537 14.378 10.72C13.56 9.902 13.076 8.771 13.076 7.614C13.076 6.457 13.56 5.326 14.378 4.509C15.196 3.691 16.326 3.206 17.483 3.206C18.64 3.206 19.77 3.691 20.588 4.509C21.406 5.326 21.89 6.457 21.89 7.614C21.89 10.966 20.73 17.062 16.738 20.551L16.273 21H14.017ZM3.132 21L3.132 18C3.132 16.054 4.507 14.471 6.342 14.102C6.503 14.07 6.598 14.043 6.598 14.043C6.598 14.043 6.598 12.879 6.598 12.022C5.441 12.022 4.311 11.537 3.493 10.72C2.675 9.902 2.191 8.771 2.191 7.614C2.191 6.457 2.675 5.326 3.493 4.509C4.311 3.691 5.441 3.206 6.598 3.206C7.755 3.206 8.885 3.691 9.703 4.509C10.521 5.326 11.005 6.457 11.005 7.614C11.005 10.966 9.845 17.062 5.853 20.551L5.388 21H3.132Z',
    ],
  },
} as const satisfies Record<string, IconDef>;

export type IconName = keyof typeof ICONS;

interface IconProps {
  name: IconName;
  className?: string;
  /** Stroke width for outline icons (default 2). Ignored for fill icons. */
  strokeWidth?: number;
}

const Icon: React.FC<IconProps> = ({ name, className, strokeWidth = 2 }) => {
  const def = ICONS[name];
  const variantProps =
    def.variant === 'stroke'
      ? {
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth,
          strokeLinecap: 'round' as const,
          strokeLinejoin: 'round' as const,
        }
      : { fill: 'currentColor' };
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={def.viewBox}
      className={className}
      aria-hidden="true"
      {...variantProps}
    >
      {def.paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
};

export default Icon;

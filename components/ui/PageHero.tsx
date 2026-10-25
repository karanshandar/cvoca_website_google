import React from 'react';

type HeroTone = 'dark' | 'light';
type HeroSize = 'default' | 'large';

interface PageHeroProps {
  /** ReactNode so a gradient <span> can be part of the title. */
  title: React.ReactNode;
  eyebrow?: string;
  lede?: React.ReactNode;
  tone?: HeroTone;
  /** large: Home's taller hero, with room for the overlapping stats. */
  size?: HeroSize;
  /** Extra content under the lede, e.g. CTAs. */
  children?: React.ReactNode;
}

const PageHero: React.FC<PageHeroProps> = ({ title, eyebrow, lede, tone = 'dark', size = 'default', children }) => {
  const isDark = tone === 'dark';
  const isLarge = size === 'large';

  return (
    <section
      className={`relative overflow-hidden text-center ${isLarge ? 'pt-32 pb-48 lg:pt-40 lg:pb-64' : 'pt-32 pb-24'} ${
        isDark ? 'bg-background-dark' : 'bg-primary-50 dark:bg-background-dark'
      }`}
    >
      {isDark && (
        <div aria-hidden="true" className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
        </div>
      )}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {eyebrow && (
          <span
            className={`inline-block px-4 py-1.5 mb-6 rounded-full text-xs font-bold uppercase tracking-wide ${
              isDark ? 'bg-white/10 backdrop-blur-md border border-white/20 text-white' : 'bg-primary-100 text-primary-700'
            }`}
          >
            {eyebrow}
          </span>
        )}
        <h1
          className={`${isLarge ? 'text-4xl md:text-6xl' : 'text-4xl md:text-5xl'} font-extrabold tracking-tight mb-6 ${
            isDark ? 'text-white' : 'text-gray-900 dark:text-white'
          }`}
        >
          {title}
        </h1>
        {lede && (
          <p className={`mt-4 text-xl max-w-2xl mx-auto leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600 dark:text-gray-300'}`}>
            {lede}
          </p>
        )}
        {children}
      </div>
    </section>
  );
};

export default PageHero;

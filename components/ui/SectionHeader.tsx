import React from 'react';

interface SectionHeaderProps {
  /** ReactNode so a gradient <span> can be part of the title. */
  title: React.ReactNode;
  /** Small uppercase label above the title. */
  eyebrow?: string;
  lede?: React.ReactNode;
  align?: 'center' | 'left';
  /** Layout only (bottom margin). */
  className?: string;
}

// Eyebrow + h2 + lede at the top of a page section.
const SectionHeader: React.FC<SectionHeaderProps> = ({ title, eyebrow, lede, align = 'center', className = '' }) => (
  <div className={`${align === 'center' ? 'max-w-3xl mx-auto text-center' : 'max-w-2xl'} ${className}`.trim()}>
    {eyebrow && (
      <span className="block mb-2 text-sm font-bold uppercase tracking-wide text-primary dark:text-primary-light">{eyebrow}</span>
    )}
    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">{title}</h2>
    {lede && <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">{lede}</p>}
  </div>
);

export default SectionHeader;

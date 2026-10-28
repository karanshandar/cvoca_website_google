import React from 'react';

type StatSize = 'md' | 'lg';

interface StatProps {
  value: string;
  label: string;
  /** lg: Home's hero stats. md: a row of stats inside one card. */
  size?: StatSize;
}

const VALUE_SIZE: Record<StatSize, string> = {
  md: 'text-3xl',
  lg: 'text-4xl md:text-5xl',
};

const LABEL_SIZE: Record<StatSize, string> = {
  md: 'mt-1',
  lg: 'mt-2 text-sm',
};

// Gradient number over a caption label. Lighter gradient ramp on dark surfaces (DESIGN.md).
const Stat: React.FC<StatProps> = ({ value, label, size = 'md' }) => (
  <div>
    <p
      className={`${VALUE_SIZE[size]} font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary dark:from-primary-light dark:to-secondary-light`}
    >
      {value}
    </p>
    <p className={`${LABEL_SIZE[size]} text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400`}>{label}</p>
  </div>
);

export default Stat;

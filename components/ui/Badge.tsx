import React from 'react';

type BadgeTone = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

interface BadgeProps {
  tone?: BadgeTone;
  /** Layout only (margins, positioning). */
  className?: string;
  children: React.ReactNode;
}

// Light then dark for each tone. Every pair meets 4.5:1.
const TONE_CLASSES: Record<BadgeTone, string> = {
  primary: 'bg-primary-50 text-primary-700 border-primary-100 dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-800',
  success: 'bg-success-50 text-success-700 border-success-100 dark:bg-success/20 dark:text-success-light dark:border-success/30',
  warning: 'bg-warning-50 text-warning-700 border-warning-100 dark:bg-warning/20 dark:text-warning-light dark:border-warning/30',
  danger: 'bg-danger-50 text-danger-700 border-danger-100 dark:bg-danger/20 dark:text-danger-light dark:border-danger/30',
  neutral: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600',
};

const Badge: React.FC<BadgeProps> = ({ tone = 'primary', className = '', children }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide border shadow-sm ${TONE_CLASSES[tone]} ${className}`.trim()}
  >
    {children}
  </span>
);

export default Badge;

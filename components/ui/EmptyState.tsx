import React from 'react';
import Icon, { type IconName } from '../Icon';

interface EmptyStateProps {
  icon?: IconName;
  /** Rendered as an h3. */
  title?: string;
  /** Message and optional action. */
  children?: React.ReactNode;
  /** Layout only (grid span, margins). */
  className?: string;
}

// Dashed placeholder card for "nothing to show" results.
const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, children, className = '' }) => (
  <div
    className={`flex flex-col items-center justify-center text-center py-16 px-6 bg-card-light dark:bg-card-dark rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 ${className}`.trim()}
  >
    {icon && (
      <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
        <Icon name={icon} className="w-8 h-8 text-gray-400" />
      </div>
    )}
    {title && <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>}
    {children && <div className={`text-gray-500 dark:text-gray-400 ${title ? 'mt-2' : ''}`.trim()}>{children}</div>}
  </div>
);

export default EmptyState;

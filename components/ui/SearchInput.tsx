import React, { useId } from 'react';
import Icon from '../Icon';

interface SearchInputProps {
  /** Accessible label (visually hidden). Required. */
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Width only. */
  className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({ label, value, onChange, placeholder, className = '' }) => {
  const id = useId();
  return (
    <div className={`relative group ${className}`.trim()}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon name="search" className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
      </div>
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-card-light dark:bg-card-dark text-gray-900 dark:text-white placeholder:text-gray-500 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
      />
    </div>
  );
};

export default SearchInput;

import React from 'react';
import Button from './ui/Button';

// Shown when page data fails to load, instead of an endless spinner.
// fullPage: use when it replaces a whole page (matches LoadingSpinner).
const LoadError: React.FC<{ fullPage?: boolean }> = ({ fullPage = false }) => {
  return (
    <div role="alert" className={`flex flex-col justify-center items-center text-center px-4 ${fullPage ? 'min-h-screen pt-24' : 'min-h-[400px]'}`}>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Couldn't load this content</h2>
      <p className="mt-2 text-gray-600 dark:text-gray-400">Please check your connection and try again.</p>
      <Button onClick={() => window.location.reload()} className="mt-6">
        Try again
      </Button>
    </div>
  );
};

export default LoadError;

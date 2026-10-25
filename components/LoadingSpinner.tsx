import React from 'react';

// fullPage: use when the spinner stands in for a whole page, so the footer
// stays below the fold instead of jumping down when the page renders.
const LoadingSpinner: React.FC<{ fullPage?: boolean }> = ({ fullPage = false }) => {
  return (
    <div role="status" className={`flex justify-center items-center ${fullPage ? 'min-h-screen' : 'min-h-[400px]'}`}>
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" aria-hidden="true"></div>
      <span className="sr-only">Loading…</span>
    </div>
  );
};

export default LoadingSpinner;

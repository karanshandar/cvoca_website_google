import React from 'react';

interface LogoProps {
  className?: string;
  // 'light' = light theme logo (dark text), 'dark' = dark theme logo (white text)
  // If undefined, it will auto-switch based on the parent's dark mode class
  variant?: 'light' | 'dark';
}

const Logo: React.FC<LogoProps> = ({ className = "w-full h-full", variant }) => {
  // Access the base path defined in vite.config.ts
  // We use a safe check (import.meta.env && ...) to prevent errors if env is undefined in the current runtime
  // Cast import.meta to any to avoid TypeScript errors regarding missing 'env' property if vite types are not loaded
  const baseUrl = ((import.meta as any).env && (import.meta as any).env.BASE_URL) || '/cvoca_website_google/';
  
  const lightLogo = `${baseUrl}images/logo-light-theme.webp`;
  const darkLogo = `${baseUrl}images/logo-dark-theme.webp`;

  // Explicitly forced variant (used in Header)
  if (variant === 'light') {
    return <img src={lightLogo} alt="CVOCA Logo" className={`${className} object-contain`} />;
  }
  if (variant === 'dark') {
    return <img src={darkLogo} alt="CVOCA Logo" className={`${className} object-contain`} />;
  }

  // Auto-switch based on CSS (used in Footer)
  return (
    <div className={`relative ${className}`}>
      {/* Show Light Theme Logo by default */}
      <img
        src={lightLogo}
        alt="CVOCA Logo"
        className="absolute inset-0 w-full h-full object-contain dark:opacity-0 transition-opacity duration-300"
      />
      {/* Show Dark Theme Logo when .dark class is present */}
      <img
        src={darkLogo}
        alt="CVOCA Logo"
        className="absolute inset-0 w-full h-full object-contain opacity-0 dark:opacity-100 transition-opacity duration-300"
      />
    </div>
  );
};

export default Logo;
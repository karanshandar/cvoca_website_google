import React from 'react';

interface LogoProps {
  className?: string;
  // 'light' = light theme logo (dark text), 'dark' = dark theme logo (white text)
  // If undefined, it will auto-switch based on the parent's dark mode class
  variant?: 'light' | 'dark';
  // Pass "" when the logo sits next to the CVOCA wordmark, so it isn't announced twice
  alt?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "w-full h-full", variant, alt = "CVOCA Logo" }) => {
  const baseUrl = import.meta.env.BASE_URL || '/';

  const lightLogo = `${baseUrl}images/logo-light-theme.webp`;
  const darkLogo = `${baseUrl}images/logo-dark-theme.webp`;

  // Explicitly forced variant (used by the Header over a dark hero)
  if (variant === 'light') {
    return <img src={lightLogo} alt={alt} className={`${className} object-contain`} />;
  }
  if (variant === 'dark') {
    return <img src={darkLogo} alt={alt} className={`${className} object-contain`} />;
  }

  // Auto-switch based on CSS (used in the Footer, and the Header elsewhere)
  return (
    <div className={`relative ${className}`}>
      {/* Show Light Theme Logo by default */}
      <img
        src={lightLogo}
        alt={alt}
        className="absolute inset-0 w-full h-full object-contain dark:opacity-0 transition-opacity duration-300"
      />
      {/* Show Dark Theme Logo when .dark class is present. Always hidden from
          screen readers, so only one of the two images is announced. */}
      <img
        src={darkLogo}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-contain opacity-0 dark:opacity-100 transition-opacity duration-300"
      />
    </div>
  );
};

export default Logo;

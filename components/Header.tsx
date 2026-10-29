
import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Logo from './Logo';
import Icon from './Icon';
import { useHeroTone } from './ui/heroTone';
import useFocusTrap from '../hooks/useFocusTrap';

interface HeaderProps {
  theme: string;
  toggleTheme: () => void;
}

const HeaderLogo: React.FC<{ textColorClass: string; onDark: boolean }> = ({ textColorClass, onDark }) => {
  // Over a dark hero, force the Dark Theme Logo (white text). Otherwise let the
  // Logo follow the site theme (light logo in light mode, dark logo in dark mode).
  const logoVariant = onDark ? 'dark' : undefined;

  return (
    <div className="flex items-center gap-3 group">
      <div className={`relative w-10 h-10 md:w-12 md:h-12 transition-transform duration-300 group-hover:scale-110`}>
        <Logo variant={logoVariant} alt="" />
      </div>
      <div className="flex flex-col">
        <span className={`text-xl md:text-2xl font-extrabold tracking-tight leading-none ${textColorClass}`}>CVOCA</span>
        <span className={`text-xs font-bold tracking-widest uppercase ${onDark ? 'text-primary-light' : 'text-primary dark:text-primary-light'}`}>Association</span>
      </div>
    </div>
  );
};

const NavLinks: React.FC<{onLinkClick?: () => void, mobile?: boolean, onDark?: boolean}> = ({ onLinkClick, mobile, onDark }) => {
    const links = [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
        { name: 'Membership', path: '/membership' },
        { name: 'Events', path: '/events' },
        { name: 'Blog', path: '/blog' },
        { name: 'Outreach', path: '/digital-outreach' },
        { name: 'Contact', path: '/contact' }
    ];

    const baseClass = "transition-all duration-200 block rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-primary-light dark:focus-visible:ring-offset-background-dark";
    const activeClass = "text-white bg-primary font-semibold shadow-md";
    
    // Determine inactive class based on context
    let inactiveClass = "text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10";
    
    // While the header is transparent over a dark hero, use white links for visibility
    if (onDark && !mobile) {
         inactiveClass = "text-white/80 hover:text-white hover:bg-white/20";
    }

    // Mobile specific styling vs Desktop
    const mobileClasses = "text-lg py-3 px-6 w-full text-center";
    const desktopClasses = "text-sm py-2 px-4";

    return (
        <>
            {links.map(link => (
                <NavLink 
                  key={link.name} 
                  to={link.path} 
                  onClick={onLinkClick}
                  className={({ isActive }) => `${baseClass} ${mobile ? mobileClasses : desktopClasses} ${isActive ? activeClass : inactiveClass}`}
                  end
                >
                    {link.name}
                </NavLink>
            ))}
        </>
    );
};

const ThemeToggle: React.FC<{ theme: string; toggleTheme: () => void; }> = ({ theme, toggleTheme }) => (
    <button 
      onClick={toggleTheme} 
      type="button"
      className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-primary-light"
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
        {theme === 'dark' ? (
            <Icon name="sun" className="h-5 w-5" />
        ) : (
            <Icon name="moon" className="h-5 w-5" />
        )}
    </button>
);

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  // Wraps the header bar and the mobile menu, so the close button is inside the focus trap
  const menuRef = useRef<HTMLDivElement>(null);
  useFocusTrap(menuRef, isOpen);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Close the mobile menu on any navigation (including back/forward). Done while
  // rendering, not in an effect, so the open menu never paints on the new page.
  const [menuPathname, setMenuPathname] = useState(location.pathname);
  if (menuPathname !== location.pathname) {
    setMenuPathname(location.pathname);
    setIsOpen(false);
  }

  // Close the mobile menu on Escape, or when the viewport grows past the lg breakpoint
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    const desktop = window.matchMedia('(min-width: 1024px)');
    const handleDesktop = (e: MediaQueryListEvent) => {
      if (e.matches) setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    desktop.addEventListener('change', handleDesktop);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      desktop.removeEventListener('change', handleDesktop);
    };
  }, [isOpen]);

  // The PageHero on screen reports its tone. Screens without one
  // (404, loading, errors) get the dark-text header.
  const isDarkHero = useHeroTone() === 'dark';

  // White header content only while transparent over a dark hero.
  // The open mobile menu has a light background, so treat it like scrolled.
  const onDarkHero = !scrolled && !isOpen && isDarkHero;

  // Determine text color based on scroll state and page type
  // Default: Dark text in light mode, White text in dark mode
  // Transparent & Dark Hero: Always White text
  let textColorClass = "text-gray-900 dark:text-white";
  if (onDarkHero) {
    textColorClass = "text-white";
  }

  return (
    <div ref={menuRef}>
        <header className={`fixed z-50 transition-[background-color,border-color,box-shadow,padding] duration-500 ease-in-out ${scrolled 
            ? 'top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-lg border border-white/20 dark:border-slate-700/50 py-3 px-6' 
            : 'top-0 left-0 w-full bg-transparent py-6 px-4 sm:px-6 lg:px-8'}`}>
        
        <div className="flex items-center justify-between w-full">
            <NavLink to="/" onClick={() => setIsOpen(false)} aria-label="CVOCA home" className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-primary-light dark:focus-visible:ring-offset-background-dark">
                <HeaderLogo textColorClass={textColorClass} onDark={onDarkHero} />
            </NavLink>
            
            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center">
                <nav className={`flex items-center space-x-1 rounded-full p-1 transition-all duration-300 ${scrolled ? 'bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-gray-100 dark:border-gray-700/50 shadow-sm' : ''}`}>
                    <NavLinks onDark={onDarkHero} />
                </nav>
            </div>
            
            <div className="hidden lg:flex items-center ml-4">
                <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            </div>
            
            {/* Mobile Toggle */}
            <div className="lg:hidden flex items-center gap-3">
                <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                <button 
                  type="button"
                  onClick={() => setIsOpen(!isOpen)}
                  className={`p-2.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-primary-light transition-colors ${onDarkHero ? 'text-white hover:bg-white/20' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  aria-label={isOpen ? 'Close menu' : 'Open menu'}
                  aria-expanded={isOpen}
                  aria-controls="mobile-menu"
                >
                  {isOpen ? (
                      <Icon name="close" className="block h-6 w-6" />
                  ) : (
                      <Icon name="menu" className="block h-6 w-6" />
                  )}
                </button>
            </div>
        </div>
        </header>

        {/* Mobile Menu Overlay */}
        {isOpen && (
            <div id="mobile-menu" className="lg:hidden fixed inset-0 z-40 bg-white dark:bg-background-dark pt-28 pb-8 px-6 overflow-y-auto animate-fade-in-up">
                 <div className="flex flex-col items-center space-y-4 min-h-full">
                     <nav aria-label="Main" className="flex flex-col items-center space-y-4 w-full">
                         <NavLinks mobile onLinkClick={() => setIsOpen(false)}/>
                     </nav>
                     <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800 w-full text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">Professional Excellence</p>
                     </div>
                 </div>
            </div>
        )}
    </div>
  );
};

export default Header;

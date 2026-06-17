
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Logo from './Logo';
import Icon from './Icon';

interface HeaderProps {
  theme: string;
  toggleTheme: () => void;
}

const HeaderLogo: React.FC<{ textColorClass: string }> = ({ textColorClass }) => {
  // If the text is white (implies dark background), we need the Dark Theme Logo (which has white text)
  // If the text is dark (implies light background), we need the Light Theme Logo (which has dark text)
  const logoVariant = textColorClass.includes('text-white') ? 'dark' : 'light';

  return (
    <div className="flex items-center gap-3 group">
      <div className={`relative w-10 h-10 md:w-12 md:h-12 transition-transform duration-300 group-hover:scale-110`}>
        <Logo variant={logoVariant} />
      </div>
      <div className="flex flex-col">
        <span className={`text-xl md:text-2xl font-extrabold tracking-tight leading-none ${textColorClass}`}>CVOCA</span>
        <span className="text-[0.6rem] md:text-[0.65rem] font-bold tracking-widest uppercase text-primary dark:text-primary-light">Association</span>
      </div>
    </div>
  );
};

const NavLinks: React.FC<{onLinkClick?: () => void, mobile?: boolean, textColorClass?: string, scrolled?: boolean}> = ({ onLinkClick, mobile, textColorClass, scrolled }) => {
    const links = [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
        { name: 'Membership', path: '/membership' },
        { name: 'Events', path: '/events' },
        { name: 'Blog', path: '/blog' },
        { name: 'Outreach', path: '/digital-outreach' },
        { name: 'Contact', path: '/contact' }
    ];

    const baseClass = "transition-all duration-200 block rounded-full";
    const activeClass = "text-white bg-primary font-semibold shadow-md";
    
    // Determine inactive class based on context
    let inactiveClass = "text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10";
    
    // If we are not scrolled and on a dark hero page (indicated by textColorClass being text-white), 
    // we want specific hover styles for visibility
    if (!scrolled && textColorClass?.includes('text-white') && !mobile) {
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
      className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors shadow-sm" 
      aria-label="Toggle theme"
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

  // Identify pages with dark hero sections where we need white text initially
  const darkHeroPaths = ['/', '/about', '/membership', '/events', '/digital-outreach', '/blog', '/contact'];
  const isDarkHero = darkHeroPaths.includes(location.pathname);

  // Determine text color based on scroll state and page type
  // Default: Dark text in light mode, White text in dark mode
  // Transparent & Dark Hero: Always White text
  let textColorClass = "text-gray-900 dark:text-white";
  if (!scrolled && isDarkHero) {
    textColorClass = "text-white";
  }

  return (
    <>
        <header className={`fixed z-50 transition-all duration-500 ease-in-out ${scrolled 
            ? 'top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-lg border border-white/20 dark:border-slate-700/50 py-3 px-6' 
            : 'top-0 left-0 w-full bg-transparent py-6 px-4 sm:px-6 lg:px-8'}`}>
        
        <div className="flex items-center justify-between w-full">
            <NavLink to="/" onClick={() => setIsOpen(false)}>
                <HeaderLogo textColorClass={textColorClass} />
            </NavLink>
            
            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center">
                <nav className={`flex items-center space-x-1 rounded-full p-1 transition-all duration-300 ${scrolled ? 'bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-gray-100 dark:border-gray-700/50 shadow-sm' : ''}`}>
                    <NavLinks textColorClass={textColorClass} scrolled={scrolled} />
                </nav>
            </div>
            
            <div className="hidden lg:flex items-center ml-4">
                <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            </div>
            
            {/* Mobile Toggle */}
            <div className="lg:hidden flex items-center gap-3">
                <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                <button 
                  onClick={() => setIsOpen(!isOpen)} 
                  className={`p-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors ${!scrolled && isDarkHero ? 'text-white hover:bg-white/20' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  aria-label="Toggle menu"
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
            <div className="lg:hidden fixed inset-0 z-40 bg-white dark:bg-slate-950 pt-28 pb-8 px-6 overflow-y-auto animate-fade-in-up">
                 <div className="flex flex-col items-center space-y-4 min-h-full">
                     <NavLinks mobile onLinkClick={() => setIsOpen(false)}/>
                     <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800 w-full text-center">
                        <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">Professional Excellence</p>
                     </div>
                 </div>
            </div>
        )}
    </>
  );
};

export default Header;

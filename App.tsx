import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import SchemaMarkup from './components/SchemaMarkup';
import { HeroToneProvider } from './components/ui/heroTone';
import { getOrganizationSchema, getWebsiteSchema } from './utils/schema';

// Lazy load page components for code splitting
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Membership = lazy(() => import('./pages/Membership'));
const Events = lazy(() => import('./pages/Events'));
const Blog = lazy(() => import('./pages/Blog'));
const DigitalOutreach = lazy(() => import('./pages/DigitalOutreach'));
const Contact = lazy(() => import('./pages/Contact'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const NotFound = lazy(() => import('./pages/NotFound'));

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Resets the error boundary on navigation, so one broken route doesn't stick
const RouteErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();
  return <ErrorBoundary key={pathname}>{children}</ErrorBoundary>;
};

const App: React.FC = () => {
  // public/theme-init.js has already applied the saved or OS theme before first paint
  const [theme, setTheme] = useState(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Only an explicit choice is saved, so untouched visitors keep following the OS setting
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try {
      localStorage.setItem('theme', next);
    } catch {
      // Storage blocked: the choice lasts for this visit only
    }
  };

  return (
    <BrowserRouter>
      <ScrollToTop />
      {/* Global SEO Schema - Organization and Website */}
      <SchemaMarkup schema={[getOrganizationSchema(), getWebsiteSchema()]} />
      <div className="flex flex-col min-h-screen font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-white focus:shadow-lg"
        >
          Skip to main content
        </a>
        <HeroToneProvider>
        <Header theme={theme} toggleTheme={toggleTheme} />
        {/* Removed pt-24 to allow Hero sections to sit behind the transparent header */}
        <main id="main-content" tabIndex={-1} className="flex-grow focus:outline-none">
          <RouteErrorBoundary>
          <Suspense fallback={<LoadingSpinner fullPage />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/membership" element={<Membership />} />
              <Route path="/events" element={<Events />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/digital-outreach" element={<DigitalOutreach />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          </RouteErrorBoundary>
        </main>
        </HeroToneProvider>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
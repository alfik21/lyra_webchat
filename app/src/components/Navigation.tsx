import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { navigationConfig } from '../config';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  // Check if we're on the chat page (white background)
  const isChatPage = location.pathname === '/chat';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  if (!navigationConfig.logo) return null;

  // Navigation link component that handles both hash and route links
  const NavLink = ({ href, label, className }: { href: string; label: string; className?: string }) => {
    // If it's a hash link on the same page
    if (href.startsWith('#')) {
      return (
        <a
          href={href}
          className={className}
          onClick={(e) => {
            if (location.pathname !== '/') {
              // If not on home page, navigate to home with hash
              return;
            }
            e.preventDefault();
            const element = document.querySelector(href);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          {label}
        </a>
      );
    }

    // Regular route link
    return (
      <Link to={href} className={className}>
        {label}
      </Link>
    );
  };

  const textColor = isChatPage ? 'text-gray-900' : 'text-white';
  const textMutedColor = isChatPage ? 'text-gray-600' : 'text-white/70';
  const bgColor = isChatPage ? 'bg-white/90' : 'bg-black/90';
  const borderColor = isChatPage ? 'border-gray-200' : 'border-white/10';

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-custom-expo ${
          isScrolled || isChatPage
            ? `${bgColor} backdrop-blur-md border-b ${borderColor} py-4`
            : 'bg-transparent py-6'
        }`}
      >
        <div className="w-full px-6 lg:px-12 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className={`font-display font-black text-xl tracking-tight ${textColor} hover:text-pink transition-colors duration-300`}
          >
            {navigationConfig.logo}<span className="text-pink">{navigationConfig.logoAccent}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navigationConfig.navLinks.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                className={`font-body text-sm ${textMutedColor} hover:text-pink transition-colors duration-300 uppercase tracking-widest`}
              />
            ))}
            {navigationConfig.ctaText && (
              <Link
                to="/chat"
                className="px-6 py-2 bg-pink text-black font-display font-bold text-sm uppercase tracking-wider hover:bg-white transition-colors duration-300 rounded-full"
              >
                {navigationConfig.ctaText}
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className={`md:hidden p-2 ${textColor}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-500 ease-custom-expo md:hidden ${
          isMobileMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        } ${isChatPage ? 'bg-white' : 'bg-black'}`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8">
          {navigationConfig.navLinks.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={link.label}
              className={`font-display font-bold text-3xl ${isChatPage ? 'text-gray-900' : 'text-white'} hover:text-pink transition-colors duration-300 uppercase`}
            />
          ))}
          {navigationConfig.ctaText && (
            <Link
              to="/chat"
              className="mt-8 px-8 py-3 bg-pink text-black font-display font-bold text-lg uppercase tracking-wider rounded-full"
            >
              {navigationConfig.ctaText}
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default Navigation;

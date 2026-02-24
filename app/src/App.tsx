import { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Hero from './sections/Hero';
import ProductShowcase from './sections/ProductShowcase';
import ColorPalette from './sections/ColorPalette';
import Finale from './sections/Finale';
import Footer from './sections/Footer';
import Navigation from './components/Navigation';
import CustomCursor from './components/CustomCursor';
import ChatPage from './pages/ChatPage';
import FeaturesPage from './pages/FeaturesPage';
import AboutPage from './pages/AboutPage';

gsap.registerPlugin(ScrollTrigger);

// Main landing page component
function LandingPage() {
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Velocity-based skew effect
    let currentSkew = 0;
    let targetSkew = 0;
    
    const updateSkew = () => {
      currentSkew += (targetSkew - currentSkew) * 0.1;
      if (mainRef.current) {
        mainRef.current.style.transform = `skewY(${currentSkew}deg)`;
      }
      requestAnimationFrame(updateSkew);
    };
    
    const handleScroll = () => {
      const scrollSpeed = Math.abs(window.scrollY - (window as any).lastScrollY || 0);
      targetSkew = Math.min(scrollSpeed * 0.02, 3);
      (window as any).lastScrollY = window.scrollY;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    updateSkew();
    
    // Reset skew when scroll stops
    let scrollTimeout: ReturnType<typeof setTimeout>;
    const resetSkew = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        targetSkew = 0;
      }, 100);
    };
    window.addEventListener('scroll', resetSkew, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', resetSkew);
    };
  }, []);

  return (
    <main ref={mainRef} className="relative transition-transform duration-100 ease-out will-change-transform">
      <Hero />
      <ProductShowcase />
      <ColorPalette />
      <Finale />
      <Footer />
    </main>
  );
}

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

// Main App with routing
function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const isChatPage = location.pathname.startsWith('/chat');

  // Obsługa hash #/chat[/conv-xxx] -> routing /chat lub /chat/conv/:convId
  useEffect(() => {
    const h = (window.location.hash || '').trim();
    if (h.startsWith('#/chat')) {
      const parts = h.split('/');
      const last = parts[parts.length - 1] || '';
      const hasConv = last.startsWith('conv-');
      const target = hasConv ? `/chat/conv/${encodeURIComponent(last)}` : '/chat';
      navigate(target, { replace: true });
    }
  }, [navigate, location.hash]);

  return (
    <div className={`relative min-h-screen overflow-x-hidden ${isChatPage ? 'bg-white' : 'bg-black'}`}>
      {/* Grain overlay - only on landing pages */}
      {!isChatPage && <div className="grain-overlay" />}
      
      {/* Custom cursor - only on landing pages */}
      {!isChatPage && <CustomCursor />}
      
      {/* Navigation */}
      <Navigation />
      
      {/* Scroll to top */}
      <ScrollToTop />
      
      {/* Routes */}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat/conv/:convId" element={<ChatPage />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

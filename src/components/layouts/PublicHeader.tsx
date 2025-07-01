import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import MobileNav from './MobileNav';

const Logo = () => (
  <Link to="/" className="flex items-center space-x-2">
    <div className="h-8 w-8 bg-gradient-to-r from-green-400 to-teal-500 rounded-md flex items-center justify-center relative">
      <span className="text-white font-bold text-2xl">ق</span>
      <div className="absolute -top-1 -right-1 w-4 h-4 bg-teal-300 rounded-full flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-2 w-2 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
      </div>
    </div>
    <span className="text-xl font-bold text-gray-900">Mutabaahly</span>
  </Link>
);

const sectionLinks = [
  { id: 'home', label: 'Home' },
  { id: 'features-section', label: 'Features' },
  { id: 'video-tutorial', label: 'Video Tutorial' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'cta', label: 'Contact' },
];

const PublicHeader: React.FC = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      let current = 'home';
      for (const section of sectionLinks) {
        const el = document.getElementById(section.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 80) {
            current = section.id;
          }
        }
      }
      setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <Logo />
            </div>
            
            <div className="md:hidden">
              <button
                onClick={() => setMobileNavOpen((open) => !open)}
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700"
              >
                <span className="sr-only">{mobileNavOpen ? 'Close main menu' : 'Open main menu'}</span>
                {mobileNavOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              {sectionLinks.map(link => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  className={`text-gray-700 hover:text-emerald-600 font-medium transition-colors ${activeSection === link.id ? 'text-emerald-600 font-bold' : ''}`}
                  onClick={e => {
                    e.preventDefault();
                    const el = document.getElementById(link.id);
                    if (el) {
                      window.scrollTo({
                        top: el.offsetTop - 64,
                        behavior: 'smooth',
                      });
                    }
                  }}
                >
                  {link.label}
                </a>
              ))}
              <Link to="/auth" className="ml-4">
                <button className="bg-gradient-to-r from-emerald-500 to-teal-400 hover:opacity-90 text-white font-semibold px-6 py-2 rounded-lg shadow transition-colors">Login</button>
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <div className="md:hidden">
        <MobileNav isOpen={mobileNavOpen} setIsOpen={setMobileNavOpen} direction="top" />
      </div>
    </>
  );
};

export default PublicHeader; 
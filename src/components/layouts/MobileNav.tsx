'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';


interface MobileNavProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  direction?: 'top' | 'right';
}

const sections = [
  { id: 'home', label: 'Home' },
  { id: 'features-section', label: 'Features' },
  { id: 'video-tutorial', label: 'Video Tutorial' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'cta', label: 'Contact' },
];



const MobileNav: React.FC<MobileNavProps> = ({ isOpen, setIsOpen }) => {
  const closeNav = () => setIsOpen(false);
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      let current = 'home';
      for (const section of sections) {
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

  const handleLogin = () => {
    router.push('/auth');
    closeNav();
  };

  return isOpen ? (
    <div className="fixed top-16 left-0 w-full bg-white shadow-lg z-50 animate-fadeIn flex flex-col border-b transition-all duration-300" style={{animation: 'fadeInDown 0.2s'}}>
      <nav className="flex flex-col items-stretch px-6 py-4 space-y-4">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => {
              const el = document.getElementById(section.id);
              if (el) {
                window.scrollTo({
                  top: el.offsetTop - 64,
                  behavior: 'smooth',
                });
              }
              closeNav();
            }}
            className={`text-lg text-gray-800 font-medium text-left py-2 px-2 rounded hover:bg-emerald-50 transition-colors ${activeSection === section.id ? 'text-emerald-600 font-bold' : ''}`}
          >
            {section.label}
          </button>
        ))}
      </nav>
      <div className="px-6 pb-6">
        <button
          onClick={handleLogin}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:opacity-90 text-white font-semibold py-3 rounded-xl text-lg shadow transition-colors"
        >
          Login
        </button>
      </div>
      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-16px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  ) : null;
};

export default MobileNav; 
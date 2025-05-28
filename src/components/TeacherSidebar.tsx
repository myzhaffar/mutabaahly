"use client";

import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Users, BookMarked, UserCircle, Menu, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';

const TeacherSidebar = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const { profile } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('teacher-sidebar');
      const menuButton = document.getElementById('mobile-menu-button');
      
      if (isMobileMenuOpen && sidebar && menuButton) {
        if (!sidebar.contains(event.target as Node) && !menuButton.contains(event.target as Node)) {
          setIsMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  if (profile?.role !== 'teacher') {
    return null;
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/students', label: 'Daftar Siswa', icon: Users },
    { href: '/tests/manage', label: 'Tes Kenaikan Level', icon: BookMarked },
    { href: '/profile', label: 'Profile', icon: UserCircle },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        id="mobile-menu-button"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-islamic-700 text-white rounded-md shadow-lg hover:bg-islamic-800 transition-colors"
        aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
      >
        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        id="teacher-sidebar"
        className={`
          w-64 min-h-screen bg-gradient-to-b from-islamic-700 to-islamic-800 text-white shadow-lg 
          fixed top-0 left-0 z-40 transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          overflow-y-auto scrollbar-thin scrollbar-thumb-islamic-600 scrollbar-track-transparent
        `}
      >
        <div className="sticky top-0 bg-gradient-to-b from-islamic-700 to-islamic-800 pt-6 pb-4 px-5">
          <Link 
            to="/dashboard" 
            className="flex items-center space-x-3"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-islamic-500 to-accent-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">Q</span>
            </div>
            <span className="font-sf-pro font-semibold text-xl text-white">
              Al-Quran Progress
            </span>
          </Link>
        </div>

        <nav className="px-5 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href) && item.href !== '/');
            
            return (
              <Link
                key={item.label}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center space-x-3 p-3 rounded-xl text-gray-200 
                  hover:bg-islamic-600 hover:text-white transition-all duration-150 ease-in-out
                  ${isActive ? 'bg-islamic-500 text-white shadow-md' : ''}
                `}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="text-base font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default TeacherSidebar;

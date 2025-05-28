
"use client";

import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Users, BookMarked, UserCircle, Menu, X } from 'lucide-react';
import React, { useState } from 'react';

const TeacherSidebar = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const { profile } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (profile?.role !== 'teacher') {
    return null;
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/students', label: 'Daftar Siswa', icon: Users },
    { href: '/tests/manage', label: 'Tes Kenaikan Level', icon: BookMarked },
    { href: '/profile', label: 'Profile', icon: UserCircle },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-islamic-700 text-white rounded-md shadow-lg"
      >
        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-64 min-h-screen bg-gradient-to-b from-islamic-700 to-islamic-800 text-white p-5 shadow-lg 
        fixed top-0 left-0 z-40 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="mb-10 flex items-center space-x-3 mt-12 lg:mt-0">
          <Link to="/dashboard" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-islamic-500 to-accent-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">Q</span>
            </div>
            <span className="font-sf-pro font-semibold text-xl lg:text-2xl text-white">
              Al-Quran Progress
            </span>
          </Link>
        </div>
        <nav className="space-y-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href) && item.href !== '/');
            return (
              <Link
                key={item.label}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 p-3 rounded-xl text-gray-200 hover:bg-islamic-600 hover:text-white transition-colors duration-150 ease-in-out
                  ${isActive ? 'bg-islamic-500 text-white shadow-md' : ''}
                `}
              >
                <Icon className="h-6 w-6" />
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

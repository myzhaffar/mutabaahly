
"use client";

import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Users, BookMarked, UserCircle } from 'lucide-react';
import React from 'react';

const TeacherSidebar = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const { profile } = useAuth();

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
    <aside className="w-64 min-h-screen bg-gradient-to-b from-islamic-700 to-islamic-800 text-white p-5 shadow-lg fixed top-0 left-0 z-40">
      <div className="mb-10 flex items-center space-x-3">
        <Link to="/dashboard" className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-islamic-500 to-accent-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">Q</span>
          </div>
          <span className="font-sf-pro font-semibold text-2xl text-white">
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
  );
};

export default TeacherSidebar;

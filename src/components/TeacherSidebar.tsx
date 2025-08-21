"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/useAuth';
import { Home, Users, BookMarked, UserCircle } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


interface TeacherSidebarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}



const TeacherSidebar: React.FC<TeacherSidebarProps> = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const pathname = usePathname();
  const { profile } = useAuth();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname, setIsMobileMenuOpen]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('teacher-sidebar');
      if (isMobileMenuOpen && sidebar) {
        if (!sidebar.contains(event.target as Node)) {
          setIsMobileMenuOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen, setIsMobileMenuOpen]);



  if (profile?.role !== 'teacher') {
    return null;
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/students', label: 'Students', icon: Users },
    { href: '/tests/manage', label: 'Tests', icon: BookMarked },
    { href: '/profile', label: 'Profile', icon: UserCircle },
  ];

  return (
    <>
      {/* Mobile Menu Button (now handled by header) */}
      {/* Backdrop */}
      <div 
        className={`
          lg:hidden fixed inset-0 bg-black z-40 transition-all duration-500 ease-out
          ${isMobileMenuOpen 
            ? 'bg-opacity-50 pointer-events-auto' 
            : 'bg-opacity-0 pointer-events-none'
          }
        `}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />
      {/* Sidebar */}
      <aside
        id="teacher-sidebar"
        className={`
          w-64 min-h-screen bg-gradient-to-r from-green-400 to-teal-500 text-white shadow-lg 
          fixed top-0 left-0 z-40 transform transition-all duration-500 ease-out
          lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          overflow-y-auto scrollbar-thin scrollbar-thumb-teal-600 scrollbar-track-transparent
          ${isMobileMenuOpen ? 'shadow-2xl' : 'shadow-lg'}
        `}
      >
        <div className="sticky top-0 bg-gradient-to-r from-green-400 to-teal-500 pt-6 pb-4 px-5">
          <Link 
            href="/dashboard" 
            className="flex items-center space-x-3"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <span className="font-sf-pro font-semibold text-xl text-white">
              Mutabaahly
            </span>
          </Link>
        </div>
        <nav className="px-5 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname?.startsWith(item.href) && item.href !== '/');
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center space-x-3 p-3 rounded-xl text-gray-200 
                  hover:bg-teal-600/50 hover:text-white transition-all duration-300 ease-out
                  hover:scale-105 hover:shadow-lg transform
                  ${isActive ? 'bg-teal-600/70 text-white shadow-md scale-105' : ''}
                `}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="text-base font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        {/* User Profile Section */}
        <Link 
          href="/profile" 
          className="absolute bottom-0 left-0 right-0 px-5 py-4 bg-teal-600/30 hover:bg-teal-600/50 transition-all duration-300 ease-out cursor-pointer"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div className="flex items-center space-x-4 p-2">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-r from-green-400 to-teal-500 text-white text-sm">
                {profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{profile?.full_name}</span>
              <span className="text-xs text-muted-foreground capitalize">{profile?.role}</span>
            </div>
          </div>
        </Link>
      </aside>
    </>
  );
};

export default TeacherSidebar;

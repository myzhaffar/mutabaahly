"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/useAuth';
import { Home, Users, BookMarked, UserCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface TeacherSidebarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

const TeacherSidebar: React.FC<TeacherSidebarProps> = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, signOut } = useAuth();

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

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (profile?.role !== 'teacher') {
    return null;
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/students', label: 'Students', icon: Users },
    { href: '/tests/manage', label: 'Level Tests', icon: BookMarked },
    { href: '/profile', label: 'Profile', icon: UserCircle },
  ];

  return (
    <>
      {/* Mobile Menu Button (now handled by header) */}
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
          w-64 min-h-screen bg-gradient-to-r from-green-400 to-teal-500 text-white shadow-lg 
          fixed top-0 left-0 z-40 transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          overflow-y-auto scrollbar-thin scrollbar-thumb-teal-600 scrollbar-track-transparent
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
                  hover:bg-teal-600/50 hover:text-white transition-all duration-150 ease-in-out
                  ${isActive ? 'bg-teal-600/70 text-white shadow-md' : ''}
                `}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="text-base font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        {/* User Profile Section */}
        <div className="absolute bottom-0 left-0 right-0 px-5 py-4 bg-teal-600/30">
          <div className="flex items-center space-x-3 mb-4">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-teal-600">
                {profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {profile?.full_name}
              </p>
              <p className="text-xs text-gray-300 truncate">
                Teacher
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-200 hover:text-white hover:bg-teal-600/50"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>
    </>
  );
};

export default TeacherSidebar;

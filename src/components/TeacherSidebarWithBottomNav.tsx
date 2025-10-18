"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/useAuth';
import { Home, Award, BookOpen, UserCircle } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TeacherSidebarWithBottomNavProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

const TeacherSidebarWithBottomNav: React.FC<TeacherSidebarWithBottomNavProps> = () => {
  const pathname = usePathname();
  const { profile } = useAuth();

  if (profile?.role !== 'teacher') {
    return null;
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/students', label: 'Student Rankings', mobileLabel: 'Rankings', icon: Award },
    { href: '/tests/manage', label: 'Test Results', icon: BookOpen },
    { href: '/profile', label: 'Profile', icon: UserCircle },
  ];

  const isActive = (path: string) => {
    return pathname === path || 
      (path !== '/dashboard' && pathname?.startsWith(path));
  };


  return (
    <>
      {/* Desktop Sidebar - only show on lg and above */}
      <aside
        id="teacher-sidebar"
        className="hidden lg:block w-64 min-h-screen bg-gradient-to-r from-green-400 to-teal-500 text-white shadow-lg fixed top-0 left-0 z-40 overflow-y-auto scrollbar-thin scrollbar-thumb-teal-600 scrollbar-track-transparent"
      >
        <div className="sticky top-0 bg-gradient-to-r from-green-400 to-teal-500 pt-6 pb-4 px-5">
          <Link href="/dashboard" className="flex items-center space-x-3">
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

      {/* Bottom Navigation Bar for Mobile - only show below lg */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t shadow-lg">
        <div className="flex justify-around items-center h-14">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
                isActive(item.href)
                  ? 'text-teal-600'
                  : 'text-gray-400 hover:text-teal-500'
              }`}
            >
              <item.icon className={`h-5 w-5 mb-0.5 ${isActive(item.href) ? 'text-teal-600' : 'text-gray-400'}`} />
              <span className="text-xs font-medium whitespace-nowrap overflow-hidden text-ellipsis px-1">{item.mobileLabel || item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
};

export default TeacherSidebarWithBottomNav;

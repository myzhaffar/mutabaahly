"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/useAuth';
import { Home, Users, BookMarked, UserCircle, ChevronLeft, ChevronRight, Award, BookOpen, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface UnifiedSidebarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
  role: 'teacher' | 'parent';
}

const UnifiedSidebar: React.FC<UnifiedSidebarProps> = ({ 
  isMobileMenuOpen, 
  setIsMobileMenuOpen,
  isCollapsed = false,
  setIsCollapsed,
  role
}) => {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname, setIsMobileMenuOpen]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('unified-sidebar');
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
  };

  // Define navigation items based on role
  const getNavItems = () => {
    if (role === 'teacher') {
      return [
        { href: '/dashboard', label: 'Dashboard', icon: Home },
        { href: '/students', label: 'Students', icon: Users },
        { href: '/tests/manage', label: 'Tests', icon: BookMarked },
        { href: '/profile', label: 'Profile', icon: UserCircle },
      ];
    } else {
      return [
        { href: '/dashboard', label: 'Dashboard', icon: Home },
        { href: '/students', label: 'Student Rankings', mobileLabel: 'Students', icon: Award },
        { href: '/tests/view', label: 'Test Results', mobileLabel: 'Tests', icon: BookOpen },
        { href: '/profile', label: 'Profile', icon: UserCircle },
      ];
    }
  };

  const navItems = getNavItems();

  const toggleCollapse = () => {
    if (setIsCollapsed) {
      setIsCollapsed(!isCollapsed);
    }
  };

  const isActive = (path: string) => {
    return pathname === path || 
      (path !== '/dashboard' && pathname?.startsWith(path) && path !== '/');
  };

  // For mobile view, we don't show the sidebar since we have bottom navigation
  // Desktop view only
  return (
    <>
      {/* Backdrop for mobile */}
      <div 
        className={`
          lg:hidden fixed inset-0 bg-black z-40 transition-all duration-300 ease-in-out
          ${isMobileMenuOpen 
            ? 'bg-opacity-50 pointer-events-auto' 
            : 'bg-opacity-0 pointer-events-none'
          }
        `}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />
      {/* Sidebar - visible on desktop/lg screens */}
      <aside
        id="unified-sidebar"
        className={`
          ${isCollapsed ? 'w-20' : 'w-64'} min-h-screen bg-gradient-to-r from-green-400 to-teal-500 text-white shadow-lg 
          fixed top-0 left-0 z-40 transform transition-all duration-300 ease-in-out
          lg:translate-x-0 hidden lg:block
          overflow-y-auto scrollbar-thin scrollbar-thumb-teal-600 scrollbar-track-transparent
        `}
      >
        <div className="sticky top-0 bg-gradient-to-r from-green-400 to-teal-500 pt-6 pb-4 px-5">
          <div className="flex items-center justify-between">
            {!isCollapsed ? (
              <Link 
                href="/dashboard" 
                className="flex items-center space-x-3"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">M</span>
                </div>
                <span className="font-sf-pro font-semibold text-xl text-white truncate">
                  Mutabaahly
                </span>
              </Link>
            ) : (
              <Link 
                href="/dashboard" 
                className="flex items-center justify-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">M</span>
                </div>
              </Link>
            )}
            <button 
              onClick={toggleCollapse}
              className="text-white hover:text-teal-200 transition-colors p-1 rounded-full hover:bg-teal-600/50"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>
        </div>
        <nav className="px-5 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center p-3 rounded-xl text-gray-200 
                  hover:bg-teal-600/50 hover:text-white transition-all duration-200 ease-in-out
                  ${isActive(item.href) ? 'bg-teal-600/70 text-white shadow-md' : ''}
                  ${isCollapsed ? 'justify-center' : 'space-x-3'}
                  group
                `}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span className="text-base font-medium truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        {/* User Profile Section */}
        <div className="absolute bottom-0 left-0 right-0 px-5 py-4 bg-teal-600/30">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-4'} p-2`}>
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-r from-green-400 to-teal-500 text-white text-sm">
                {profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate">{profile?.full_name}</span>
                <span className="text-xs text-muted-foreground capitalize truncate">{profile?.role}</span>
              </div>
            )}
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start mt-2 text-red-300 hover:text-red-100 hover:bg-red-500/20"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {!isCollapsed && <span>Sign Out</span>}
          </Button>
        </div>
      </aside>
    </>
  );
};

export default UnifiedSidebar;
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, BookMarked, UserCircle, Award, BookOpen } from 'lucide-react';

interface MobileBottomNavProps {
  role: 'teacher' | 'parent';
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ role }) => {
  const pathname = usePathname();

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
        { href: '/students', label: 'Students', icon: Award },
        { href: '/tests/view', label: 'Tests', icon: BookOpen },
        { href: '/profile', label: 'Profile', icon: UserCircle },
      ];
    }
  };

  const navItems = getNavItems();

  const isActive = (path: string) => {
    return pathname === path || 
      (path !== '/dashboard' && pathname?.startsWith(path) && path !== '/');
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
                isActive(item.href)
                  ? 'text-teal-600'
                  : 'text-gray-500 hover:text-teal-500'
              }`}
            >
              <Icon className={`h-6 w-6 mb-1 ${isActive(item.href) ? 'text-teal-600' : 'text-gray-500'}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/useAuth';
import { Home, Users, BookMarked, UserCircle } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTranslation } from 'react-i18next';
import '@/i18n';
import { Menu as DropdownMenu, Transition } from '@headlessui/react';

interface TeacherSidebarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isChanging, setIsChanging] = useState(false);
  const [, forceUpdate] = useState({});

  // Initialize language from localStorage only once on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('i18nextLng') || 'en';
    if (i18n.language !== savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]); // Include i18n as dependency

  const handleLanguageChange = async (language: string) => {
    if (isChanging || i18n.language === language) return;
    
    setIsChanging(true);
    try {
      i18n.changeLanguage(language, (err) => {
        if (!err) {
          localStorage.setItem('i18nextLng', language);
          forceUpdate({}); // Force re-render
        }
      });
    } catch (error) {
      console.error('Error changing language:', error);
    } finally {
      setIsChanging(false);
    }
  };

  const current = i18n.language === 'id' ? 'ID' : 'EN';
  return (
    <DropdownMenu as="div" className="relative inline-block text-left ml-2">
      <DropdownMenu.Button 
        className="inline-flex items-center px-2 py-1 text-base font-semibold text-gray-800 bg-transparent border-none shadow-none hover:bg-gray-100 hover:bg-opacity-20 focus:outline-none transition-all duration-200 ease-in-out rounded-md"
        disabled={isChanging}
      >
        {isChanging ? (
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
        ) : (
          current
        )}
        <svg className="ml-2 h-4 w-4 text-gray-500 transition-transform duration-200 ease-in-out group-hover:rotate-180" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7l3 3 3-3" />
        </svg>
      </DropdownMenu.Button>
      <Transition
        as={React.Fragment}
        enter="transition ease-out duration-300"
        enterFrom="transform opacity-0 scale-95 translate-y-2"
        enterTo="transform opacity-100 scale-100 translate-y-0"
        leave="transition ease-in duration-200"
        leaveFrom="transform opacity-100 scale-100 translate-y-0"
        leaveTo="transform opacity-0 scale-95 translate-y-2"
      >
        <DropdownMenu.Items className="origin-top-right absolute right-0 mt-2 w-28 rounded-xl shadow-lg bg-gray-800 ring-1 ring-gray-700 ring-opacity-5 focus:outline-none z-50 p-2">
          <div className="space-y-1">
            <DropdownMenu.Item>
              {({ active }) => (
                <button
                  onClick={() => handleLanguageChange('en')}
                  disabled={isChanging || i18n.language === 'en'}
                  className={`w-full text-left px-3 py-2 text-base transition-all duration-300 ease-out rounded-lg transform hover:scale-105 ${i18n.language === 'en' ? 'font-bold text-emerald-400' : 'text-gray-200'} ${active ? 'bg-gray-600' : 'hover:bg-gray-600'}`}
                >
                  EN
                </button>
              )}
            </DropdownMenu.Item>
            <DropdownMenu.Item>
              {({ active }) => (
                <button
                  onClick={() => handleLanguageChange('id')}
                  disabled={isChanging || i18n.language === 'id'}
                  className={`w-full text-left px-3 py-2 text-base transition-all duration-300 ease-out rounded-lg transform hover:scale-105 ${i18n.language === 'id' ? 'font-bold text-emerald-400' : 'text-gray-200'} ${active ? 'bg-gray-600' : 'hover:bg-gray-600'}`}
                >
                  ID
                </button>
              )}
            </DropdownMenu.Item>
          </div>
        </DropdownMenu.Items>
      </Transition>
    </DropdownMenu>
  );
};

const TeacherSidebar: React.FC<TeacherSidebarProps> = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const pathname = usePathname();
  const { profile } = useAuth();
  const { t } = useTranslation();

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
    { href: '/dashboard', label: t('navigation.dashboard'), icon: Home },
    { href: '/students', label: t('navigation.students'), icon: Users },
    { href: '/tests/manage', label: t('navigation.tests'), icon: BookMarked },
    { href: '/profile', label: t('navigation.profile'), icon: UserCircle },
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
            <LanguageSwitcher />
          </div>
        </Link>
      </aside>
    </>
  );
};

export default TeacherSidebar;


"use client";

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Menu, X, ChevronDown, Home, Users, BookMarked, UserCircle, LogOut, LogIn } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Navigation: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isTeacherMenuOpen, setIsTeacherMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleLanguageSwitch = () => {
    setLanguage(language === 'id' ? 'en' : 'id');
  };

  // Teacher menu items for dropdown
  const teacherMenuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/students', label: 'Daftar Siswa', icon: Users },
    { href: '/tests/manage', label: 'Tes Kenaikan Level', icon: BookMarked },
    { href: '/profile', label: 'Profile', icon: UserCircle },
  ];

  // Parent tabs
  const parentTabs = [
    { value: 'tests', label: 'Test Results', href: '/tests/view' },
    { value: 'profile', label: 'Profile', href: '/profile' },
  ];

  const getCurrentParentTab = () => {
    if (location.pathname.startsWith('/tests/view')) return 'tests';
    if (location.pathname === '/profile') return 'profile';
    return 'tests';
  };

  return (
    <nav className="bg-white border-b border-islamic-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Left side: Logo */}
          <div className="flex items-center space-x-4">
            <Link 
              to={profile?.role === 'teacher' ? '/dashboard' : '/'} 
              className="flex items-center space-x-2"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-islamic-600 to-accent-600 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-xl">Q</span>
              </div>
              <span className="font-sf-pro font-semibold text-base text-islamic-700 hidden sm:block">
                {t('home.title')}
              </span>
            </Link>
          </div>

          {/* Center: Teacher dropdown menu or Parent tabs */}
          <div className="flex-1 flex justify-center">
            {profile?.role === 'teacher' && (
              <div className="relative">
                {/* Desktop Teacher Menu */}
                <div className="hidden lg:block">
                  <div className="flex space-x-1">
                    {teacherMenuItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.href || 
                        (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
                      
                      return (
                        <Link
                          key={item.label}
                          to={item.href}
                          className={`
                            flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                            ${isActive 
                              ? 'bg-islamic-100 text-islamic-800' 
                              : 'text-islamic-600 hover:text-islamic-800 hover:bg-islamic-50'
                            }
                          `}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile Teacher Dropdown */}
                <div className="lg:hidden">
                  <button
                    onClick={() => setIsTeacherMenuOpen(!isTeacherMenuOpen)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-islamic-600 hover:text-islamic-800 hover:bg-islamic-50"
                  >
                    <Menu className="h-4 w-4" />
                    <span>Menu</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {isTeacherMenuOpen && (
                    <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-islamic-200 rounded-lg shadow-lg z-50">
                      <div className="py-2">
                        {teacherMenuItems.map((item) => {
                          const Icon = item.icon;
                          const isActive = location.pathname === item.href || 
                            (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
                          
                          return (
                            <Link
                              key={item.label}
                              to={item.href}
                              onClick={() => setIsTeacherMenuOpen(false)}
                              className={`
                                flex items-center space-x-3 px-4 py-2 text-sm hover:bg-islamic-50 transition-colors
                                ${isActive ? 'font-medium text-islamic-800 bg-islamic-50' : 'text-islamic-600'}
                              `}
                            >
                              <Icon className="h-4 w-4" />
                              <span>{item.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {profile?.role === 'parent' && (
              <Tabs value={getCurrentParentTab()} className="w-auto">
                <TabsList className="grid w-full grid-cols-2">
                  {parentTabs.map((tab) => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      onClick={() => navigate(tab.href)}
                      className="cursor-pointer"
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            )}
          </div>

          {/* Right side: Auth and Language Controls */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-islamic-700 font-medium hidden lg:block">
                  {profile?.full_name}
                </span>
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="font-sf-text border-islamic-200 hover:bg-islamic-50 text-islamic-700"
                  size="sm"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('nav.signOut')}
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                onClick={() => navigate('/auth')}
                className="font-sf-text border-islamic-200 hover:bg-islamic-50 text-islamic-700"
                size="sm"
              >
                <LogIn className="h-4 w-4 mr-2" />
                {t('nav.signIn')}
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLanguageSwitch}
              className="font-sf-text text-islamic-600 hover:text-islamic-800"
            >
              {language === 'id' ? 'EN' : 'ID'}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;


"use client";

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Menu, X, ChevronRight } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navigation: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Close mobile menu when route changes
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [navigate]);

  // Generate breadcrumb menu items
  const getBreadcrumbMenuItems = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    if (paths.length === 0) return [];

    return paths.map((path, index) => {
      const fullPath = '/' + paths.slice(0, index + 1).join('/');
      const formattedPath = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
      
      return {
        path: fullPath,
        label: formattedPath,
        isLast: index === paths.length - 1
      };
    });
  };

  const breadcrumbItems = getBreadcrumbMenuItems();

  return (
    <nav className="bg-white border-b border-islamic-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Left side: Logo, Title and Breadcrumb Menu */}
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

            {/* Breadcrumb Dropdown Menu - Desktop only */}
            {breadcrumbItems.length > 0 && (
              <div className="hidden lg:block">
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center space-x-2 text-sm text-islamic-600 hover:text-islamic-800 transition-colors">
                    <ChevronRight className="h-4 w-4 text-islamic-400" />
                    <span>{breadcrumbItems[breadcrumbItems.length - 1]?.label}</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    {breadcrumbItems.map((item) => (
                      <DropdownMenuItem key={item.path} asChild>
                        <Link 
                          to={item.path}
                          className={`w-full ${item.isLast ? 'font-medium text-islamic-800' : 'text-islamic-600'}`}
                        >
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          {/* Right side: Navigation and Controls */}
          <div className="flex items-center space-x-4">
            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:items-center lg:space-x-6">
              {/* Parent Navigation Items */}
              {profile?.role === 'parent' && (
                <div className="flex space-x-6">
                  <Link
                    to="/"
                    className="text-islamic-600 hover:text-islamic-800 font-medium transition-colors"
                  >
                    Home
                  </Link>
                  <Link
                    to="/tests/view"
                    className="text-islamic-600 hover:text-islamic-800 font-medium transition-colors"
                  >
                    Tes Level
                  </Link>
                </div>
              )}
              
              <div className="flex items-center space-x-4">
                {user ? (
                  <>
                    <span className="text-islamic-700 font-medium">
                      {profile?.full_name}
                    </span>
                    <Button
                      variant="outline"
                      onClick={handleSignOut}
                      className="font-sf-text border-islamic-200 hover:bg-islamic-50 text-islamic-700"
                      size="sm"
                    >
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
                    {t('nav.signIn')}
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="font-sf-text text-islamic-600 hover:text-islamic-800"
                >
                  {language === 'id' ? 'EN' : 'ID'}
                </Button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-islamic-700 hover:text-islamic-800 hover:bg-islamic-50 transition-colors"
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={`
            lg:hidden fixed inset-x-0 top-16 bg-white border-b border-islamic-200 shadow-lg
            transform transition-all duration-200 ease-in-out
            ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}
          `}
        >
          <div className="px-4 pt-2 pb-4 space-y-3">
            {/* Mobile Breadcrumbs */}
            {breadcrumbItems.length > 0 && (
              <div className="border-b border-islamic-100 pb-2">
                <div className="flex flex-col space-y-1">
                  {breadcrumbItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`text-sm px-2 py-1 rounded hover:bg-islamic-50 transition-colors ${
                        item.isLast ? 'text-islamic-800 font-medium' : 'text-islamic-600'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {profile?.role === 'parent' && (
              <div className="flex flex-col space-y-2">
                <Link
                  to="/"
                  className="text-islamic-600 hover:text-islamic-800 font-medium transition-colors px-3 py-2 rounded-md hover:bg-islamic-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/tests/view"
                  className="text-islamic-600 hover:text-islamic-800 font-medium transition-colors px-3 py-2 rounded-md hover:bg-islamic-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Tes Level
                </Link>
              </div>
            )}
            
            <div className="flex flex-col space-y-2 pt-2 border-t border-islamic-100">
              {user ? (
                <>
                  <span className="text-islamic-700 font-medium px-3 py-2">
                    {profile?.full_name}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleSignOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="font-sf-text border-islamic-200 hover:bg-islamic-50 text-islamic-700 w-full justify-start px-3"
                    size="sm"
                  >
                    {t('nav.signOut')}
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => {
                    navigate('/auth');
                    setIsMobileMenuOpen(false);
                  }}
                  className="font-sf-text border-islamic-200 hover:bg-islamic-50 text-islamic-700 w-full justify-start px-3"
                  size="sm"
                >
                  {t('nav.signIn')}
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className="font-sf-text text-islamic-600 hover:text-islamic-800 w-full justify-start px-3"
              >
                {language === 'id' ? 'EN' : 'ID'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

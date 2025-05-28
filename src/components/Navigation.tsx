"use client";

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Menu, X, ChevronRight } from 'lucide-react';

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

  // Generate breadcrumbs
  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    if (paths.length === 0) return null;

    return (
      <div className="flex items-center space-x-2 text-sm">
        {paths.map((path, index) => {
          const isLast = index === paths.length - 1;
          const formattedPath = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
          
          return (
            <React.Fragment key={path}>
              <span className={`${isLast ? 'text-islamic-800 font-medium' : 'text-islamic-600'}`}>
                {formattedPath}
              </span>
              {!isLast && <ChevronRight className="h-4 w-4 text-islamic-400" />}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <nav className="bg-white border-b border-islamic-200 shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Left side: Logo and Title */}
          <div className="flex items-center">
            <Link 
              to={profile?.role === 'teacher' ? '/dashboard' : '/'} 
              className="flex items-center space-x-2"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-islamic-600 to-accent-600 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-xl">Q</span>
              </div>
              <span className="font-sf-pro font-semibold text-base text-islamic-700">
                {t('home.title')}
              </span>
            </Link>
          </div>

          {/* Center/Right: Desktop Navigation */}
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

          {/* Right side: Mobile only - Breadcrumbs and Menu Button */}
          <div className="flex items-center space-x-4 lg:hidden">
            {getBreadcrumbs()}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-islamic-700 hover:text-islamic-800 hover:bg-islamic-50 transition-colors"
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

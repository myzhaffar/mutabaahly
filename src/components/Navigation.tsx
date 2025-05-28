
"use client";

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

const Navigation: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-islamic-200 px-4 lg:px-6 py-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to={profile?.role === 'teacher' ? '/dashboard' : '/'} className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-islamic-600 to-accent-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">Q</span>
            </div>
            <span className="font-sf-pro font-semibold text-lg lg:text-xl text-islamic-700">
              {t('home.title')}
            </span>
          </Link>
          
          {/* Parent Navigation Items */}
          {profile?.role === 'parent' && (
            <div className="hidden md:flex space-x-6 ml-8">
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
        </div>
        
        <div className="flex items-center space-x-2 lg:space-x-4">
          {user ? (
            <>
              <span className="text-islamic-700 font-medium text-sm lg:text-base hidden sm:block">
                {profile?.full_name}
              </span>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="font-sf-text border-islamic-200 hover:bg-islamic-50 text-islamic-700 text-sm lg:text-base"
                size="sm"
              >
                {t('nav.signOut')}
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              onClick={() => navigate('/auth')}
              className="font-sf-text border-islamic-200 hover:bg-islamic-50 text-islamic-700 text-sm lg:text-base"
              size="sm"
            >
              {t('nav.signIn')}
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            className="font-sf-text text-islamic-600 hover:text-islamic-800 text-sm"
          >
            {language === 'id' ? 'EN' : 'ID'}
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

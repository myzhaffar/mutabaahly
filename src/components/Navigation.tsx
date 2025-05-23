
import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

const Navigation = () => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-islamic-500 to-islamic-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">Q</span>
            </div>
            <span className="font-sf-pro font-semibold text-xl text-islamic-700 dark:text-islamic-400">
              {t('home.title')}
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              <a href="/" className="text-foreground hover:text-islamic-600 transition-colors font-medium">
                {t('nav.home')}
              </a>
              <a href="/dashboard" className="text-foreground hover:text-islamic-600 transition-colors font-medium">
                {t('nav.dashboard')}
              </a>
              <a href="/students" className="text-foreground hover:text-islamic-600 transition-colors font-medium">
                {t('nav.students')}
              </a>
            </div>
            
            {/* Language Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
              className="font-sf-text"
            >
              {language === 'en' ? 'ID' : 'EN'}
            </Button>
            
            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="font-sf-text"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

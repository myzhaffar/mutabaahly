import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navigation = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleLogoClick = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center space-x-2 cursor-pointer" 
            onClick={handleLogoClick}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-islamic-500 to-accent-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">Q</span>
            </div>
            <span className="font-sf-pro font-semibold text-xl text-islamic-700">
              Al-Quran Progress
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* User Info */}
                <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>{profile?.full_name}</span>
                  <span className="text-accent-600">({profile?.role})</span>
                </div>

                {/* Sign Out Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="font-sf-text border-islamic-200 hover:bg-islamic-50 text-islamic-700"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/auth')}
                className="font-sf-text border-islamic-200 hover:bg-islamic-50 text-islamic-700"
              >
                Sign In
              </Button>
            )}
            
            {/* Language Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
              className="font-sf-text border-accent-200 hover:bg-accent-50 text-accent-700"
            >
              {language === 'en' ? 'ID' : 'EN'}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

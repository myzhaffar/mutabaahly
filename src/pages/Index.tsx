
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-islamic-50 to-background dark:from-gray-900 dark:to-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-islamic-500 to-islamic-600 rounded-full mb-6">
            <span className="text-white text-3xl font-bold">📖</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold font-sf-pro bg-gradient-to-r from-islamic-600 to-islamic-500 bg-clip-text text-transparent">
            {t('home.title')}
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground font-sf-text">
            {t('home.subtitle')}
          </p>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-sf-text leading-relaxed">
            {t('home.description')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
            <Button 
              size="lg" 
              className="bg-islamic-500 hover:bg-islamic-600 text-white px-8 py-3 text-lg"
              onClick={handleGetStarted}
            >
              {user ? 'Go to Dashboard' : t('button.getStarted')}
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-sf-pro text-foreground mb-4">
            {t('home.features.title')}
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-islamic-100 dark:bg-islamic-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-islamic-600 dark:text-islamic-400 text-2xl">📊</span>
              </div>
              <CardTitle className="font-sf-pro">{t('home.features.tracking')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="font-sf-text">
                {t('home.features.tracking.desc')}
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card className="text-center hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-islamic-100 dark:bg-islamic-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-islamic-600 dark:text-islamic-400 text-2xl">📈</span>
              </div>
              <CardTitle className="font-sf-pro">{t('home.features.dashboard')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="font-sf-text">
                {t('home.features.dashboard.desc')}
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card className="text-center hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-islamic-100 dark:bg-islamic-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-islamic-600 dark:text-islamic-400 text-2xl">📱</span>
              </div>
              <CardTitle className="font-sf-pro">{t('home.features.responsive')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="font-sf-text">
                {t('home.features.responsive.desc')}
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card className="text-center hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-islamic-100 dark:bg-islamic-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-islamic-600 dark:text-islamic-400 text-2xl">🔒</span>
              </div>
              <CardTitle className="font-sf-pro">{t('home.features.secure')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="font-sf-text">
                {t('home.features.secure.desc')}
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-gradient-to-br from-islamic-500 to-islamic-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">Q</span>
              </div>
              <span className="font-sf-pro font-semibold text-lg text-islamic-700 dark:text-islamic-400">
                {t('home.title')}
              </span>
            </div>
            <p className="text-muted-foreground font-sf-text">
              Built with Islamic values and modern technology
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

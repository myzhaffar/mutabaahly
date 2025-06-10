import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Users, 
  Award, 
  TrendingUp, 
  ArrowRight, 
  Star, 
  BarChart3,
  CheckCircle,
  Heart 
} from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const testimonials = [
    {
      name: "Ustadz Ahmad Rahman",
      role: "Al-Quran Teacher at SDIT Al-Hikmah",
      text: "This platform really helps us monitor students' memorization progress in real-time. Parents can also see their children's development.",
      rating: 5
    },
    {
      name: "Siti Nurhaliza",
      role: "Parent of Grade 5 Student",
      text: "My child is more motivated to memorize the Quran because they can see the attractive progress charts. Thank you!",
      rating: 5
    },
    {
      name: "Dr. Muhammad Yusuf",
      role: "SDIT Principal",
      text: "A very comprehensive monitoring system. It makes it easier to evaluate tahfidz and tilawati programs at our school.",
      rating: 5
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const handleGetStarted = () => {
    setIsLoading(true);
    // Navigate to auth page with loading state
    setTimeout(() => {
      setIsLoading(false);
      navigate('/auth');
    }, 1000);
  };

  const handleLearnMore = () => {
    // Scroll to features section
    document.getElementById('features-section')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  // Show loading state when checking auth
  if (loading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-emerald-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold-200/10 rounded-full blur-3xl"></div>
      </div>

      {/* Hero Section */}
      <div className="relative container mx-auto px-4 py-20">
        <div className="text-center max-w-5xl mx-auto mb-20">
          <div className="mb-8">
            {/* Enhanced Logo */}
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 rounded-3xl rotate-6 shadow-2xl opacity-80"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl">
                <span className="text-white font-bold text-4xl">ق</span>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gold-400 rounded-full flex items-center justify-center">
                  <Star className="h-3 w-3 text-white" />
                </div>
              </div>
            </div>
            
            <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
              <span className="bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
                Al-Quran Progress
              </span>
              <span className="block text-4xl text-gray-700 mt-2">Monitoring System</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-3xl mx-auto">
              Integrated platform for monitoring Al-Quran memorization progress and Tilawati reading learning for SDIT students. 
              <span className="block mt-2 text-emerald-700 font-medium">Easy, Accurate, and Reliable ✨</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button
                onClick={handleGetStarted}
                size="lg"
                disabled={isLoading}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-10 py-6 text-lg rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : 'Get Started'}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleLearnMore}
                className="border-2 border-emerald-500 text-emerald-700 hover:bg-emerald-50 px-10 py-6 text-lg rounded-2xl transition-all duration-300 hover:shadow-lg"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Learn More
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-600" />
                <span>500+ Active Students</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Features Section */}
        <div id="features-section" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl group hover:-translate-y-2">
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-10 w-10 text-blue-600" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                Student Management
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 leading-relaxed">
                Manage student profiles with complete details and real-time progress monitoring for each individual
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl group hover:-translate-y-2">
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Award className="h-10 w-10 text-emerald-600" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                Memorization Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 leading-relaxed">
                Monitor Al-Quran memorization progress per surah with accurate and easy-to-understand assessment system
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl group hover:-translate-y-2">
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="h-10 w-10 text-green-600" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                Tilawati Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 leading-relaxed">
                Structured tiered system to measure Al-Quran reading ability with organized Tilawati method
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl group hover:-translate-y-2">
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-gold-100 to-gold-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="h-10 w-10 text-gold-600" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                Reports & Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 leading-relaxed">
                Complete analytics dashboard with progress charts and exportable reports for evaluation
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Video Tutorial Section */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            Video Tutorial
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Learn how to use our platform easily through comprehensive video tutorials
          </p>
          
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white/95 backdrop-blur-lg border-0 shadow-2xl rounded-3xl overflow-hidden">
              <CardContent className="p-8">
                <div className="aspect-video bg-gray-100 rounded-2xl overflow-hidden shadow-inner">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/-FxEYa8joK8"
                    title="Tutorial Al-Quran Progress Monitoring System"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="mt-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Complete Platform Usage Guide
                  </h3>
                  <p className="text-gray-600">
                    Step-by-step video tutorial for teachers and school administrators
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            What They Say?
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Listen to the experiences of teachers and parents who have felt the benefits of our platform
          </p>
          
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white/95 backdrop-blur-lg border-0 shadow-2xl rounded-3xl overflow-hidden">
              <CardContent className="p-12">
                <div className="text-center">
                  <div className="flex justify-center mb-6">
                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="h-6 w-6 text-gold-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-xl text-gray-700 mb-8 leading-relaxed italic">
                    "{testimonials[currentTestimonial].text}"
                  </blockquote>
                  <div className="border-t pt-6">
                    <p className="font-bold text-gray-900 text-lg">
                      {testimonials[currentTestimonial].name}
                    </p>
                    <p className="text-emerald-600 font-medium">
                      {testimonials[currentTestimonial].role}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Testimonial Indicators */}
            <div className="flex justify-center mt-6 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial 
                      ? 'bg-emerald-600 w-8' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`View testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced CTA Section */}
        <div className="text-center bg-gradient-to-r from-emerald-500/10 via-white/80 to-blue-500/10 backdrop-blur-lg rounded-3xl p-16 shadow-2xl border border-white/20 max-w-5xl mx-auto mb-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Ready to Start Your Digital Journey?
            </h2>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              Join hundreds of teachers and parents who have experienced the convenience of monitoring Al-Quran progress with our modern platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
              <Button
                onClick={handleGetStarted}
                size="lg"
                disabled={isLoading}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-12 py-6 text-xl rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : 'Register Now'}
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span>Integrated Platform</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span>Real-time Dashboard</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span>Complete Reports</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center py-8 mt-auto border-t border-gray-200/30 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <span>Built with</span>
            <Heart className="h-4 w-4 text-red-500 fill-current animate-pulse" />
            <span>by</span>
            <a 
              href="https://github.com/myzhaffar" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              myzhaffar
            </a>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            © {new Date().getFullYear()} Al-Quran Progress Monitoring System. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;


import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  React.useEffect(() => {
    if (user && profile) {
      if (profile.role === 'teacher') {
        navigate('/dashboard');
      } else if (profile.role === 'parent') {
        navigate('/tests/view');
      }
    }
  }, [user, profile, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-islamic-700 mb-6">
          Al-Quran Progress Tracker
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Platform for tracking Al-Quran and Tilawati learning progress
        </p>
        <Button onClick={() => navigate('/auth')} size="lg">
          Sign In
        </Button>
      </div>
    </div>
  );
};

export default LandingPage;

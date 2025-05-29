
import React from 'react';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ParentLayoutProps {
  children: React.ReactNode;
}

const ParentLayout: React.FC<ParentLayoutProps> = ({ children }) => {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading && profile?.role !== 'parent') {
      navigate('/dashboard');
    }
  }, [loading, profile, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-islamic-500"></div>
      </div>
    );
  }

  if (profile?.role !== 'parent') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <main className="container mx-auto py-4 px-4 lg:py-6 pt-20">
        {children}
      </main>
    </div>
  );
};

export default ParentLayout;

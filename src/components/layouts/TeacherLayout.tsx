
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface TeacherLayoutProps {
  children: React.ReactNode;
}

const TeacherLayout: React.FC<TeacherLayoutProps> = ({ children }) => {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading && profile?.role !== 'teacher') {
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

  if (profile?.role !== 'teacher') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-16">
      <main className="container mx-auto py-4 px-4 lg:py-6">
        <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default TeacherLayout;

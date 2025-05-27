import React from 'react';
import TeacherSidebar from '@/components/TeacherSidebar';
import Navigation from '@/components/Navigation'; // Main top navigation
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
      navigate('/dashboard'); // Or to an unauthorized page or login
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
    // This is a fallback, useEffect should handle redirection
    return null; 
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <TeacherSidebar />
      <div className="flex-1 flex flex-col ml-64"> {/* Adjust ml-64 to match sidebar width */}
        <Navigation /> {/* Existing top navigation */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default TeacherLayout; 
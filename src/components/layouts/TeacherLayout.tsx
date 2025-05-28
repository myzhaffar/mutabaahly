import React from 'react';
import TeacherSidebar from '@/components/TeacherSidebar';
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
    <div className="flex min-h-screen bg-gray-100">
      <TeacherSidebar />
      <div className="flex-1 transition-all duration-300 ease-in-out lg:ml-64">
        <main className="p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeacherLayout;

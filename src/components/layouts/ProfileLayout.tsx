import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import TeacherSidebar from '@/components/TeacherSidebar';

interface ProfileLayoutProps {
  children: React.ReactNode;
}

const ProfileLayout: React.FC<ProfileLayoutProps> = ({ children }) => {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading && !profile) {
      navigate('/auth');
    }
  }, [loading, profile, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-islamic-500"></div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  // If user is a teacher, show the teacher layout with sidebar
  if (profile.role === 'teacher') {
    return (
      <div className="min-h-screen bg-gray-100">
        <TeacherSidebar />
        <main className="lg:pl-64 min-h-screen">
          <div className="container mx-auto py-6 px-4 lg:px-8">
            <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // If user is a parent, show a simpler layout
  return (
    <div className="min-h-screen bg-gray-100 pt-4">
      <main className="container mx-auto py-4 px-4 lg:py-6">
        <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default ProfileLayout; 
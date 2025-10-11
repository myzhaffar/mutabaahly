'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/useAuth';
import { useRouter } from 'next/navigation';
import TeacherSidebarWithBottomNav from '@/components/TeacherSidebarWithBottomNav';
import ParentSidebarWithBottomNav from '@/components/ParentSidebarWithBottomNav';
import Breadcrumbs, { BreadcrumbItem } from '@/components/ui/Breadcrumbs';

interface ProfileLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

const ProfileLayout: React.FC<ProfileLayoutProps> = ({ children, breadcrumbs }) => {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  React.useEffect(() => {
    if (!loading && !profile) {
      router.push('/auth');
    }
  }, [loading, profile, router]);

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
        <TeacherSidebarWithBottomNav 
          isMobileMenuOpen={sidebarOpen} 
          setIsMobileMenuOpen={setSidebarOpen} 
        />
        
        <main className="lg:pl-64 min-h-screen">
          {breadcrumbs && <div className="pt-6 px-4 lg:px-8"><Breadcrumbs items={breadcrumbs} /></div>}
          <div className="container mx-auto pt-2 pb-6 px-4 lg:px-8">
            <div className="bg-white rounded-lg shadow-sm p-4">
              {children}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // If user is a parent, show the parent layout with sidebar
  if (profile.role === 'parent') {
    return (
      <div className="min-h-screen bg-gray-100">
        <ParentSidebarWithBottomNav 
          isMobileMenuOpen={sidebarOpen} 
          setIsMobileMenuOpen={setSidebarOpen} 
        />
        
        <main className="lg:pl-64 min-h-screen">
          {breadcrumbs && <div className="pt-6 px-4 lg:px-8"><Breadcrumbs items={breadcrumbs} /></div>}
          <div className="container mx-auto pt-2 pb-6 px-4 lg:px-8">
            <div className="bg-white rounded-lg shadow-sm p-4">
              {children}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Fallback for unknown roles
  return (
    <div className="min-h-screen bg-gray-100">
      {breadcrumbs && <div className="pt-6 px-4 lg:px-8"><Breadcrumbs items={breadcrumbs} /></div>}
      <main className="container mx-auto pt-2 pb-6 px-4 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-4">
          {children}
        </div>
      </main>
    </div>
  );
};

export default ProfileLayout; 
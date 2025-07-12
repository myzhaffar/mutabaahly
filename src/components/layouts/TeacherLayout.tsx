'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/useAuth';
import { useRouter } from 'next/navigation';
import TeacherSidebar from '@/components/TeacherSidebar';
import Breadcrumbs, { BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import { Menu } from 'lucide-react';

interface TeacherLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

const TeacherLayout: React.FC<TeacherLayoutProps> = ({ children, breadcrumbs }) => {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  React.useEffect(() => {
    if (!loading && profile?.role !== 'teacher') {
      router.push('/dashboard');
    }
  }, [loading, profile, router]);

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
    <div className="min-h-screen bg-gray-100">
      {/* Top Header: only show on mobile (below lg) */}
      <header className="sticky top-0 z-40 bg-white shadow-sm flex items-center justify-between h-16 px-4 lg:px-8 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-green-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <span className="font-semibold text-lg text-gray-900 hidden sm:inline">Mutabaahly</span>
        </div>
        <button
          className="lg:hidden p-2 rounded-md text-teal-700 hover:bg-teal-50"
          onClick={() => setSidebarOpen((open) => !open)}
        >
          <Menu className="h-7 w-7" />
        </button>
      </header>
      {/* Sidebar (controlled by sidebarOpen for mobile) */}
      <TeacherSidebar isMobileMenuOpen={sidebarOpen} setIsMobileMenuOpen={setSidebarOpen} />
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
};

export default TeacherLayout;

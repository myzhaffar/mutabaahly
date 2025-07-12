'use client';

import React from 'react';
import { useAuth } from '@/contexts/useAuth';
import { useRouter } from 'next/navigation';
import Breadcrumbs, { BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import ParentNavbar from '@/components/ParentNavbar';

interface ParentLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

const ParentLayout: React.FC<ParentLayoutProps> = ({ children, breadcrumbs }) => {
  const { profile, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && profile?.role !== 'parent') {
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

  if (profile?.role !== 'parent') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-0">
      <ParentNavbar />
      {breadcrumbs && <div className="pt-6 px-4 lg:px-8"><Breadcrumbs items={breadcrumbs} /></div>}
      <main className="container mx-auto pt-2 pb-6 px-4 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-4">
          {children}
        </div>
      </main>
    </div>
  );
};

export default ParentLayout;

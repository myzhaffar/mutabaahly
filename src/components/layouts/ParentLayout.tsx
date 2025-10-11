'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/useAuth';
import Breadcrumbs, { BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import ParentSidebarWithBottomNav from '@/components/ParentSidebarWithBottomNav';

interface ParentLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

const ParentLayout: React.FC<ParentLayoutProps> = ({ children, breadcrumbs }) => {
  const { profile, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Show loading state while auth is being determined
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-islamic-500"></div>
      </div>
    );
  }

  // Middleware handles role-based redirects, but we still check for UI consistency
  if (profile?.role !== 'parent') {
    return null;
  }

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
};

export default ParentLayout;

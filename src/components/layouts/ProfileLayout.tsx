'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/useAuth';
import { useRouter } from 'next/navigation';
import UnifiedSidebar from '@/components/layouts/UnifiedSidebar';
import MobileBottomNav from '@/components/layouts/MobileBottomNav';
import Breadcrumbs, { BreadcrumbItem } from '@/components/ui/Breadcrumbs';

interface ProfileLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

const ProfileLayout: React.FC<ProfileLayoutProps> = ({ children, breadcrumbs }) => {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

  return (
    <div className="min-h-screen bg-gray-100">
      <UnifiedSidebar 
        isMobileMenuOpen={sidebarOpen} 
        setIsMobileMenuOpen={setSidebarOpen} 
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
        role={profile.role as "teacher" | "parent"}
      />
      <MobileBottomNav role={profile.role as "teacher" | "parent"} />
      
      <main className={`min-h-screen ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'} pb-16 lg:pb-0`}> {/* Added pb-16 for mobile bottom nav */}
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

export default ProfileLayout;
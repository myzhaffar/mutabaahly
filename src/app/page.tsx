'use client';

import Index from '@/components/pages/Index';
import ParentNavbar from '@/components/ParentNavbar';
import { useAuth } from '@/contexts/useAuth';

export default function HomePage() {
  const { profile } = useAuth();
  
  return (
    <>
      {profile?.role === 'parent' && <ParentNavbar />}
      <Index />
    </>
  );
} 
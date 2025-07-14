'use client';

import ParentTestView from '@/components/pages/ParentTestView';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function ParentTestViewPage() {
  return (
    <ProtectedRoute requiredRole="parent">
      <ParentTestView />
    </ProtectedRoute>
  );
} 
'use client';

import ParentTestView from '@/pages/ParentTestView';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function ParentTestViewPage() {
  return (
    <ProtectedRoute requiredRole="parent">
      <ParentTestView />
    </ProtectedRoute>
  );
} 
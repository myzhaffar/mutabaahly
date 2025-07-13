'use client';

import ClassDetail from '@/pages/ClassDetail';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function ClassDetailPage() {
  return (
    <ProtectedRoute>
      <ClassDetail />
    </ProtectedRoute>
  );
} 
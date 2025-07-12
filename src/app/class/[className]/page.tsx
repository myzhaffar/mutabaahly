'use client';

import ClassDetail from '@/pages/ClassDetail';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function ClassDetailPage({ params: { className } }: { params: { className: string } }) {
  return (
    <ProtectedRoute>
      <ClassDetail />
    </ProtectedRoute>
  );
} 
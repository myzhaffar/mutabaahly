'use client';

import TeacherTestManagement from '@/pages/TeacherTestManagement';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function TeacherTestManagementPage() {
  return (
    <ProtectedRoute requiredRole="teacher">
      <TeacherTestManagement />
    </ProtectedRoute>
  );
} 
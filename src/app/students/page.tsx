'use client';

import Students from '@/pages/Students';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function StudentsPage() {
  return (
    <ProtectedRoute>
      <Students />
    </ProtectedRoute>
  );
} 
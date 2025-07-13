'use client';

import StudentDetails from '@/pages/StudentDetails';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function StudentDetailsPage() {
  return (
    <ProtectedRoute>
      <StudentDetails />
    </ProtectedRoute>
  );
} 
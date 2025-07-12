'use client';

import StudentDetails from '@/pages/StudentDetails';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function StudentDetailsPage({ params: { id } }: { params: { id: string } }) {
  return (
    <ProtectedRoute>
      <StudentDetails />
    </ProtectedRoute>
  );
} 
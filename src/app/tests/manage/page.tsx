import TeacherTestManagement from '@/components/pages/TeacherTestManagement';
import ProtectedRoute from '@/components/ProtectedRoute';

export const metadata = {
  title: "Test | Mutabaahly",
  description: "Manage Tilawati test schedules, results, and student progress in Mutabaahly."
};

export default function TeacherTestManagementPage() {
  return (
    <ProtectedRoute requiredRole="teacher">
      <TeacherTestManagement />
    </ProtectedRoute>
  );
} 
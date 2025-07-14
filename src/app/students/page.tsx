import Students from '@/components/pages/Students';
import ProtectedRoute from '@/components/ProtectedRoute';

export const metadata = {
  title: "Students | Mutabaahly",
  description: "Browse and manage students, view progress, and filter by class or grade in Mutabaahly."
};

export default function StudentsPage() {
  return (
    <ProtectedRoute>
      <Students />
    </ProtectedRoute>
  );
} 
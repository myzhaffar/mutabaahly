import StudentDetails from '@/pages/StudentDetails';
import ProtectedRoute from '@/components/ProtectedRoute';

export const metadata = {
  title: "Student Details | Mutabaahly",
  description: "View detailed progress and information for individual students in Mutabaahly."
};

export default function StudentDetailsPage() {
  return (
    <ProtectedRoute>
      <StudentDetails />
    </ProtectedRoute>
  );
} 
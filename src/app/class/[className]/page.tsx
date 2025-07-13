import ClassDetail from '@/pages/ClassDetail';
import ProtectedRoute from '@/components/ProtectedRoute';

export const metadata = {
  title: "Class Details | Mutabaahly",
  description: "View class details, student list, and progress for each class in Mutabaahly."
};

export default function ClassDetailPage() {
  return (
    <ProtectedRoute>
      <ClassDetail />
    </ProtectedRoute>
  );
} 
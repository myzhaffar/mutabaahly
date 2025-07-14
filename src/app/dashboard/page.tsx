import Dashboard from '@/components/pages/Dashboard';
import ProtectedRoute from '@/components/ProtectedRoute';

export const metadata = {
  title: "Dashboard | Mutabaahly",
  description: "Your dashboard for monitoring student progress in Al-Quran memorization and Tilawati recitation."
};

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
} 
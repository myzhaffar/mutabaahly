import Profile from '@/pages/Profile';
import ProtectedRoute from '@/components/ProtectedRoute';

export const metadata = {
  title: "Profile | Mutabaahly",
  description: "View and manage your Mutabaahly profile, account information, and settings."
};

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  );
} 
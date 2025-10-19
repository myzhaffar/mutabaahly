'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Shield, LogOut, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import ProfileLayout from '@/components/layouts/ProfileLayout';
import ParentLayout from '@/components/layouts/ParentLayout';
import { EditProfileDialog } from '@/components/profile/EditProfileDialog';
import { DeleteProfileDialog } from '@/components/profile/DeleteProfileDialog';
import ProfileCard from '@/components/profile/ProfileCard';
import { useSwipeBack } from '@/hooks/useSwipeBack';

interface Profile {
  id: string;
  full_name: string;
  role: "parent" | "teacher";
  avatar_url: string | null;
}

const Profile: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const router = useRouter();
  
  useSwipeBack();

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Profile' }
  ];

  const handleEditProfile = () => {
    setIsEditDialogOpen(true);
  };

  const handleDeleteProfile = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleProfileUpdated = () => {

  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Render ParentLayout for parent role, ProfileLayout for teacher
  switch (profile.role) {
    case 'parent':
      return (
        <ParentLayout breadcrumbs={breadcrumbs}>
          <div className="container mx-auto px-0 py-0 md:px-6 md:py-6 flex flex-col gap-6">
            {/* Header with Back Button and Label */}
            <div className="flex items-center gap-4 mt-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="p-0 m-0 bg-transparent border-none outline-none flex items-center"
                aria-label="Back"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Profile Settings
              </h1>
            </div>
            {/* Profile Card - New Digital ID Card */}
            <div className="mb-6">
              <ProfileCard 
                fullName={profile?.full_name || ''}
                email={user?.email || ''}
                role={profile?.role || ''}
                avatarUrl={profile?.avatar_url || null}
                onEdit={handleEditProfile}
                onDelete={handleDeleteProfile}
              />
            </div>
            {/* User Information Card */}

          </div>
          {/* Edit Profile Dialog */}
          <EditProfileDialog
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            onProfileUpdated={handleProfileUpdated}
          />
          {/* Delete Profile Dialog */}
          <DeleteProfileDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
          />
        </ParentLayout>
      );
    case 'teacher':
      return (
        <ProfileLayout breadcrumbs={breadcrumbs}>
          <div className="container mx-auto px-0 py-0 md:px-6 md:py-6">
            {/* Header with Back Button and Label */}
            <div className="flex items-center gap-4 mt-2 mb-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="p-0 m-0 bg-transparent border-none outline-none flex items-center"
                aria-label="Back"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Profile Settings
              </h1>
            </div>
            {/* Profile Card - New Digital ID Card */}
<div className="mb-6">
  <ProfileCard 
    fullName={profile?.full_name || ''}
    email={user?.email || ''}
    role={profile?.role || ''}
    avatarUrl={profile?.avatar_url || null}
    onEdit={handleEditProfile}
    onDelete={handleDeleteProfile}
  />
</div>
            {/* User Information Card */}
            <Card>
              <CardHeader className="p-6 pb-0">
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <User className="h-5 w-5 text-teal-500" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <User className="h-5 w-5 text-teal-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium text-gray-900 break-words text-sm sm:text-base">{profile?.full_name || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Mail className="h-5 w-5 text-teal-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900 break-all text-sm sm:text-base">{user?.email || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Shield className="h-5 w-5 text-teal-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="font-medium text-gray-900 capitalize text-sm sm:text-base">{profile?.role || 'Not set'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Sign Out button for teacher role, positioned at bottom like parent */}
            <div className="mt-6">
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="w-full flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </Button>
            </div>
          </div>
          {/* Edit Profile Dialog */}
          <EditProfileDialog
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            onProfileUpdated={handleProfileUpdated}
          />
          {/* Delete Profile Dialog */}
          <DeleteProfileDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
          />
        </ProfileLayout>
      );
    default:
      // Handle null role - redirect to select role page
      router.push('/select-role');
      return null;
  }
};

export default Profile;
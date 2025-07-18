'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Shield, MoreVertical, Pencil, Trash2, LogOut, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ProfileLayout from '@/components/layouts/ProfileLayout';
import { EditProfileDialog } from '@/components/profile/EditProfileDialog';
import { DeleteProfileDialog } from '@/components/profile/DeleteProfileDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";



import ParentLayout from '@/components/layouts/ParentLayout';

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
    // Optionally, you can trigger a context refresh here if needed
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
            {/* Profile Avatar Card */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="relative">
                  {/* More Options Menu */}
                  <div className="absolute right-0 top-0">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 rounded-full">
                          <MoreVertical className="h-4 w-4 text-gray-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={handleEditProfile} className="cursor-pointer">
                          <Pencil className="mr-2 h-4 w-4 text-gray-500" />
                          <span>Edit Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleDeleteProfile} className="cursor-pointer text-red-600 focus:text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete Account</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex flex-col items-center">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-gradient-to-r from-green-400 to-teal-500 text-white text-xl">
                        {profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-semibold mb-1">{profile?.full_name}</h2>
                    <p className="text-gray-500 capitalize">{profile?.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                  <User className="h-5 w-5 text-teal-500" />
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium text-gray-900">{profile?.full_name || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Mail className="h-5 w-5 text-teal-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{user?.email || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Shield className="h-5 w-5 text-teal-500" />
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="font-medium text-gray-900 capitalize">{profile?.role || 'Not set'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Mobile-only Sign Out button for parent role, under Account Information card */}
            <div className="md:hidden">
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
            {/* Profile Avatar Card */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="relative">
                  {/* More Options Menu */}
                  <div className="absolute right-0 top-0">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 rounded-full">
                          <MoreVertical className="h-4 w-4 text-gray-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={handleEditProfile} className="cursor-pointer">
                          <Pencil className="mr-2 h-4 w-4 text-gray-500" />
                          <span>Edit Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleDeleteProfile} className="cursor-pointer text-red-600 focus:text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete Account</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex flex-col items-center">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-gradient-to-r from-green-400 to-teal-500 text-white text-xl">
                        {profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-semibold mb-1">{profile?.full_name}</h2>
                    <p className="text-gray-500 capitalize">{profile?.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                  <User className="h-5 w-5 text-teal-500" />
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium text-gray-900">{profile?.full_name || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Mail className="h-5 w-5 text-teal-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{user?.email || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Shield className="h-5 w-5 text-teal-500" />
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="font-medium text-gray-900 capitalize">{profile?.role || 'Not set'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Mobile-only Sign Out button for parent role, under Account Information card */}
            {/* No mobile sign out for teacher here, only for parent in the parent case above */}
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

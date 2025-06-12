import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Shield, ArrowLeft, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';

const Profile: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleEditProfile = () => {
    // For now, just show a toast
    toast.info("Edit profile feature coming soon!");
  };

  const handleDeleteProfile = () => {
    // For now, just show a toast
    toast.info("Delete profile feature coming soon!");
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 rounded-full border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            Profile Settings
          </h1>
        </div>
        
        {/* Profile Avatar Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
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
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <User className="h-5 w-5 text-teal-500" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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
      </div>
    </div>
  );
};

export default Profile;

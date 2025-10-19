'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProfileCardProps {
  fullName: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
  onEdit?: () => void;
  onDelete?: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ 
  fullName, 
  email, 
  role, 
  avatarUrl,
  onEdit,
  onDelete
}) => {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-green-400 to-teal-500 p-6 shadow-lg relative">
      {/* More Options Menu */}
      {(onEdit || onDelete) && (
        <div className="absolute right-4 top-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/20 rounded-full">
                <MoreVertical className="h-4 w-4 text-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {onEdit && (
                <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
                  <Pencil className="mr-2 h-4 w-4 text-gray-500" />
                  <span>Edit Profile</span>
                </DropdownMenuItem>
              )}
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onDelete} className="cursor-pointer text-red-600 focus:text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete Account</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      
      {/* Left Section - Avatar */}
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <Avatar className="h-16 w-16 ring-2 ring-white/30 ring-offset-0">
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback className="bg-white/20 text-white text-lg font-semibold backdrop-blur-sm">
              {fullName?.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        
        {/* Right Section - Text Content */}
        <div className="flex flex-col min-w-0">
          <h2 className="text-xl font-semibold text-white truncate">{fullName}</h2>
          <p className="text-sm text-white/90 truncate">{email}</p>
          <div className="mt-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/15 text-white capitalize">
              {role}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
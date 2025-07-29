import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/useAuth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export function EditProfileDialog({ isOpen, onClose, onProfileUpdated }: EditProfileDialogProps) {
  const { user, profile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url || null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Reset form when dialog opens/closes or profile changes
  useEffect(() => {
    if (isOpen && profile) {
      setFullName(profile.full_name || '');
      setAvatarUrl(profile.avatar_url || null);
    } else if (!isOpen) {
      // Reset form when dialog closes
      setFullName('');
      setAvatarUrl(null);
      setIsLoading(false);
      setUploading(false);
    }
  }, [isOpen, profile]);

  const validateForm = () => {
    const trimmedName = fullName.trim();
    
    if (!trimmedName) {
      toast.error('Full name is required');
      return false;
    }
    
    if (trimmedName.length < 2) {
      toast.error('Full name must be at least 2 characters long');
      return false;
    }
    
    if (trimmedName.length > 100) {
      toast.error('Full name must be less than 100 characters');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const trimmedName = fullName.trim();
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          full_name: trimmedName,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Profile update error:', error);
        throw new Error(error.message || 'Failed to update profile');
      }

      toast.success('Profile updated successfully');
      onProfileUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    // Reset input value to allow same file selection
    e.target.value = '';
    
    if (!file) return;
    
    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error('Only JPG, PNG, GIF, and WebP images are allowed');
      return;
    }

    try {
      setUploading(true);

      // Generate unique filename with timestamp to avoid caching issues
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const timestamp = Date.now();
      const filePath = `${user.id}/avatar_${timestamp}.${fileExt}`;

      // Upload new avatar
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { 
          cacheControl: '3600',
          contentType: file.type
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(uploadError.message || 'Failed to upload image');
      }

      if (!data?.path) {
        throw new Error('Upload successful but no file path returned');
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path);

      if (!publicUrl) {
        throw new Error('Failed to get public URL for uploaded image');
      }

      // Remove old avatar if it exists and is different
      if (avatarUrl && avatarUrl !== publicUrl) {
        try {
          // Extract old file path from URL
          const oldUrl = new URL(avatarUrl);
          const oldPath = oldUrl.pathname.split('/avatars/')[1];
          if (oldPath && oldPath.startsWith(user.id)) {
            await supabase.storage
              .from('avatars')
              .remove([oldPath]);
          }
        } catch (error) {
          // Log but don't fail the upload for cleanup errors
          // Silently handle cleanup errors
        }
      }

      // Update local state immediately for better UX
      setAvatarUrl(publicUrl);
      toast.success('Profile picture updated successfully');
      
    } catch (error) {
      console.error('Error uploading image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload profile picture';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!user?.id || !avatarUrl) return;
    setDeleting(true);
    try {
      // Extract file path from URL
      const filePath = avatarUrl.split('/').slice(-2).join('/');
      // Remove from storage
      const { error: removeError } = await supabase.storage.from('avatars').remove([filePath]);
      if (removeError) throw removeError;
      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id);
      if (updateError) throw updateError;
      setAvatarUrl(null);
      toast.success('Profile photo deleted');
      onProfileUpdated();
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Failed to delete profile photo');
    } finally {
      setDeleting(false);
    }
  };

  const handleClose = () => {
    if (isLoading || uploading) {
      toast.error('Please wait for the current operation to complete');
      return;
    }
    onClose();
  };

  // Don't render if user is not available
  if (!user) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-[425px]"
        aria-describedby="edit-profile-description"
      >
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <div id="edit-profile-description" className="sr-only">
          Update your profile information and upload a profile picture.
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage 
                  src={avatarUrl || undefined}
                  alt={fullName ? `${fullName}'s avatar` : 'User avatar'} 
                />
                <AvatarFallback className="text-lg font-semibold">
                  {fullName?.charAt(0)?.toUpperCase() || profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className={cn(
                  "absolute bottom-0 right-0 cursor-pointer rounded-full bg-primary p-2 text-primary-foreground hover:bg-primary/90 transition-colors",
                  (uploading || isLoading) && "opacity-50 cursor-not-allowed"
                )}
                title="Upload profile picture"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
                <input
                  id="avatar-upload"
                  type="file"
                  accept={ALLOWED_FILE_TYPES.join(',')}
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploading || isLoading}
                />
              </label>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleDeletePhoto}
                  className="absolute top-0 left-0 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-md transition-colors"
                  disabled={deleting}
                  title="Delete photo"
                >
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                </button>
              )}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Click the camera icon to upload a new profile picture
              <br />
              Maximum size: 5MB • Formats: JPG, PNG, GIF, WebP
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              required
              maxLength={100}
              disabled={isLoading || uploading}
              autoComplete="name"
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isLoading || uploading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || uploading || !fullName.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
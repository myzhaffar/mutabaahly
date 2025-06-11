import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { GradientButton } from '@/components/ui/gradient-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import FileUpload from '@/components/ui/file-upload';
import { useAuth } from '@/contexts/AuthContext';

interface AddStudentDialogProps {
  onStudentAdded: () => void;
}

const AddStudentDialog: React.FC<AddStudentDialogProps> = ({ onStudentAdded }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    group_name: '',
    teacher: ''
  });
  const { toast } = useToast();
  const { profile } = useAuth();

  // Return null if user is not a teacher
  if (profile?.role !== 'teacher') {
    return null;
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const filePath = `student-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('student-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('student-photos')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Double-check role before submitting
    if (profile?.role !== 'teacher') {
      toast({
        title: "Error",
        description: "You don't have permission to add students.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      let photoUrl = null;

      // Upload photo if selected
      if (selectedFile) {
        photoUrl = await uploadImage(selectedFile);
        if (!photoUrl) {
          throw new Error('Failed to upload image');
        }
      }

      const { error } = await supabase
        .from('students')
        .insert([{
          ...formData,
          photo: photoUrl
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Student added successfully!",
      });

      setFormData({ name: '', group_name: '', teacher: '' });
      setSelectedFile(null);
      setOpen(false);
      onStudentAdded();
    } catch (error) {
      console.error('Error adding student:', error);
      toast({
        title: "Error",
        description: "Failed to add student. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <GradientButton>
          <Plus className="h-4 w-4 mr-2" />
          Add Student
        </GradientButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="photo">Profile Photo</Label>
            <FileUpload
              onFileSelect={setSelectedFile}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Student Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="group_name">Group/Class</Label>
            <Input
              id="group_name"
              value={formData.group_name}
              onChange={(e) => handleInputChange('group_name', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="teacher">Teacher</Label>
            <Input
              id="teacher"
              value={formData.teacher}
              onChange={(e) => handleInputChange('teacher', e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <GradientButton type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Student'}
            </GradientButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddStudentDialog;

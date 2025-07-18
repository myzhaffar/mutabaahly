import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import FileUpload from '@/components/ui/file-upload';
import { useAuth } from '@/contexts/useAuth';
import { FIXED_TEACHERS } from '@/utils/rankingDataService';

interface Student {
  id: string;
  name: string;
  group_name: string;
  teacher: string;
  photo: string | null;
}

interface EditStudentDialogProps {
  student: Student;
  onStudentUpdated: () => void;
}

const EditStudentDialog: React.FC<EditStudentDialogProps> = ({ student, onStudentUpdated }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [teacherDropdownOpen, setTeacherDropdownOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: student.name,
    group_name: student.group_name,
    teacher: student.teacher
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
        description: "You don&apos;t have permission to edit students.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      let photoUrl = student.photo;

      // Upload photo if selected
      if (selectedFile) {
        photoUrl = await uploadImage(selectedFile);
        if (!photoUrl) {
          throw new Error('Failed to upload image');
        }
      }

      const { error } = await supabase
        .from('students')
        .update({
          ...formData,
          photo: photoUrl
        })
        .eq('id', student.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Student updated successfully!",
      });

      setSelectedFile(null);
      setOpen(false);
      onStudentUpdated();
    } catch (error) {
      console.error('Error updating student:', error);
      toast({
        title: "Error",
        description: "Failed to update student. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const femaleTeachers = FIXED_TEACHERS.filter(t => t.name.startsWith('Ustz.'));
  const maleTeachers = FIXED_TEACHERS.filter(t => t.name.startsWith('Ust.'));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" id="edit-student-trigger">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" aria-describedby="edit-student-description">
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
          <DialogDescription id="edit-student-description">
            Update the student&apos;s information.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="photo">Profile Photo</Label>
            <FileUpload
              onFileSelect={setSelectedFile}
              currentImage={student.photo}
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
            <Label htmlFor="group_name">Class</Label>
            <Input
              id="group_name"
              value={formData.group_name}
              onChange={(e) => handleInputChange('group_name', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="teacher">Teacher</Label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setTeacherDropdownOpen(!teacherDropdownOpen)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <span className={formData.teacher ? 'text-foreground' : 'text-muted-foreground'}>
                  {formData.teacher || 'Select teacher'}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </button>

              {teacherDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  <div className="p-2">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Female Teachers */}
                      <div className="space-y-2">
                        <div className="font-semibold text-emerald-700 text-sm mb-2">Female</div>
                        {femaleTeachers.map((teacher) => (
                          <button
                            key={teacher.id}
                            type="button"
                            onClick={() => {
                              handleInputChange('teacher', teacher.name);
                              setTeacherDropdownOpen(false);
                            }}
                            className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
                          >
                            {teacher.name}
                          </button>
                        ))}
                      </div>

                      {/* Male Teachers */}
                      <div className="space-y-2">
                        <div className="font-semibold text-teal-700 text-sm mb-2">Male</div>
                        {maleTeachers.map((teacher) => (
                          <button
                            key={teacher.id}
                            type="button"
                            onClick={() => {
                              handleInputChange('teacher', teacher.name);
                              setTeacherDropdownOpen(false);
                            }}
                            className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
                          >
                            {teacher.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Student'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditStudentDialog;

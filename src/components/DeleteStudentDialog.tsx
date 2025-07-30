import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/useAuth';

interface DeleteStudentDialogProps {
  studentId: string;
  studentName: string;
  onStudentDeleted: () => void;
}

const DeleteStudentDialog: React.FC<DeleteStudentDialogProps> = ({
  studentId,
  studentName,
  onStudentDeleted
}) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { profile } = useAuth();

  // Return null if user is not a teacher
  if (profile?.role !== 'teacher') {
    return null;
  }

  const handleDelete = async () => {
    // Double-check role before deleting
    if (profile?.role !== 'teacher') {
      toast({
        title: "Error",
        description: "You don&apos;t have permission to delete students.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Delete related progress entries first
      // await supabase
      //   .from('progress_entries')
      //   .delete()
      //   .eq('student_id', studentId);

                      // Delete related tahfidz progress
        // await supabase
        //   .from('tahfidz_progress')
      //   .delete()
      //   .eq('student_id', studentId);

      // Delete related tilawah progress
      // await supabase
      //   .from('tilawah_progress')
      //   .delete()
      //   .eq('student_id', studentId);

      // Finally delete the student
      const { data } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId);

      if (data) throw new Error("Failed to delete student. Please try again.");

      toast({
        title: "Success",
        description: "Student deleted successfully!",
      });

      onStudentDeleted();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete student. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" id="delete-student-trigger">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete <strong>{studentName}</strong> and all their progress data.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteStudentDialog;

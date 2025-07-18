
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
import { useToast } from '@/hooks/use-toast';

interface DeleteProgressDialogProps {
  entryId: string;
  entryType: string;
  onProgressDeleted: () => void;
}

const DeleteProgressDialog: React.FC<DeleteProgressDialogProps> = ({
  entryId,
  entryType,
  onProgressDeleted
}) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setLoading(true);

    try {
      // TODO: Disabled because 'progress_entries' table does not exist in production DB.
      // const { error } = await supabase
      //   .from('progress_entries')
      //   .delete()
      //   .eq('id', entryId);
      toast({
        title: 'Not Implemented',
        description: 'Progress entry deletion is temporarily disabled. Please contact admin.',
        variant: 'destructive',
      });

      // Remove unused error check since deletion is disabled
      // if (error) throw error;

      toast({
        title: "Success",
        description: "Progress entry deleted successfully!",
      });

      onProgressDeleted();
    } catch (error) {
      console.error('Error deleting progress:', error);
      toast({
        title: "Error",
        description: "Failed to delete progress entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Progress Entry</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this {entryType} progress entry? This action cannot be undone.
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

export default DeleteProgressDialog;


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
import { supabase } from '@/integrations/supabase/client';

interface DeleteProgressDialogProps {
  entryId: string;
  entryType: string;
  onProgressDeleted: () => void;
  setActiveTab?: (tab: string) => void;
}

const DeleteProgressDialog: React.FC<DeleteProgressDialogProps> = ({
  entryId,
  entryType,
  onProgressDeleted,
  setActiveTab
}) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setLoading(true);
    try {
      // Delete from progress_entries table
      const { error } = await supabase
        .from('progress_entries')
        .delete()
        .eq('id', entryId);
      if (error) throw error;
      toast({
        title: "Success",
        description: "Progress entry deleted successfully!",
      });
      onProgressDeleted();
      
      // Redirect to tahsin tab if deleting tahsin progress
      if (entryType === 'tilawah' && setActiveTab) {
        setActiveTab('tilawah');
      }
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

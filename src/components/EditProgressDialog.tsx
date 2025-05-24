
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProgressEntry {
  id: string;
  date: string;
  type: string;
  surah_or_jilid: string | null;
  ayat_or_page: string | null;
  notes: string | null;
}

interface EditProgressDialogProps {
  entry: ProgressEntry;
  onProgressUpdated: () => void;
}

const EditProgressDialog: React.FC<EditProgressDialogProps> = ({ entry, onProgressUpdated }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: entry.date,
    surah_or_jilid: entry.surah_or_jilid || '',
    ayat_or_page: entry.ayat_or_page || '',
    notes: entry.notes || ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('progress_entries')
        .update(formData)
        .eq('id', entry.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Progress updated successfully!",
      });

      setOpen(false);
      onProgressUpdated();
    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        title: "Error",
        description: "Failed to update progress. Please try again.",
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
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit {entry.type === 'hafalan' ? 'Hafalan' : 'Tilawati'} Progress</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="surah_or_jilid">
              {entry.type === 'hafalan' ? 'Surah' : 'Jilid/Level'}
            </Label>
            <Input
              id="surah_or_jilid"
              value={formData.surah_or_jilid}
              onChange={(e) => handleInputChange('surah_or_jilid', e.target.value)}
              placeholder={entry.type === 'hafalan' ? 'e.g., Al-Fatihah' : 'e.g., Jilid 1'}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ayat_or_page">
              {entry.type === 'hafalan' ? 'Verse/Ayat' : 'Page'}
            </Label>
            <Input
              id="ayat_or_page"
              value={formData.ayat_or_page}
              onChange={(e) => handleInputChange('ayat_or_page', e.target.value)}
              placeholder={entry.type === 'hafalan' ? 'e.g., 1-7' : 'e.g., 5'}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Progress'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProgressDialog;

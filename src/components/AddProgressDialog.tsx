import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { GradientButton } from '@/components/ui/gradient-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { quranSurahs } from '@/utils/quranData';

interface AddProgressDialogProps {
  studentId: string;
  onProgressAdded: () => void;
}

const AddProgressDialog: React.FC<AddProgressDialogProps> = ({ studentId, onProgressAdded }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();
  const [formData, setFormData] = useState({
    type: '',
    date: new Date().toISOString().split('T')[0],
    surah_or_jilid: '',
    ayat_or_page: '',
    notes: ''
  });
  const { toast } = useToast();

  // Check if user is authorized (teacher)
  if (profile?.role !== 'teacher') {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Verify role again before submission
      if (profile?.role !== 'teacher') {
        toast({
          title: "Unauthorized",
          description: "Only teachers can add progress entries.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('progress_entries')
        .insert([{
          student_id: studentId,
          ...formData
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Progress entry added successfully!",
      });

      setFormData({
        type: '',
        date: new Date().toISOString().split('T')[0],
        surah_or_jilid: '',
        ayat_or_page: '',
        notes: ''
      });
      setOpen(false);
      onProgressAdded();
    } catch (error) {
      console.error('Error adding progress:', error);
      toast({
        title: "Error",
        description: "Failed to add progress entry. Please try again.",
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
        <Button className="bg-gradient-to-r from-emerald-500 to-teal-400 hover:opacity-90">
          <Plus className="h-4 w-4 mr-2" />
          Add Progress
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Daily Progress</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Progress Type</Label>
            <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select progress type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hafalan">Hafalan/Memorizing</SelectItem>
                <SelectItem value="tilawah">Tilawati/Reciting</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
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
              {formData.type === 'hafalan' ? 'Surah' : 'Jilid/Level'}
            </Label>
            {formData.type === 'hafalan' ? (
              <Select 
                value={formData.surah_or_jilid} 
                onValueChange={(value) => handleInputChange('surah_or_jilid', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a surah" />
                </SelectTrigger>
                <SelectContent>
                  {quranSurahs.map((surah) => (
                    <SelectItem key={surah.number} value={surah.name}>
                      {surah.name} ({surah.verses} verses)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="surah_or_jilid"
                value={formData.surah_or_jilid}
                onChange={(e) => handleInputChange('surah_or_jilid', e.target.value)}
                placeholder="e.g., Jilid 1"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ayat_or_page">
              {formData.type === 'hafalan' ? 'Verse/Ayat' : 'Page/Verse'}
            </Label>
            <Input
              id="ayat_or_page"
              value={formData.ayat_or_page}
              onChange={(e) => handleInputChange('ayat_or_page', e.target.value)}
              placeholder={formData.type === 'hafalan' ? 'e.g., 1-7' : 'e.g., Page 15'}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes about the progress..."
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <GradientButton type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Progress'}
            </GradientButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProgressDialog;

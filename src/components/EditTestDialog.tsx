import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import type { TilawatiTest } from '@/types/tilawati';

interface EditTestDialogProps {
  test: TilawatiTest;
  onTestUpdated: () => void;
}

const EditTestDialog: React.FC<EditTestDialogProps> = ({ test, onTestUpdated }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    student_id: test.student_id,
    class_name: test.class_name,
    tilawati_level: test.tilawati_level,
    date: test.date,
    munaqisy: test.munaqisy,
    status: test.status,
    notes: test.notes || ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await supabase
        .from('tilawati_level_tests')
        .update(formData)
        .eq('id', test.id);

      if (data) {
      toast({
        title: "Success",
        description: "Test updated successfully!",
      });

      setOpen(false);
      onTestUpdated();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update test. Please try again.",
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
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto" aria-describedby="edit-test-description">
        <DialogHeader className="px-4 sm:px-6 pt-6">
          <DialogTitle>Edit Test</DialogTitle>
          <DialogDescription id="edit-test-description">
            Update the test details for this student.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 px-4 sm:px-6 pb-6">
          <div className="space-y-2">
            <Label htmlFor="date">Test Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tilawati_level">Target Level</Label>
            <Select 
              value={formData.tilawati_level} 
              onValueChange={(value) => handleInputChange('tilawati_level', value)}
            >
              <SelectTrigger id="tilawati_level">
                <SelectValue placeholder="Select target level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Jilid 1">Jilid 1</SelectItem>
                <SelectItem value="Jilid 2">Jilid 2</SelectItem>
                <SelectItem value="Jilid 3">Jilid 3</SelectItem>
                <SelectItem value="Jilid 4">Jilid 4</SelectItem>
                <SelectItem value="Jilid 5">Jilid 5</SelectItem>
                <SelectItem value="Jilid 6">Jilid 6</SelectItem>
                <SelectItem value="Al-Quran">Al-Quran</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="munaqisy">Examiner</Label>
            <Input
              id="munaqisy"
              value={formData.munaqisy}
              onChange={(e) => handleInputChange('munaqisy', e.target.value)}
              placeholder="Examiner name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => handleInputChange('status', value)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select test status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="passed">Passed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending_retake">Pending Retake</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
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

          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? 'Updating...' : 'Update Test'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTestDialog; 
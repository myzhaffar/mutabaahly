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
      const { error } = await supabase
        .from('tilawati_level_tests')
        .update(formData)
        .eq('id', test.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Test updated successfully!",
      });

      setOpen(false);
      onTestUpdated();
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
      <DialogContent className="sm:max-w-[425px]" aria-describedby="edit-test-description">
        <DialogHeader>
          <DialogTitle>Edit Test</DialogTitle>
          <DialogDescription id="edit-test-description">
            Update the test details for this student.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              <SelectTrigger>
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
              <SelectTrigger>
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

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Test'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTestDialog; 
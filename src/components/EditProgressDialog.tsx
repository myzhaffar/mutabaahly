import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { quranSurahs, getSurahsByJuz, getJuzOptions, getJuzBySurah } from '@/utils/quranData';
import { supabase } from '@/integrations/supabase/client';

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
  setActiveTab?: (tab: string) => void;
}

const EditProgressDialog: React.FC<EditProgressDialogProps> = ({ entry, onProgressUpdated, setActiveTab }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: entry.date,
    surah_or_jilid: entry.surah_or_jilid || '',
    ayat_or_page: entry.ayat_or_page || '',
    notes: entry.notes || ''
  });
  const { toast } = useToast();

  // Detect tahsin mode for tilawah
  const initialTahsinMode = entry.type === 'tilawah'
    ? (/^level\s*\d+$/i.test(entry.surah_or_jilid || '') ? 'tilawati' : 'alquran')
    : '';
  const [tahsinMode, setTahsinMode] = useState<'tilawati' | 'alquran' | ''>(initialTahsinMode);

  // Juz selection for hafalan
  const [selectedJuz, setSelectedJuz] = useState<number | ''>('');

  // Initialize juz based on current surah
  React.useEffect(() => {
    if (entry.type === 'hafalan' && entry.surah_or_jilid) {
      const surah = quranSurahs.find(s => s.name === entry.surah_or_jilid);
      if (surah) {
        setSelectedJuz(getJuzBySurah(surah.number));
      }
    }
  }, [entry]);

  // Get filtered surahs based on selected juz
  const getFilteredSurahs = () => {
    if (selectedJuz && typeof selectedJuz === 'number') {
      return getSurahsByJuz(selectedJuz);
    }
    return quranSurahs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatePayload = {
        ...formData,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase
        .from('progress_entries')
        .update(updatePayload)
        .eq('id', entry.id);
      if (error) throw error;
      toast({
        title: "Success",
        description: "Progress updated successfully!",
      });
      setOpen(false);
      onProgressUpdated();
      if (entry.type === 'tilawah' && setActiveTab) setActiveTab('tilawah');
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

  const handleJuzChange = (juz: string) => {
    setSelectedJuz(juz === '0' ? '' : parseInt(juz));
    // Reset surah selection when juz changes
    setFormData(prev => ({ ...prev, surah_or_jilid: '' }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" aria-describedby="edit-progress-description">
        <DialogHeader>
          <DialogTitle>Edit {entry.type === 'hafalan' ? 'Hafalan' : 'Tilawati'} Progress</DialogTitle>
          <DialogDescription id="edit-progress-description">
            Update the progress details for this entry.
          </DialogDescription>
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
          {entry.type === 'tilawah' && (
            <div className="space-y-2">
              <Label htmlFor="tahsin_mode">Tahsin Mode</Label>
              <Select value={tahsinMode} onValueChange={(value) => setTahsinMode(value as 'tilawati' | 'alquran' | '')}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tilawati">Tilawati</SelectItem>
                  <SelectItem value="alquran">Al Quran</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {/* Juz selection for Hafalan */}
          {entry.type === 'hafalan' && (
            <div className="space-y-2">
              <Label htmlFor="juz">Juz</Label>
              <Select
                value={selectedJuz === '' ? '0' : selectedJuz.toString()}
                onValueChange={handleJuzChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a juz (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Select Juz</SelectItem>
                  {getJuzOptions().map((juz) => (
                    <SelectItem key={juz.value} value={juz.value.toString()}>
                      {juz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {/* Surah/Jilid/Level selection */}
          {entry.type === 'hafalan' && (
            <div className="space-y-2">
              <Label htmlFor="surah_or_jilid">Surah</Label>
              <Select
                value={formData.surah_or_jilid}
                onValueChange={(value) => handleInputChange('surah_or_jilid', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a surah" />
                </SelectTrigger>
                <SelectContent>
                  {getFilteredSurahs().map((surah) => (
                    <SelectItem key={surah.number} value={surah.name}>
                      {surah.name} ({surah.verses} verses)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {entry.type === 'tilawah' && tahsinMode === 'tilawati' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="surah_or_jilid">Level</Label>
                <Select
                  value={formData.surah_or_jilid}
                  onValueChange={(value) => handleInputChange('surah_or_jilid', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6].map((level) => (
                      <SelectItem key={level} value={`Level ${level}`}>{`Level ${level}`}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ayat_or_page">Page</Label>
                <Input
                  id="ayat_or_page"
                  value={formData.ayat_or_page}
                  onChange={(e) => handleInputChange('ayat_or_page', e.target.value)}
                  placeholder="e.g., 1-44"
                />
              </div>
            </>
          )}
          {entry.type === 'tilawah' && tahsinMode === 'alquran' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="surah_or_jilid">Surah</Label>
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="ayat_or_page">Ayat/Verse</Label>
                <Input
                  id="ayat_or_page"
                  value={formData.ayat_or_page}
                  onChange={(e) => handleInputChange('ayat_or_page', e.target.value)}
                  placeholder="e.g., 1-7"
                />
              </div>
            </>
          )}
          {/* Hafalan ayat input */}
          {entry.type === 'hafalan' && (
            <div className="space-y-2">
              <Label htmlFor="ayat_or_page">Ayat</Label>
              <Input
                id="ayat_or_page"
                value={formData.ayat_or_page}
                onChange={(e) => handleInputChange('ayat_or_page', e.target.value)}
                placeholder="e.g., 1-7"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Add any additional notes..."
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

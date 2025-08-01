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

          // Juz selection for tahfidz
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
      // Validate required fields
      if (!formData.date) {
        throw new Error("Date is required");
      }

      // Prepare update payload with proper data formatting
      const updatePayload = {
        date: formData.date,
        surah_or_jilid: formData.surah_or_jilid || null,
        ayat_or_page: formData.ayat_or_page || null,
        notes: formData.notes || null,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('progress_entries')
        .update(updatePayload)
        .eq('id', entry.id)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message || "Failed to update progress");
      }

      if (data && data.length > 0) {
        toast({
          title: "Success",
          description: "Progress updated successfully!",
        });
        setOpen(false);
        onProgressUpdated();
        // Redirect to appropriate tab based on entry type
        if (entry.type === 'tilawah' && setActiveTab) {
          setActiveTab('tilawah');
        } else if (entry.type === 'hafalan' && setActiveTab) {
          setActiveTab('hafalan');
        }
      } else {
        throw new Error("No data returned from update");
      }
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update progress. Please try again.",
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit {entry.type === 'hafalan' ? 'Tahfidz' : 'Tilawati'} Progress</DialogTitle>
          <DialogDescription>
            Update the progress details for this entry.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
              <Label htmlFor="tahsin-mode">Tahsin Mode</Label>
              <Select value={tahsinMode} onValueChange={(value) => setTahsinMode(value as 'tilawati' | 'alquran' | '')}>
                <SelectTrigger id="tahsin-mode">
                  <SelectValue placeholder="Choose mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tilawati">Tilawati</SelectItem>
                  <SelectItem value="alquran">Al Quran</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {/* Juz selection for Tahfidz */}
          {entry.type === 'hafalan' && (
            <div className="space-y-2">
              <Label htmlFor="juz-select">Juz</Label>
              <Select
                value={selectedJuz === '' ? '0' : selectedJuz.toString()}
                onValueChange={handleJuzChange}
              >
                <SelectTrigger id="juz-select">
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
              <Label htmlFor="surah-select">Surah</Label>
              <Select
                value={formData.surah_or_jilid}
                onValueChange={(value) => handleInputChange('surah_or_jilid', value)}
              >
                <SelectTrigger id="surah-select">
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
                <Label htmlFor="level-select">Level</Label>
                <Select
                  value={formData.surah_or_jilid}
                  onValueChange={(value) => handleInputChange('surah_or_jilid', value)}
                >
                  <SelectTrigger id="level-select">
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
                <Label htmlFor="page-input">Page</Label>
                <Input
                  id="page-input"
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
                <Label htmlFor="alquran-surah-select">Surah</Label>
                <Select
                  value={formData.surah_or_jilid}
                  onValueChange={(value) => handleInputChange('surah_or_jilid', value)}
                >
                  <SelectTrigger id="alquran-surah-select">
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
                <Label htmlFor="ayat-input">Ayat/Verse</Label>
                <Input
                  id="ayat-input"
                  value={formData.ayat_or_page}
                  onChange={(e) => handleInputChange('ayat_or_page', e.target.value)}
                  placeholder="e.g., 1-7"
                />
              </div>
            </>
          )}
          {/* Tahfidz ayat input */}
          {entry.type === 'hafalan' && (
            <div className="space-y-2">
              <Label htmlFor="tahfidz-ayat-input">Ayat</Label>
              <Input
                id="tahfidz-ayat-input"
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
            <Button 
              type="submit" 
              disabled={loading}
              aria-describedby={loading ? "loading-status" : undefined}
            >
              {loading ? 'Updating...' : 'Update Progress'}
            </Button>
            {loading && (
              <div id="loading-status" className="sr-only">
                Updating progress entry
              </div>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProgressDialog;

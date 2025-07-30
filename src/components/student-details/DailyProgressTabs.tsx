import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import ProgressEntriesTable from './ProgressEntriesTable';
import ExportProgressDialog from './ExportProgressDialog';
import { useTranslation } from 'react-i18next';
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

interface DailyProgressTabsProps {
  tahfidzEntries: ProgressEntry[];
  tilawahEntries: ProgressEntry[];
  onProgressUpdated: () => void;
  onTabChange: (tab: string) => void;
  activeTab?: string;
  studentId: string;
}

const DailyProgressTabs: React.FC<DailyProgressTabsProps> = ({
  tahfidzEntries,
  tilawahEntries,
  onProgressUpdated,
  onTabChange,
  activeTab = 'tahfidz',
  studentId
}) => {
  const [tab, setTab] = useState(activeTab);
  const [exportOpen, setExportOpen] = useState(false);
  const { t } = useTranslation();
  const { toast } = useToast();

  // Update internal tab state when activeTab prop changes
  useEffect(() => {
    setTab(activeTab);
  }, [activeTab]);

  const handleTabChange = (value: string) => {
    setTab(value);
    onTabChange(value);
  };

  const handleDuplicate = async (entry: ProgressEntry) => {
    try {
      // Create a new entry with the same data but today's date
      const duplicateData = {
        student_id: studentId,
        type: entry.type as 'hafalan' | 'tilawah',
        date: new Date().toISOString().split('T')[0], // Today's date
        surah_or_jilid: entry.surah_or_jilid,
        ayat_or_page: entry.ayat_or_page,
        notes: entry.notes
      };

      const { error } = await supabase
        .from('progress_entries')
        .insert([duplicateData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Progress entry duplicated successfully!",
      });

      // Refresh the data
      onProgressUpdated();

      // Redirect to appropriate tab based on entry type
      if (entry.type === 'tilawah') {
        onTabChange('tilawah');
      } else if (entry.type === 'hafalan') {
        onTabChange('tahfidz');
      }
    } catch (error) {
      console.error('Error duplicating progress:', error);
      toast({
        title: "Error",
        description: "Failed to duplicate progress entry. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('tabs.dailyProgress')}</CardTitle>
        <Button variant="outline" onClick={() => setExportOpen(true)}>
          {t('tabs.export')}
        </Button>
        <ExportProgressDialog
          open={exportOpen}
          onOpenChange={setExportOpen}
          hafalanEntries={tahfidzEntries}
          tilawahEntries={tilawahEntries}
        />
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="tahfidz"
              className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700"
            >
              {t('tabs.tahfidz')}
            </TabsTrigger>
            <TabsTrigger
              value="tilawah"
              className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700"
            >
              {t('tabs.tahsin')}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tahfidz" className="mt-6">
            <ProgressEntriesTable 
              entries={tahfidzEntries}
              type="hafalan"
              onProgressUpdated={onProgressUpdated}
              onDuplicateEntry={(entry) => handleDuplicate(entry)}
              setActiveTab={onTabChange}
            />
          </TabsContent>
          
          <TabsContent value="tilawah" className="mt-6">
            <ProgressEntriesTable 
              entries={tilawahEntries}
              type="tilawah"
              onProgressUpdated={onProgressUpdated}
              onDuplicateEntry={(entry) => handleDuplicate(entry)}
              setActiveTab={onTabChange}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DailyProgressTabs;

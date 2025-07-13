import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProgressEntriesTable from './ProgressEntriesTable';
import { Button } from '@/components/ui/button';
import ExportProgressDialog from './ExportProgressDialog';

import { supabase } from '@/integrations/supabase/client';

interface ProgressEntry {
  id: string;
  date: string;
  type: string;
  surah_or_jilid: string | null;
  ayat_or_page: string | null;
  notes: string | null;
}

interface DailyProgressTabsProps {
  hafalanEntries: ProgressEntry[];
  tilawahEntries: ProgressEntry[];
  onProgressUpdated: () => void;
  studentId: string;
}

const DailyProgressTabs: React.FC<DailyProgressTabsProps> = ({
  hafalanEntries,
  tilawahEntries,
  onProgressUpdated,
  studentId
}) => {
  const [exportOpen, setExportOpen] = React.useState(false);

  const handleDuplicate = async (type: 'hafalan' | 'tilawah', entry: ProgressEntry) => {
    if (!studentId) return;
    const newEntry = {
      student_id: studentId,
      date: new Date().toISOString().split('T')[0],
      type: entry.type,
      surah_or_jilid: entry.surah_or_jilid,
      ayat_or_page: entry.ayat_or_page,
      notes: entry.notes,
    };
    const { error } = await supabase.from('progress_entries').insert([newEntry]);
    if (!error) onProgressUpdated();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Daily Progress Records</CardTitle>
        <Button variant="outline" onClick={() => setExportOpen(true)}>
          Export
        </Button>
        <ExportProgressDialog
          open={exportOpen}
          onOpenChange={setExportOpen}
          hafalanEntries={hafalanEntries}
          tilawahEntries={tilawahEntries}
        />
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="hafalan" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="hafalan"
              className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700"
            >
              Tahfidz
            </TabsTrigger>
            <TabsTrigger
              value="tilawah"
              className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
            >
              Tahsin
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="hafalan" className="mt-6">
            <ProgressEntriesTable 
              entries={hafalanEntries}
              type="hafalan"
              onProgressUpdated={onProgressUpdated}
              onDuplicateEntry={entry => handleDuplicate('hafalan', entry)}
            />
          </TabsContent>
          
          <TabsContent value="tilawah" className="mt-6">
            <ProgressEntriesTable 
              entries={tilawahEntries}
              type="tilawah"
              onProgressUpdated={onProgressUpdated}
              onDuplicateEntry={entry => handleDuplicate('tilawah', entry)}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DailyProgressTabs;

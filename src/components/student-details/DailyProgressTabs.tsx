import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProgressEntriesTable from './ProgressEntriesTable';

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
}

const DailyProgressTabs: React.FC<DailyProgressTabsProps> = ({
  hafalanEntries,
  tilawahEntries,
  onProgressUpdated
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Progress Records</CardTitle>
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
            />
          </TabsContent>
          
          <TabsContent value="tilawah" className="mt-6">
            <ProgressEntriesTable 
              entries={tilawahEntries}
              type="tilawah"
              onProgressUpdated={onProgressUpdated}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DailyProgressTabs;

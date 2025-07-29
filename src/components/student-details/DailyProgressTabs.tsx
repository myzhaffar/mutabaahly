import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import ProgressEntriesTable from './ProgressEntriesTable';
import ExportProgressDialog from './ExportProgressDialog';
import { useTranslation } from 'react-i18next';

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
  onTabChange: (tab: string) => void;
}

const DailyProgressTabs: React.FC<DailyProgressTabsProps> = ({
  hafalanEntries,
  tilawahEntries,
  onProgressUpdated,
  onTabChange
}) => {
  const [tab, setTab] = useState('hafalan');
  const [exportOpen, setExportOpen] = useState(false);
  const { t } = useTranslation();

  const handleTabChange = (value: string) => {
    setTab(value);
    onTabChange(value);
  };

  const handleDuplicate = () => {
    // Handle duplicate functionality
    // TODO: Implement duplicate functionality
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
          hafalanEntries={hafalanEntries}
          tilawahEntries={tilawahEntries}
        />
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="hafalan"
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
          
          <TabsContent value="hafalan" className="mt-6">
            <ProgressEntriesTable 
              entries={hafalanEntries}
              type="hafalan"
              onProgressUpdated={onProgressUpdated}
              onDuplicateEntry={() => handleDuplicate()}
              setActiveTab={onTabChange}
            />
          </TabsContent>
          
          <TabsContent value="tilawah" className="mt-6">
            <ProgressEntriesTable 
              entries={tilawahEntries}
              type="tilawah"
              onProgressUpdated={onProgressUpdated}
              onDuplicateEntry={() => handleDuplicate()}
              setActiveTab={onTabChange}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DailyProgressTabs;

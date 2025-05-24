
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import EditProgressDialog from '@/components/EditProgressDialog';
import DeleteProgressDialog from '@/components/DeleteProgressDialog';

interface ProgressEntry {
  id: string;
  date: string;
  type: string;
  surah_or_jilid: string | null;
  ayat_or_page: string | null;
  notes: string | null;
}

interface ProgressEntriesTableProps {
  entries: ProgressEntry[];
  type: 'hafalan' | 'tilawah';
  onProgressUpdated: () => void;
}

const ProgressEntriesTable: React.FC<ProgressEntriesTableProps> = ({
  entries,
  type,
  onProgressUpdated
}) => {
  const isHafalan = type === 'hafalan';

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>{isHafalan ? 'Surah' : 'Jilid/Level'}</TableHead>
          <TableHead>{isHafalan ? 'Verse/Ayat' : 'Page/Verse'}</TableHead>
          <TableHead>Notes</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-gray-500">
              No {type} progress recorded yet
            </TableCell>
          </TableRow>
        ) : (
          entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
              <TableCell>{entry.surah_or_jilid || '-'}</TableCell>
              <TableCell>{entry.ayat_or_page || '-'}</TableCell>
              <TableCell>{entry.notes || '-'}</TableCell>
              <TableCell>
                <div className="flex space-x-1">
                  <EditProgressDialog entry={entry} onProgressUpdated={onProgressUpdated} />
                  <DeleteProgressDialog 
                    entryId={entry.id} 
                    entryType={type} 
                    onProgressDeleted={onProgressUpdated} 
                  />
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default ProgressEntriesTable;

import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import EditProgressDialog from '@/components/EditProgressDialog';
import DeleteProgressDialog from '@/components/DeleteProgressDialog';
import { useAuth } from '@/contexts/useAuth';
import { Copy, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

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
  onDuplicateEntry?: (entry: ProgressEntry) => void;
  setActiveTab?: (tab: string) => void;
}

const ProgressEntriesTable: React.FC<ProgressEntriesTableProps> = ({
  entries,
  type,
  onProgressUpdated,
  onDuplicateEntry,
  setActiveTab
}) => {
  const { profile } = useAuth();
  const isTeacher = profile?.role === 'teacher';
  const isHafalan = type === 'hafalan';

  // Pagination logic
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(entries.length / itemsPerPage);
  const paginatedEntries = entries.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // Reset to page 1 if entries or itemsPerPage change
  React.useEffect(() => { setPage(1); }, [entries.length, itemsPerPage]);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>{isHafalan ? 'Surah' : 'Jilid/Level'}</TableHead>
            <TableHead>{isHafalan ? 'Ayat' : 'Page/Verse'}</TableHead>
            <TableHead>Notes</TableHead>
            {isTeacher && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={isTeacher ? 5 : 4} className="text-center text-gray-500">
                No {type} progress recorded yet
              </TableCell>
            </TableRow>
          ) : (
            paginatedEntries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                <TableCell>{entry.surah_or_jilid || '-'}</TableCell>
                <TableCell>{entry.ayat_or_page || '-'}</TableCell>
                <TableCell>{entry.notes || '-'}</TableCell>
                {isTeacher && (
                  <TableCell>
                    <div className="flex space-x-1">
                      <EditProgressDialog entry={entry} onProgressUpdated={onProgressUpdated} setActiveTab={setActiveTab} />
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded p-2 text-black transition-transform duration-150 hover:scale-110 hover:text-blue-600 focus:outline-none"
                        title="Duplicate"
                        onClick={() => onDuplicateEntry ? onDuplicateEntry(entry) : undefined}
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <DeleteProgressDialog 
                        entryId={entry.id}
                        entryType={type} 
                        onProgressDeleted={onProgressUpdated} 
                      />
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {totalPages > 1 || entries.length > 0 ? (
         <div className="px-4 py-3 border-t border-gray-200 bg-white gap-2 flex flex-col sm:flex-row sm:items-center sm:relative">
           {/* Left: Rows per page */}
           <div className="flex items-center gap-2 mb-2 sm:mb-0">
             <span className="text-xs text-gray-600">Rows per page:</span>
             <Select value={String(itemsPerPage)} onValueChange={v => setItemsPerPage(Number(v))}>
               <SelectTrigger className="w-16 h-8 text-xs">
                 <SelectValue />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="5">5</SelectItem>
                 <SelectItem value="10">10</SelectItem>
               </SelectContent>
             </Select>
           </div>
           {/* Page info and arrows: mobile left, desktop centered/arrows right */}
           <div className="flex items-center gap-1 w-full sm:w-auto sm:ml-auto">
             <span className="text-xs text-gray-600 font-medium sm:absolute sm:left-1/2 sm:-translate-x-1/2 sm:w-auto">
               Page {page} of {totalPages}
             </span>
             <Button
               variant="outline"
               size="sm"
               onClick={() => setPage(page - 1)}
               disabled={page === 1}
               aria-label="Previous Page"
               className="ml-2 sm:ml-4"
             >
               <ChevronLeft className="h-4 w-4" />
               <span className="sr-only">Previous</span>
             </Button>
             <Button
               variant="outline"
               size="sm"
               onClick={() => setPage(page + 1)}
               disabled={page === totalPages}
               aria-label="Next Page"
             >
               <ChevronRight className="h-4 w-4" />
               <span className="sr-only">Next</span>
             </Button>
           </div>
         </div>
      ) : null}
    </>
  );
};

export default ProgressEntriesTable;

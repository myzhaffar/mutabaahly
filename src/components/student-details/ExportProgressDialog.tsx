import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';

interface ProgressEntry {
  id: string;
  date: string;
  type: string;
  surah_or_jilid: string | null;
  ayat_or_page: string | null;
  notes: string | null;
}

type ExportRange = 'today' | '7days' | 'month';

const parseDate = (dateString: string): Date => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }
    throw new Error(`Invalid date format: ${dateString}`);
  }
  return date;
};

const normalizeToStartOfDay = (date: Date): Date => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

const normalizeToEndOfDay = (date: Date): Date => {
  const normalized = new Date(date);
  normalized.setHours(23, 59, 59, 999);
  return normalized;
};

interface ExportProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hafalanEntries: ProgressEntry[];
  tilawahEntries: ProgressEntry[];
}

const ExportProgressDialog: React.FC<ExportProgressDialogProps> = ({
  open,
  onOpenChange,
  hafalanEntries,
  tilawahEntries,
}) => {
  // Use local state for entries to allow duplication
  const [localEntries] = useState([...hafalanEntries, ...tilawahEntries]);
  const parsedEntries = localEntries.map(entry => ({
    ...entry,
    parsedDate: parseDate(entry.date)
  })).sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());

  const [loading, setLoading] = useState(false);
  const [selectedRange, setSelectedRange] = useState<ExportRange>('today');
  const [pendingExport, setPendingExport] = useState<null | 'excel' | 'pdf'>(null);

  // Reset to page 1 when range changes or filteredEntries changes
  React.useEffect(() => {
    // setPage(1); // Removed pagination state, so no need to reset page here
  }, [selectedRange, parsedEntries.length]);

  // Calculate date boundaries for each range
  const now = new Date();
  const todayStart = normalizeToStartOfDay(now);
  const todayEnd = normalizeToEndOfDay(now);
  const sevenDaysAgo = normalizeToStartOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6));
  const monthStart = normalizeToStartOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
  const monthEnd = normalizeToEndOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0));

  let filteredEntries = parsedEntries;
  let rangeLabel = '';
  if (selectedRange === 'today') {
    filteredEntries = parsedEntries.filter(entry => entry.parsedDate >= todayStart && entry.parsedDate <= todayEnd);
    rangeLabel = `Today (${todayStart.toLocaleDateString()})`;
  } else if (selectedRange === '7days') {
    filteredEntries = parsedEntries.filter(entry => entry.parsedDate >= sevenDaysAgo && entry.parsedDate <= todayEnd);
    rangeLabel = `Last 7 Days (${sevenDaysAgo.toLocaleDateString()} - ${todayEnd.toLocaleDateString()})`;
  } else if (selectedRange === 'month') {
    filteredEntries = parsedEntries.filter(entry => entry.parsedDate >= monthStart && entry.parsedDate <= monthEnd);
    rangeLabel = `This Month (${monthStart.toLocaleDateString()} - ${monthEnd.toLocaleDateString()})`;
  }



  const handleExportExcel = () => {
    if (filteredEntries.length === 0) return;
    setLoading(true);
    try {
      const data = filteredEntries.map(entry => ({
        Date: entry.parsedDate.toLocaleDateString('en-CA'),
        Type: entry.type,
        'Surah/Jilid': entry.surah_or_jilid || '-',
        'Ayat/Page': entry.ayat_or_page || '-',
        Notes: entry.notes || '-',
      }));
      const worksheet = XLSX.utils.json_to_sheet(data);
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      const colWidths = [];
      for (let C = range.s.c; C <= range.e.c; ++C) {
        let maxWidth = 10;
        for (let R = range.s.r; R <= range.e.r; ++R) {
          const cell = worksheet[XLSX.utils.encode_cell({r: R, c: C})];
          if (cell && cell.v) {
            const cellWidth = cell.v.toString().length;
            if (cellWidth > maxWidth) maxWidth = cellWidth;
          }
        }
        colWidths.push({ wch: Math.min(maxWidth + 2, 50) });
      }
      worksheet['!cols'] = colWidths;
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Progress Entries');
      const filename = `progress_entries_${selectedRange}_${new Date().toLocaleDateString('en-CA')}.xlsx`;
      XLSX.writeFile(workbook, filename);
      onOpenChange(false);
    } catch (error) {
      console.error('Error exporting Excel:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (filteredEntries.length === 0) return;
    setLoading(true);
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('Progress Entries Report', 20, 20);
      doc.setFontSize(10);
      doc.text(rangeLabel, 20, 30);
      doc.text(`Total Entries: ${filteredEntries.length}`, 20, 35);
      let y = 45;
      doc.setFontSize(8);
      doc.text('Date', 20, y);
      doc.text('Type', 50, y);
      doc.text('Surah/Jilid', 80, y);
      doc.text('Ayat/Page', 120, y);
      doc.text('Notes', 150, y);
      doc.line(20, y + 2, 190, y + 2);
      y += 8;
      filteredEntries.forEach((entry) => {
        if (y > 280) {
          doc.addPage();
          y = 20;
          doc.setFontSize(8);
          doc.text('Date', 20, y);
          doc.text('Type', 50, y);
          doc.text('Surah/Jilid', 80, y);
          doc.text('Ayat/Page', 120, y);
          doc.text('Notes', 150, y);
          doc.line(20, y + 2, 190, y + 2);
          y += 8;
        }
        doc.setFontSize(8);
        doc.text(entry.parsedDate.toLocaleDateString(), 20, y);
        doc.text(entry.type, 50, y);
        doc.text(entry.surah_or_jilid || '-', 80, y);
        doc.text(entry.ayat_or_page || '-', 120, y);
        const notes = entry.notes || '-';
        const truncatedNotes = notes.length > 25 ? notes.substring(0, 25) + '...' : notes;
        doc.text(truncatedNotes, 150, y);
        y += 6;
      });
      const filename = `progress_entries_${selectedRange}_${new Date().toLocaleDateString('en-CA')}.pdf`;
      doc.save(filename);
      onOpenChange(false);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmExport = () => {
    if (pendingExport === 'excel') handleExportExcel();
    if (pendingExport === 'pdf') handleExportPDF();
    setPendingExport(null);
  };



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full p-6">
        <DialogHeader>
          <DialogTitle>Export Progress Entries</DialogTitle>
          <DialogDescription>
            Choose a range and export the student&apos;s progress as Excel or PDF.
          </DialogDescription>
        </DialogHeader>
        <div className="mb-4 bg-gray-50 rounded p-3">
          <label className="block mb-2 font-medium">Select Range</label>
          <Select value={selectedRange} onValueChange={v => setSelectedRange(v as ExportRange)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">This Day</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-600 mt-2 mb-1">{rangeLabel.replace(/'/g, "&apos;")}</p>
          <div className="text-xs text-gray-600">{filteredEntries.length} entries will be exported.</div>

          {/* Progress Entries Table without Pagination or Actions */}
          {filteredEntries.length > 0 && (
            <div className="mt-4 border rounded bg-white overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-2 text-left font-semibold text-gray-600">Date</th>
                    <th className="px-2 py-2 text-left font-semibold text-gray-600">Type</th>
                    <th className="px-2 py-2 text-left font-semibold text-gray-600">Surah/Jilid</th>
                    <th className="px-2 py-2 text-left font-semibold text-gray-600">Ayat/Page</th>
                    <th className="px-2 py-2 text-left font-semibold text-gray-600">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((entry) => (
                    <tr key={entry.id} className="border-b last:border-0">
                      <td className="px-2 py-1">{entry.parsedDate.toLocaleDateString()}</td>
                      <td className="px-2 py-1">{entry.type}</td>
                      <td className="px-2 py-1">{entry.surah_or_jilid || '-'}</td>
                      <td className="px-2 py-1">{entry.ayat_or_page || '-'}</td>
                      <td className="px-2 py-1">{entry.notes ? (entry.notes.length > 20 ? entry.notes.slice(0, 20) + '...' : entry.notes) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 justify-end">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                onClick={() => setPendingExport('excel')} 
                disabled={loading || filteredEntries.length === 0} 
                variant="outline" 
                className="flex-1 transition-transform duration-200 hover:scale-105 border-2 border-gray-400 text-gray-700 hover:border-green-400 hover:bg-gradient-to-r hover:from-green-400 hover:to-teal-500 hover:text-white"
              >
                Export as Excel
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Export</AlertDialogTitle>
                <AlertDialogDescription>
                  {"Are you sure you want to export progress for "}
                  {rangeLabel.replace(/'/g, "&apos;")}
                  {"?"}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setPendingExport(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmExport}>Export</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                onClick={() => setPendingExport('pdf')} 
                disabled={loading || filteredEntries.length === 0} 
                variant="outline" 
                className="flex-1 transition-transform duration-200 hover:scale-105 border-2 border-gray-400 text-gray-700 hover:border-green-400 hover:bg-gradient-to-r hover:from-green-400 hover:to-teal-500 hover:text-white"
              >
                Export as PDF
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Export</AlertDialogTitle>
                <AlertDialogDescription>
                  {"Are you sure you want to export progress for "}
                  {rangeLabel.replace(/'/g, "&apos;")}
                  {"?"}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setPendingExport(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmExport}>Export</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <DialogClose asChild>
            <Button variant="ghost" className="flex-1">Cancel</Button>
          </DialogClose>
        </div>
        {filteredEntries.length === 0 && (
          <div className="text-center text-sm text-red-500 mt-2">
            No entries found in the selected range.
          </div>
        )}
        {localEntries.length === 0 && (
          <div className="text-center text-sm text-gray-500 mt-2">
            No entries available to export.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExportProgressDialog;
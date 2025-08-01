import React from 'react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import type { TilawatiTest, TestStatus } from '@/types/tilawati';
import EditTestDialog from '@/components/EditTestDialog';
import DeleteTestDialog from '@/components/DeleteTestDialog';

interface TestTableProps {
  tests: TilawatiTest[];
  isLoading: boolean;
  onTestUpdated: () => void;
  showStudentName?: boolean;
  getStudentName?: (studentId: string) => string;
}

const TestTable: React.FC<TestTableProps> = ({
  tests,
  isLoading,
  onTestUpdated,
  showStudentName = false,
  getStudentName
}) => {
  const getStatusBadge = (status: TestStatus) => {
    const variants = {
      scheduled: 'bg-blue-100 text-blue-800',
      passed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      pending_retake: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </Badge>
    );
  };

  const handleViewDetails = (test: TilawatiTest) => {
    alert(`Test Details:
Student: ${getStudentName ? getStudentName(test.student_id) : test.student_id}
Date: ${format(new Date(test.date), 'dd/MM/yyyy')}
Class: ${test.class_name || '-'}
Level: ${test.tilawati_level}
Munaqisy: ${test.munaqisy}
Status: ${test.status}
Notes: ${test.notes || 'No notes'}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-3 md:hidden">
        {/* Mobile skeleton loading */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 space-y-3">
            <div className="flex justify-between items-start gap-2">
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse"></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((j) => (
                <div key={j}>
                  <div className="h-3 bg-gray-200 rounded w-12 animate-pulse mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              {[1, 2, 3].map((k) => (
                <div key={k} className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        ))}
        
        {/* Desktop skeleton loading */}
        <div className="hidden md:block">
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <div className="bg-gray-50 p-4">
              <div className="grid grid-cols-8 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
            {[1, 2, 3].map((row) => (
              <div key={row} className="p-4 border-t border-gray-100">
                <div className="grid grid-cols-8 gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((col) => (
                    <div key={col} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Mobile card view
  const MobileView = () => (
    <div className="space-y-3 md:hidden">
      {tests.map((test) => (
        <div key={test.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 space-y-3">
          {showStudentName && (
            <div className="flex justify-between items-start gap-2">
              <span className="font-semibold text-gray-900 text-sm leading-tight">
                {getStudentName ? getStudentName(test.student_id) : test.student_id}
              </span>
              {getStatusBadge(test.status)}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Class</p>
              <p className="font-medium text-gray-900 mt-1">{test.class_name || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Level</p>
              <p className="font-medium text-gray-900 mt-1">{test.tilawati_level}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Date</p>
              <p className="font-medium text-gray-900 mt-1">{format(new Date(test.date), 'dd/MM/yyyy')}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Examiner</p>
              <p className="font-medium text-gray-900 mt-1">{test.munaqisy}</p>
            </div>
          </div>
          {test.notes && (
            <div className="border-t border-gray-100 pt-3">
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">Notes</p>
              <p className="text-sm text-gray-700 leading-relaxed">{test.notes}</p>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <Button variant="ghost" size="sm" onClick={() => handleViewDetails(test)} className="h-8 px-2">
              <Eye className="h-4 w-4" />
            </Button>
            <EditTestDialog test={test} onTestUpdated={onTestUpdated} />
            <DeleteTestDialog testId={test.id} onTestDeleted={onTestUpdated} />
          </div>
        </div>
      ))}
    </div>
  );

  // Desktop table view
  const DesktopView = () => (
    <div className="hidden md:block">
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              {showStudentName && <TableHead className="font-semibold text-gray-700">Student Name</TableHead>}
              <TableHead className="font-semibold text-gray-700">Class</TableHead>
              <TableHead className="font-semibold text-gray-700">Tilawati Level</TableHead>
              <TableHead className="font-semibold text-gray-700">Date</TableHead>
              <TableHead className="font-semibold text-gray-700">Examiner</TableHead>
              <TableHead className="font-semibold text-gray-700">Status</TableHead>
              <TableHead className="font-semibold text-gray-700">Notes</TableHead>
              <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tests.map((test) => (
              <TableRow key={test.id} className="hover:bg-gray-50 transition-colors">
                {showStudentName && (
                  <TableCell className="font-medium text-gray-900">
                    {getStudentName ? getStudentName(test.student_id) : test.student_id}
                  </TableCell>
                )}
                <TableCell className="text-gray-700">{test.class_name || '-'}</TableCell>
                <TableCell className="text-gray-700">{test.tilawati_level}</TableCell>
                <TableCell className="text-gray-700">{format(new Date(test.date), 'dd/MM/yyyy')}</TableCell>
                <TableCell className="text-gray-700">{test.munaqisy}</TableCell>
                <TableCell>{getStatusBadge(test.status)}</TableCell>
                <TableCell className="text-gray-700 max-w-xs truncate" title={test.notes || '-'}>
                  {test.notes || '-'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => handleViewDetails(test)} className="h-8 w-8 p-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <EditTestDialog test={test} onTestUpdated={onTestUpdated} />
                    <DeleteTestDialog testId={test.id} onTestDeleted={onTestUpdated} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  return (
    <>
      <MobileView />
      <DesktopView />
    </>
  );
};

export default TestTable;

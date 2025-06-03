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

interface ParentTestTableProps {
  tests: TilawatiTest[];
  isLoading: boolean;
  onViewDetails?: (test: TilawatiTest) => void;
  showStudentName?: boolean;
}

const ParentTestTable: React.FC<ParentTestTableProps> = ({
  tests,
  isLoading,
  onViewDetails,
  showStudentName = false,
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Mobile card view
  const MobileView = () => (
    <div className="space-y-4 md:hidden">
      {tests.map((test) => (
        <div key={test.id} className="bg-white rounded-lg shadow p-4 space-y-3">
          {showStudentName && (
            <div className="flex justify-between items-center">
              <span className="font-medium">{test.student?.name || test.student_id}</span>
              {getStatusBadge(test.status)}
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-gray-500">Class</p>
              <p className="font-medium">{test.class_name || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500">Level</p>
              <p className="font-medium">{test.tilawati_level}</p>
            </div>
            <div>
              <p className="text-gray-500">Date</p>
              <p className="font-medium">{format(new Date(test.date), 'dd/MM/yyyy')}</p>
            </div>
            <div>
              <p className="text-gray-500">Examiner</p>
              <p className="font-medium">{test.munaqisy}</p>
            </div>
          </div>
          {test.notes && (
            <div className="border-t pt-2">
              <p className="text-gray-500">Notes</p>
              <p className="text-sm">{test.notes}</p>
            </div>
          )}
          {onViewDetails && (
            <div className="flex justify-end pt-2">
              <Button variant="ghost" size="sm" onClick={() => onViewDetails(test)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // Desktop table view
  const DesktopView = () => (
    <div className="hidden md:block overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {showStudentName && <TableHead>Student Name</TableHead>}
            <TableHead>Class</TableHead>
            <TableHead>Tilawati Level</TableHead>
            <TableHead>Test Date</TableHead>
            <TableHead>Examiner</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tests.map((test) => (
            <TableRow key={test.id}>
              {showStudentName && (
                <TableCell>{test.student?.name || test.student_id}</TableCell>
              )}
              <TableCell>{test.class_name || '-'}</TableCell>
              <TableCell>{test.tilawati_level}</TableCell>
              <TableCell>{format(new Date(test.date), 'dd/MM/yyyy')}</TableCell>
              <TableCell>{test.munaqisy}</TableCell>
              <TableCell>{getStatusBadge(test.status)}</TableCell>
              <TableCell>{test.notes || '-'}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-1">
                  {onViewDetails && (
                    <Button variant="ghost" size="sm" onClick={() => onViewDetails(test)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <>
      <MobileView />
      <DesktopView />
    </>
  );
};

export default ParentTestTable; 
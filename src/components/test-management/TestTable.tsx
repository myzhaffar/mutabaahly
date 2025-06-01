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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye } from 'lucide-react';
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
    // Default behavior - show test details in an alert or modal
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
    return <div>Loading...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {showStudentName && <TableHead>Student Name</TableHead>}
          <TableHead>Class</TableHead>
          <TableHead>Tilawati Level</TableHead>
          <TableHead>Date</TableHead>
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
              <TableCell>{getStudentName ? getStudentName(test.student_id) : test.student_id}</TableCell>
            )}
            <TableCell>{test.class_name || '-'}</TableCell>
            <TableCell>{test.tilawati_level}</TableCell>
            <TableCell>{format(new Date(test.date), 'dd/MM/yyyy')}</TableCell>
            <TableCell>{test.munaqisy}</TableCell>
            <TableCell>{getStatusBadge(test.status)}</TableCell>
            <TableCell>{test.notes || '-'}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end space-x-1">
                <Button variant="ghost" size="sm" onClick={() => handleViewDetails(test)}>
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
  );
};

export default TestTable;

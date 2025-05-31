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
import { MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
import type { TilawatiTest, TestStatus } from '@/types/tilawati';

interface TestTableProps {
  tests: TilawatiTest[];
  isLoading: boolean;
  onEditTest?: (test: TilawatiTest) => void;
  onDeleteTest?: (test: TilawatiTest) => void;
  showStudentName?: boolean;
  getStudentName?: (studentId: string) => string;
}

const TestTable: React.FC<TestTableProps> = ({
  tests,
  isLoading,
  onEditTest,
  onDeleteTest,
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
          {showStudentName && <TableHead>Nama Siswa</TableHead>}
          <TableHead>Kelas</TableHead>
          <TableHead>Level Tilawati</TableHead>
          <TableHead>Tanggal</TableHead>
          <TableHead>Munaqisy</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Catatan</TableHead>
          <TableHead className="text-right">Aksi</TableHead>
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEditTest && (
                    <DropdownMenuItem onClick={() => onEditTest(test)}>
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDeleteTest && (
                    <DropdownMenuItem
                      onClick={() => onDeleteTest(test)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Hapus
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default TestTable;

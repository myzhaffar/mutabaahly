
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
import { Card, CardContent } from '@/components/ui/card';
import { Eye } from 'lucide-react';
import type { TilawatiTest, TestStatus } from '@/types/tilawati';

interface TestTableProps {
  tests: TilawatiTest[];
  isLoading: boolean;
  onEditTest?: (test: TilawatiTest) => void;
  onViewDetails?: (test: TilawatiTest) => void;
  showStudentName?: boolean;
  getStudentName?: (studentId: string) => string;
}

const TestTable: React.FC<TestTableProps> = ({
  tests,
  isLoading,
  onEditTest,
  onViewDetails,
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
    if (onViewDetails) {
      onViewDetails(test);
    } else {
      // Default behavior - show test details in an alert or modal
      alert(`Test Details:
Student: ${getStudentName ? getStudentName(test.student_id) : test.student_id}
Date: ${format(new Date(test.date), 'dd/MM/yyyy')}
Class: ${test.class_name || '-'}
Level: ${test.tilawati_level}
Munaqisy: ${test.munaqisy}
Status: ${test.status}
Notes: ${test.notes || 'No notes'}`);
    }
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Tanggal</TableHead>
                {showStudentName && (
                  <TableHead className="whitespace-nowrap">Nama Siswa</TableHead>
                )}
                <TableHead className="whitespace-nowrap">Kelas</TableHead>
                <TableHead className="whitespace-nowrap">Level Tilawati</TableHead>
                <TableHead className="whitespace-nowrap">Munaqisy</TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
                <TableHead className="whitespace-nowrap">Catatan</TableHead>
                <TableHead className="text-right whitespace-nowrap">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={showStudentName ? 8 : 7} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : tests?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={showStudentName ? 8 : 7} className="text-center">
                    Tidak ada data tes yang ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                tests?.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(test.date), 'dd/MM/yyyy')}
                    </TableCell>
                    {showStudentName && (
                      <TableCell className="whitespace-nowrap">
                        {getStudentName ? getStudentName(test.student_id) : test.student_id}
                      </TableCell>
                    )}
                    <TableCell>{test.class_name || '-'}</TableCell>
                    <TableCell>{test.tilawati_level}</TableCell>
                    <TableCell>{test.munaqisy}</TableCell>
                    <TableCell>{getStatusBadge(test.status)}</TableCell>
                    <TableCell className="max-w-xs truncate">{test.notes || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(test)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {onEditTest && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditTest(test)}
                          >
                            Edit
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestTable;

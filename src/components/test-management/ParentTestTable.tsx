import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { TilawatiTest } from '@/types/tilawati';

interface ParentTestTableProps {
  tests: TilawatiTest[];
  isLoading: boolean;
  onViewDetails: (test: TilawatiTest) => void;
  showStudentName?: boolean;
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'passed':
      return 'bg-green-100 text-green-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    case 'scheduled':
      return 'bg-blue-100 text-blue-800';
    case 'pending_retake':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const ParentTestTable: React.FC<ParentTestTableProps> = ({
  tests,
  isLoading,
  onViewDetails,
  showStudentName = false,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 bg-white rounded-lg shadow-sm">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (tests.length === 0) {
    return (
      <div className="text-center py-8 px-4">
        <p className="text-gray-500">Belum ada data tes yang tersedia.</p>
      </div>
    );
  }

  // Mobile view - card layout
  const MobileView = () => (
    <div className="space-y-4 md:hidden">
      {tests.map((test) => (
        <div key={test.id} className="bg-white p-4 rounded-lg shadow-sm space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">{test.class_name}</p>
              <p className="text-sm text-gray-500">{test.tilawati_level}</p>
            </div>
            <Badge className={getStatusColor(test.status)}>
              {test.status.charAt(0).toUpperCase() + test.status.slice(1).replace('_', ' ')}
            </Badge>
          </div>
          <div className="text-sm">
            <p>Tanggal: {new Date(test.date).toLocaleDateString('id-ID')}</p>
            <p>Penguji: {test.munaqisy}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onViewDetails(test)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Lihat Detail
          </Button>
        </div>
      ))}
    </div>
  );

  // Desktop view - table layout
  const DesktopView = () => (
    <div className="hidden md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kelas</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead>Penguji</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tests.map((test) => (
            <TableRow key={test.id}>
              <TableCell className="font-medium">{test.class_name}</TableCell>
              <TableCell>{test.tilawati_level}</TableCell>
              <TableCell>{new Date(test.date).toLocaleDateString('id-ID')}</TableCell>
              <TableCell>{test.munaqisy}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(test.status)}>
                  {test.status.charAt(0).toUpperCase() + test.status.slice(1).replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(test)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Detail
                </Button>
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
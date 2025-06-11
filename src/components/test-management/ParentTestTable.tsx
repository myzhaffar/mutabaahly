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
        <p className="text-gray-500">No test data available.</p>
      </div>
    );
  }

  // Mobile view - card layout
  const MobileView = () => (
    <div className="space-y-4 md:hidden">
      {tests.map((test) => (
        <div key={test.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          {/* Header Section */}
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-1">
              {showStudentName && (
                <h3 className="text-lg font-semibold text-gray-900">
                  {test.student?.name || 'Unknown Student'}
                </h3>
              )}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">{test.class_name}</span>
                <span className="text-gray-400">•</span>
                <span className="text-sm font-medium text-gray-700">{test.tilawati_level}</span>
              </div>
            </div>
            <Badge className={`${getStatusColor(test.status)} ml-2`}>
              {test.status.charAt(0).toUpperCase() + test.status.slice(1).replace('_', ' ')}
            </Badge>
          </div>

          {/* Info Section */}
          <div className="space-y-3 mb-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Test Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(test.date).toLocaleDateString('en-US')}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Examiner</p>
                <p className="text-sm font-medium text-gray-900">{test.munaqisy}</p>
              </div>
            </div>

            {/* Notes Section */}
            {test.notes && (
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Notes</p>
                <p className="text-sm text-gray-700">{test.notes}</p>
              </div>
            )}
          </div>

          {/* Action Button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full bg-gray-50 hover:bg-gray-100 transition-colors"
            onClick={() => onViewDetails(test)}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
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
            {showStudentName && <TableHead>Student Name</TableHead>}
            <TableHead>Class</TableHead>
            <TableHead>Level</TableHead>
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
                <TableCell className="font-medium">{test.student?.name || 'Unknown Student'}</TableCell>
              )}
              <TableCell>{test.class_name}</TableCell>
              <TableCell>{test.tilawati_level}</TableCell>
              <TableCell>{new Date(test.date).toLocaleDateString('en-US')}</TableCell>
              <TableCell>{test.munaqisy}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(test.status)}>
                  {test.status.charAt(0).toUpperCase() + test.status.slice(1).replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell className="max-w-[200px]">
                <p className="truncate" title={test.notes || '-'}>
                  {test.notes || '-'}
                </p>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(test)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
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
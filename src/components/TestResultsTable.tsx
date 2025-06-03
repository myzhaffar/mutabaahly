"use client";

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  HoverDropdownMenu,
  HoverDropdownMenuContent,
  HoverDropdownMenuTrigger,
} from "@/components/ui/hover-dropdown-menu";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit3, Trash2, Eye } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { TilawatiTest } from "@/types/tilawati";

interface TestResultsTableProps {
  tests: TilawatiTest[];
  onEditTest: (test: TilawatiTest) => void;
  onDeleteTest: (testId: string) => void;
  onViewTestDetails?: (test: TilawatiTest) => void;
}

const getStatusBadgeVariant = (status: TilawatiTest['status']) => {
  switch (status) {
    case 'passed': return 'bg-green-100 text-green-800';
    case 'failed': return 'bg-red-100 text-red-800';
    case 'scheduled': return 'bg-blue-100 text-blue-800';
    case 'pending_retake': return 'bg-yellow-100 text-yellow-800';
    case 'cancelled': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const TestResultsTable: React.FC<TestResultsTableProps> = ({
  tests,
  onEditTest,
  onDeleteTest,
  onViewTestDetails,
}) => {
  if (!tests || tests.length === 0) {
    return <p className="text-center text-gray-500 py-8">No test data has been scheduled or recorded yet.</p>;
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch (e) {
      console.warn("Invalid date string for formatting:", dateString);
      return dateString; 
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 hover:bg-gray-100/50 border-b border-gray-200">
            <TableHead className="w-[200px] px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Student</TableHead>
            <TableHead className="px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Class</TableHead>
            <TableHead className="px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Tilawati Level</TableHead>
            <TableHead className="px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Test Date</TableHead>
            <TableHead className="px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Examiner</TableHead>
            <TableHead className="px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</TableHead>
            <TableHead className="text-center px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Notes</TableHead>
            <TableHead className="text-right px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-200">
          {tests.map((test) => (
            <TableRow key={test.id} className="hover:bg-gray-50/50 transition-colors duration-150">
              <TableCell className="font-medium px-4 py-3 text-sm text-gray-800 whitespace-nowrap">
                {test.student?.name || test.student_id} 
              </TableCell>
              <TableCell className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{test.class_name || '-'}</TableCell>
              <TableCell className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{test.tilawati_level}</TableCell>
              <TableCell className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{formatDate(test.date)}</TableCell>
              <TableCell className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{test.munaqisy || '-'}</TableCell>
              <TableCell className="px-4 py-3 text-sm whitespace-nowrap">
                <Badge className={`${getStatusBadgeVariant(test.status)} capitalize text-xs font-medium px-2 py-0.5 rounded-full`}>
                  {test.status.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell className="text-center px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{test.notes || '-'}</TableCell>
              <TableCell className="text-right px-4 py-3">
                <HoverDropdownMenu>
                  <HoverDropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </HoverDropdownMenuTrigger>
                  <HoverDropdownMenuContent align="end" className="bg-white shadow-lg rounded-md border border-gray-200 w-40">
                    {onViewTestDetails && (
                      <DropdownMenuItem onClick={() => onViewTestDetails(test)} className="flex items-center text-sm text-gray-700 hover:bg-gray-100 p-2 cursor-pointer">
                        <Eye className="mr-2 h-4 w-4 text-gray-500" />
                        <span>View Details</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onEditTest(test)} className="flex items-center text-sm text-gray-700 hover:bg-gray-100 p-2 cursor-pointer">
                      <Edit3 className="mr-2 h-4 w-4 text-blue-600" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDeleteTest(test.id)} className="flex items-center text-sm text-red-600 hover:bg-red-50 hover:text-red-700 focus:text-red-700 p-2 cursor-pointer">
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </HoverDropdownMenuContent>
                </HoverDropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TestResultsTable;

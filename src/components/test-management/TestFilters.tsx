import React from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TestStatus, TilawatiJilid } from '@/types/tilawati';

const JILID_OPTIONS: TilawatiJilid[] = [
  "Jilid 1", "Jilid 2", "Jilid 3", "Jilid 4", "Jilid 5", "Jilid 6",
  "Ghorib", "Tajwid", "Al-Quran", "Evaluasi"
];

const STATUS_OPTIONS: TestStatus[] = [
  'scheduled', 'passed', 'failed', 'pending_retake', 'cancelled'
];

interface TestFiltersProps {
  searchTerm?: string;
  status?: TestStatus | 'all';
  jilidLevel?: TilawatiJilid | 'all';
  date?: string;
  onFilterChange: (key: string, value: string | undefined) => void;
  showDateFilter?: boolean;
}

const TestFilters: React.FC<TestFiltersProps> = ({
  searchTerm,
  status,
  jilidLevel,
  date,
  onFilterChange,
  showDateFilter = false
}) => {
  return (
    <div className="space-y-4 bg-white p-4 rounded-lg shadow-sm">
      <div className="w-full">
        <Input
          placeholder="Search by class name..."
          value={searchTerm || ''}
          onChange={(e) => onFilterChange('searchTerm', e.target.value)}
          className="w-full"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Select
          value={status || undefined}
          onValueChange={(value) => onFilterChange('status', value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {STATUS_OPTIONS.map((status) => (
              <SelectItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={jilidLevel || undefined}
          onValueChange={(value) => onFilterChange('jilidLevel', value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {JILID_OPTIONS.map((jilid) => (
              <SelectItem key={jilid} value={jilid}>{jilid}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {showDateFilter && (
          <Input
            type="date"
            value={date || ''}
            onChange={(e) => onFilterChange('date', e.target.value)}
            placeholder="Filter by Date"
            className="w-full"
          />
        )}
      </div>
    </div>
  );
};

export default TestFilters;

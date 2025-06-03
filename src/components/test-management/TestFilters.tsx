import React from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import type { TestStatus, TilawatiJilid } from '@/types/tilawati';

const JILID_OPTIONS: TilawatiJilid[] = [
  "Jilid 1", "Jilid 2", "Jilid 3", "Jilid 4", "Jilid 5", "Jilid 6",
  "Ghorib", "Tajwid", "Al-Quran", "Evaluasi"
];

const STATUS_OPTIONS: TestStatus[] = [
  'scheduled', 'passed', 'failed', 'pending_retake', 'cancelled'
];

interface DateRange {
  startDate?: Date;
  endDate?: Date;
}

interface TestFiltersProps {
  searchTerm?: string;
  status?: TestStatus | 'all';
  jilidLevel?: TilawatiJilid | 'all';
  startDate?: Date;
  endDate?: Date;
  onFilterChange: (key: string, value: string | undefined | DateRange) => void;
  showDateFilter?: boolean;
  showAdvancedFilters?: boolean;
}

const TestFilters: React.FC<TestFiltersProps> = ({
  searchTerm,
  status,
  jilidLevel,
  startDate,
  endDate,
  onFilterChange,
  showDateFilter = false,
  showAdvancedFilters = true
}) => {
  const formatDateRange = () => {
    if (!startDate && !endDate) return 'Pilih tanggal';
    if (startDate && !endDate) return format(startDate, 'dd MMM yyyy', { locale: id });
    if (!startDate && endDate) return `Sampai ${format(endDate, 'dd MMM yyyy', { locale: id })}`;
    return `${format(startDate, 'dd MMM yyyy', { locale: id })} - ${format(endDate, 'dd MMM yyyy', { locale: id })}`;
  };

  return (
    <div className="space-y-4">
      {/* Always visible filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          placeholder="Cari berdasarkan nama kelas..."
          value={searchTerm || ''}
          onChange={(e) => onFilterChange('searchTerm', e.target.value)}
          className="w-full"
        />
        {showDateFilter && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formatDateRange()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={{
                  from: startDate,
                  to: endDate,
                }}
                onSelect={(range) => {
                  onFilterChange('dateRange', {
                    startDate: range?.from,
                    endDate: range?.to,
                  });
                }}
                numberOfMonths={2}
                locale={id}
              />
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Advanced filters that can be hidden */}
      {showAdvancedFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            value={status || undefined}
            onValueChange={(value) => onFilterChange('status', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
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
              <SelectItem value="all">Semua Level</SelectItem>
              {JILID_OPTIONS.map((jilid) => (
                <SelectItem key={jilid} value={jilid}>{jilid}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default TestFilters;

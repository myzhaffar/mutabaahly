import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TilawatiJilid, TestStatus } from '@/types/tilawati';
import { cn } from '@/lib/utils';

interface TestFiltersProps {
  searchTerm?: string;
  status?: TestStatus | 'all';
  jilidLevel?: TilawatiJilid | 'all';
  date?: string;
  onFilterChange: (key: string, value: string | undefined) => void;
  showDateFilter?: boolean;
}

const TestFilters: React.FC<TestFiltersProps> = ({
  searchTerm = '',
  status,
  jilidLevel,
  date,
  onFilterChange,
  showDateFilter = false,
}) => {
  const clearFilters = () => {
    onFilterChange('searchTerm', '');
    onFilterChange('status', undefined);
    onFilterChange('jilidLevel', undefined);
    if (showDateFilter) {
      onFilterChange('date', undefined);
    }
  };

  const hasActiveFilters = status || jilidLevel || date;
  const activeFiltersCount = [status, jilidLevel, date].filter(Boolean).length;

  return (
    <div className="space-y-4 bg-white p-4 rounded-lg border">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
      <Input
            placeholder="Search students by name..."
            value={searchTerm}
        onChange={(e) => onFilterChange('searchTerm', e.target.value)}
            className="pl-9 pr-4 w-full"
      />
        </div>

        {/* Status Filter */}
        <div className="w-full sm:w-48">
      <Select
            value={status || 'all'} 
            onValueChange={(value) => onFilterChange('status', value === 'all' ? undefined : value)}
      >
        <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="scheduled">Scheduled</SelectItem>
          <SelectItem value="passed">Passed</SelectItem>
          <SelectItem value="failed">Failed</SelectItem>
        </SelectContent>
      </Select>
        </div>

        {/* Level Filter */}
        <div className="w-full sm:w-48">
      <Select
            value={jilidLevel || 'all'} 
            onValueChange={(value) => onFilterChange('jilidLevel', value === 'all' ? undefined : value)}
      >
        <SelectTrigger>
              <SelectValue placeholder="Filter by level" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Levels</SelectItem>
          <SelectItem value="Level 1">Level 1</SelectItem>
          <SelectItem value="Level 2">Level 2</SelectItem>
          <SelectItem value="Level 3">Level 3</SelectItem>
          <SelectItem value="Level 4">Level 4</SelectItem>
          <SelectItem value="Level 5">Level 5</SelectItem>
          <SelectItem value="Level 6">Level 6</SelectItem>
        </SelectContent>
      </Select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="w-full sm:w-auto"
          >
            Clear Filters
            {activeFiltersCount > 0 && (
              <Badge 
                variant="secondary" 
                className="ml-2 bg-gray-100"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">Active filters:</span>
          {status && (
            <Badge 
              variant="secondary" 
              className="flex items-center gap-1 bg-gray-100"
            >
              Status: {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
            </Badge>
          )}
          {jilidLevel && (
            <Badge 
              variant="secondary" 
              className="flex items-center gap-1 bg-gray-100"
            >
              Level: {jilidLevel === 'all' ? 'All' : jilidLevel}
            </Badge>
          )}
          {date && (
            <Badge 
              variant="secondary" 
              className="flex items-center gap-1 bg-gray-100"
            >
              Date: {new Date(date).toLocaleDateString()}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default TestFilters;

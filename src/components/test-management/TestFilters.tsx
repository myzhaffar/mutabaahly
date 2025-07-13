import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { TilawatiJilid, TestStatus } from '@/types/tilawati';

export type StatusOption = TestStatus | 'scheduled' | 'passed' | 'failed';
export type JilidOption = TilawatiJilid | 'Level 1' | 'Level 2' | 'Level 3' | 'Level 4' | 'Level 5' | 'Level 6';

interface TestFiltersProps {
  searchTerm?: string;
  status?: StatusOption[];
  jilidLevel?: JilidOption[];
  date?: string;
  onFilterChange: (key: string, value: string[] | string | undefined) => void;
  showDateFilter?: boolean;
}

const STATUS_OPTIONS: { value: StatusOption; label: string }[] = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'passed', label: 'Passed' },
  { value: 'failed', label: 'Failed' },
];
const JILID_OPTIONS: { value: JilidOption; label: string }[] = [
  { value: 'Level 1', label: 'Level 1' },
  { value: 'Level 2', label: 'Level 2' },
  { value: 'Level 3', label: 'Level 3' },
  { value: 'Level 4', label: 'Level 4' },
  { value: 'Level 5', label: 'Level 5' },
  { value: 'Level 6', label: 'Level 6' },
];

const TestFilters: React.FC<TestFiltersProps> = ({
  searchTerm = '',
  status = [],
  jilidLevel = [],
  date,
  onFilterChange,
  showDateFilter = false,
}) => {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const clearFilters = () => {
    onFilterChange('searchTerm', '');
    onFilterChange('status', []);
    onFilterChange('jilidLevel', []);
    if (showDateFilter) {
      onFilterChange('date', undefined);
    }
  };

  const hasActiveFilters = (status && status.length > 0) || (jilidLevel && jilidLevel.length > 0) || date;

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 mb-6 px-0 sm:px-0">
      <div className="p-4">
        {/* Search Bar at the top of the card */}
        <div className="relative w-full mb-4">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-blue-400" />
          <Input
            placeholder="Search students by name..."
            value={searchTerm}
            onChange={(e) => onFilterChange('searchTerm', e.target.value)}
            className="pl-9 pr-4 w-full bg-blue-50 border border-blue-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-base py-2 shadow-sm"
          />
        </div>
        {/* Filter Toggle and Badges */}
        <button
          className="w-full flex items-center gap-3 px-0 py-3 border-b border-gray-100 hover:bg-gray-50 focus:outline-none"
          onClick={() => setFiltersOpen((open) => !open)}
          aria-expanded={filtersOpen}
        >
          <div className="p-2 bg-gray-100 rounded-lg">
            <Filter className="h-4 w-4 text-gray-600" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-semibold text-gray-900 text-base sm:text-lg">Filters</h3>
            <p className="text-xs sm:text-sm text-gray-500">Refine your search results</p>
            {/* Show selected filter badges under description, even when collapsed */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 flex-wrap mt-2">
                {status.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1 bg-blue-50 text-blue-700 text-xs sm:text-sm rounded-full border border-blue-200">
                    Status: {status.map(s => STATUS_OPTIONS.find(opt => opt.value === s)?.label || s).join(', ')}
                  </span>
                )}
                {jilidLevel.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1 bg-blue-50 text-blue-700 text-xs sm:text-sm rounded-full border border-blue-200">
                    Level: {jilidLevel.map(j => JILID_OPTIONS.find(opt => opt.value === j)?.label || j).join(', ')}
                  </span>
                )}
                <button
                  type="button"
                  onClick={clearFilters}
                  className="ml-2 text-xs text-gray-500 hover:text-red-600 underline"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
          <span className="ml-auto text-xs text-gray-500">{filtersOpen ? 'Hide' : 'Show'}</span>
        </button>
      </div>
      {filtersOpen && (
        <div className="p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
            {/* Status Multi-Select */}
            <div className="space-y-2 sm:space-y-3">
              <label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Status
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {STATUS_OPTIONS.map(opt => (
                  <div key={opt.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-filter-${opt.value}`}
                      checked={status.includes(opt.value)}
                      onCheckedChange={() => {
                        const newStatus = status.includes(opt.value)
                          ? status.filter(s => s !== opt.value)
                          : [...status, opt.value];
                        onFilterChange('status', newStatus);
                      }}
                      className="rounded-full"
                    />
                    <label htmlFor={`status-filter-${opt.value}`} className="text-sm text-gray-700 cursor-pointer">
                      {opt.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            {/* Jilid Multi-Select */}
            <div className="space-y-2 sm:space-y-3">
              <label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Level
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {JILID_OPTIONS.map(opt => (
                  <div key={opt.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`jilid-filter-${opt.value}`}
                      checked={jilidLevel.includes(opt.value)}
                      onCheckedChange={() => {
                        const newJilid = jilidLevel.includes(opt.value)
                          ? jilidLevel.filter(j => j !== opt.value)
                          : [...jilidLevel, opt.value];
                        onFilterChange('jilidLevel', newJilid);
                      }}
                      className="rounded-full"
                    />
                    <label htmlFor={`jilid-filter-${opt.value}`} className="text-sm text-gray-700 cursor-pointer">
                      {opt.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestFilters;

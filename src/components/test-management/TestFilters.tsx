import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { Filter, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface StatusOption {
  value: string;
  label: string;
}

export interface JilidOption {
  value: string;
  label: string;
}

const STATUS_OPTIONS: StatusOption[] = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'passed', label: 'Passed' },
  { value: 'failed', label: 'Failed' },
  { value: 'pending_retake', label: 'Pending Retake' },
  { value: 'cancelled', label: 'Cancelled' }
];

const JILID_OPTIONS: JilidOption[] = [
  { value: 'Jilid 1', label: 'Jilid 1' },
  { value: 'Jilid 2', label: 'Jilid 2' },
  { value: 'Jilid 3', label: 'Jilid 3' },
  { value: 'Jilid 4', label: 'Jilid 4' },
  { value: 'Jilid 5', label: 'Jilid 5' },
  { value: 'Jilid 6', label: 'Jilid 6' }
];

interface TestFiltersProps {
  searchTerm?: string;
  status: string[];
  jilidLevel: string[];
  onFilterChange: (key: string, value: string[] | string | undefined) => void;
}

const TestFilters: React.FC<TestFiltersProps> = ({
  status,
  jilidLevel,
  onFilterChange
}) => {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { t } = useTranslation();

  const hasActiveFilters = status.length > 0 || jilidLevel.length > 0;

  const clearFilters = () => {
    onFilterChange('status', []);
    onFilterChange('jilidLevel', []);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <button
          type="button"
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Filter className="h-4 w-4 text-gray-600" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-gray-900 text-base sm:text-lg">{t('filters.title')}</h3>
              <p className="text-xs sm:text-sm text-gray-500">{t('filters.description')}</p>
              {/* Show selected filter badges under description, even when collapsed */}
              {hasActiveFilters && (
                <div className="flex items-center gap-2 flex-wrap mt-2">
                  {status.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1 bg-blue-50 text-blue-700 text-xs sm:text-sm rounded-full border border-blue-200">
                      {t('filters.status')}: {status.map(s => STATUS_OPTIONS.find(opt => opt.value === s)?.label || s).join(', ')}
                    </span>
                  )}
                  {jilidLevel.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1 bg-blue-50 text-blue-700 text-xs sm:text-sm rounded-full border border-blue-200">
                      {t('filters.level')}: {jilidLevel.map(j => JILID_OPTIONS.find(opt => opt.value === j)?.label || j).join(', ')}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="ml-2 text-xs text-gray-500 hover:text-red-600 underline"
                  >
                    {t('filters.clearFilters')}
                  </button>
                </div>
              )}
            </div>
            <span className="ml-auto text-xs text-gray-500">{filtersOpen ? t('filters.hide') : t('filters.show')}</span>
          </div>
        </button>
      </CardHeader>

      {filtersOpen && (
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('filters.status')}</label>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      const newStatus = status.includes(option.value)
                        ? status.filter(s => s !== option.value)
                        : [...status, option.value];
                      onFilterChange('status', newStatus);
                    }}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      status.includes(option.value)
                        ? 'bg-blue-100 text-blue-700 border-blue-300'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Level Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('filters.level')}</label>
              <div className="flex flex-wrap gap-2">
                {JILID_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      const newLevel = jilidLevel.includes(option.value)
                        ? jilidLevel.filter(l => l !== option.value)
                        : [...jilidLevel, option.value];
                      onFilterChange('jilidLevel', newLevel);
                    }}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      jilidLevel.includes(option.value)
                        ? 'bg-green-100 text-green-700 border-green-300'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  {t('filters.clearFilters')}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default TestFilters;

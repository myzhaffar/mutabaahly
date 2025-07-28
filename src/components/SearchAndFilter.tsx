import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FilterState {
  classes: string[];
  teachers: string[];
}

interface SearchAndFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  currentFilters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  availableClasses: string[];
  availableTeachers: string[];
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchTerm,
  onSearchChange,
  currentFilters,
  onFilterChange,
  availableClasses,
  availableTeachers
}) => {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { t } = useTranslation();

  const addFilter = (type: 'classes' | 'teachers', value: string) => {
    const newFilters = {
      ...currentFilters,
      [type]: [...currentFilters[type], value]
    };
    onFilterChange(newFilters);
  };

  const removeFilter = (type: 'classes' | 'teachers', value: string) => {
    const newFilters = {
      ...currentFilters,
      [type]: currentFilters[type].filter(item => item !== value)
    };
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    onFilterChange({ classes: [], teachers: [] });
  };

  const getActiveFiltersCount = () => {
    return currentFilters.classes.length + currentFilters.teachers.length;
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Input
          type="text"
          placeholder={t('filters.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          <Filter className="h-4 w-4" />
          {t('filters.title')}
          {getActiveFiltersCount() > 0 && (
            <Badge variant="secondary" className="ml-1">
              {getActiveFiltersCount()}
            </Badge>
          )}
        </button>
        
        {getActiveFiltersCount() > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            {t('filters.clearFilters')}
          </Button>
        )}
      </div>

      {/* Filter Options */}
      {filtersOpen && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          {/* Class Filter */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">{t('filters.class')}</h4>
            <div className="flex flex-wrap gap-2">
              {availableClasses.map((className) => (
                <button
                  key={className}
                  type="button"
                  onClick={() => addFilter('classes', className)}
                  disabled={currentFilters.classes.includes(className)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    currentFilters.classes.includes(className)
                      ? 'bg-blue-100 text-blue-700 border-blue-300 cursor-not-allowed'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {className}
                </button>
              ))}
            </div>
          </div>

          {/* Teacher Filter */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">{t('filters.teacher')}</h4>
            <div className="flex flex-wrap gap-2">
              {availableTeachers.map((teacher) => (
                <button
                  key={teacher}
                  type="button"
                  onClick={() => addFilter('teachers', teacher)}
                  disabled={currentFilters.teachers.includes(teacher)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    currentFilters.teachers.includes(teacher)
                      ? 'bg-purple-100 text-purple-700 border-purple-300 cursor-not-allowed'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {teacher}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Filters */}
      {getActiveFiltersCount() > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600">{t('filters.activeFilters')}:</span>
          
          {currentFilters.classes.map((className) => (
            <Badge 
              key={`class-${className}`} 
              variant="secondary" 
              className="bg-green-100 text-green-800 hover:bg-green-200"
            >
              {t('filters.class')}: {className}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1 hover:bg-transparent"
                onClick={() => removeFilter('classes', className)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          
          {currentFilters.teachers.map((teacher) => (
            <Badge 
              key={`teacher-${teacher}`} 
              variant="secondary" 
              className="bg-purple-100 text-purple-800 hover:bg-purple-200"
            >
              {t('filters.teacher')}: {teacher}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1 hover:bg-transparent"
                onClick={() => removeFilter('teachers', teacher)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchAndFilter;

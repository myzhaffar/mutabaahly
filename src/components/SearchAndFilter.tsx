import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Search, Filter, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FIXED_TEACHERS } from '@/utils/rankingDataService';

interface SearchAndFilterProps {
  onSearchChange: (search: string) => void;
  onFiltersChange: (filters: FilterState) => void;
  availableClasses: string[];
  availableTeachers: string[];
  currentFilters: FilterState;
}

interface FilterState {
  classes: string[];
  teachers: string[];
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  onSearchChange,
  onFiltersChange,
  availableClasses,
  availableTeachers,
  currentFilters
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearchChange(value);
  };

  const handleFilterChange = (type: 'classes' | 'teachers', value: string, checked: boolean) => {
    const newFilters = { ...currentFilters };
    
    if (checked) {
      newFilters[type] = [...newFilters[type], value];
    } else {
      newFilters[type] = newFilters[type].filter(item => item !== value);
    }
    
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({ classes: [], teachers: [] });
    setSearchValue('');
    onSearchChange('');
  };

  const getActiveFiltersCount = () => {
    return currentFilters.classes.length + currentFilters.teachers.length;
  };

  const removeFilter = (type: 'classes' | 'teachers', value: string) => {
    const newFilters = { ...currentFilters };
    newFilters[type] = newFilters[type].filter(item => item !== value);
    onFiltersChange(newFilters);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Search Box */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search students by name..."
            value={searchValue}
            onChange={handleSearchChange}
            className="pl-10 bg-white border-gray-300 focus:border-islamic-500 focus:ring-islamic-500"
          />
        </div>

        {/* Filter Button */}
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="relative bg-white border-gray-300 hover:bg-gray-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {getActiveFiltersCount() > 0 && (
                <Badge 
                  variant="secondary" 
                  className="ml-2 h-5 w-5 p-0 flex items-center justify-center bg-islamic-500 text-white text-xs"
                >
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-white border shadow-lg" align="start">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Filter Students</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Clear All
                </Button>
              </div>

              {/* Class Filters */}
              {availableClasses.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Class</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {availableClasses.map((className) => (
                      <div key={className} className="flex items-center space-x-2">
                        <Checkbox
                          id={`class-${className}`}
                          checked={currentFilters.classes.includes(className)}
                          onCheckedChange={(checked) => 
                            handleFilterChange('classes', className, checked as boolean)
                          }
                          className="rounded-full"
                        />
                        <Label 
                          htmlFor={`class-${className}`}
                          className="text-sm text-gray-600 cursor-pointer"
                        >
                          {className}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Teacher Filters */}
              {availableTeachers.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Teacher</Label>
                  <div className="flex gap-4">
                    {/* Female Teachers */}
                    <div className="flex-1 space-y-2 max-h-32 overflow-y-auto">
                      <div className="font-semibold text-emerald-700 mb-1">Female</div>
                      {FIXED_TEACHERS.filter(t => t.name.startsWith('Ustz.')).map((teacher) => (
                        <div key={teacher.name} className="flex items-center space-x-2">
                          <Checkbox
                            id={`teacher-${teacher.name}`}
                            checked={currentFilters.teachers.includes(teacher.name)}
                            onCheckedChange={(checked) => 
                              handleFilterChange('teachers', teacher.name, checked as boolean)
                            }
                            className="rounded-full"
                          />
                          <Label 
                            htmlFor={`teacher-${teacher.name}`}
                            className="text-sm text-gray-600 cursor-pointer"
                          >
                            {teacher.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {/* Male Teachers */}
                    <div className="flex-1 space-y-2 max-h-32 overflow-y-auto">
                      <div className="font-semibold text-teal-700 mb-1">Male</div>
                      {FIXED_TEACHERS.filter(t => t.name.startsWith('Ust.')).map((teacher) => (
                        <div key={teacher.name} className="flex items-center space-x-2">
                          <Checkbox
                            id={`teacher-${teacher.name}`}
                            checked={currentFilters.teachers.includes(teacher.name)}
                            onCheckedChange={(checked) => 
                              handleFilterChange('teachers', teacher.name, checked as boolean)
                            }
                            className="rounded-full"
                          />
                          <Label 
                            htmlFor={`teacher-${teacher.name}`}
                            className="text-sm text-gray-600 cursor-pointer"
                          >
                            {teacher.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Display */}
      {getActiveFiltersCount() > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600">Active filters:</span>
          
          {currentFilters.classes.map((className) => (
            <Badge 
              key={`class-${className}`} 
              variant="secondary" 
              className="bg-green-100 text-green-800 hover:bg-green-200"
            >
              Class: {className}
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
              Teacher: {teacher}
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

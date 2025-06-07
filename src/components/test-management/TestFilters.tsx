import React, { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X } from "lucide-react";
import { TilawatiJilid } from '@/types/tilawati';
import { cn } from '@/lib/utils';

interface TestFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedStatus: string | null;
  onStatusChange: (value: string | null) => void;
  selectedLevel: TilawatiJilid | null;
  onLevelChange: (value: TilawatiJilid | null) => void;
  showLevelFilter?: boolean;
}

const TestFilters: React.FC<TestFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedLevel,
  onLevelChange,
  showLevelFilter = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const clearFilters = () => {
    onSearchChange('');
    onStatusChange(null);
    if (showLevelFilter) {
      onLevelChange(null);
    }
  };

  const hasActiveFilters = selectedStatus || selectedLevel;
  const activeFiltersCount = (selectedStatus ? 1 : 0) + (selectedLevel ? 1 : 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search students by name..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-4 w-full"
          />
        </div>

        {/* Filter Button */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className={cn(
                "flex items-center gap-2",
                hasActiveFilters && "border-primary text-primary"
              )}
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge 
                  variant="secondary" 
                  className="ml-1 bg-primary text-white h-5 w-5 flex items-center justify-center rounded-full p-0"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Filter Tests</h3>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-auto px-2 py-1 text-sm text-gray-500 hover:text-gray-900"
                  >
                    Clear all
                  </Button>
                )}
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <div className="flex flex-wrap gap-2">
                  {["scheduled", "passed", "failed"].map((status) => (
                    <Button
                      key={status}
                      variant="outline"
                      size="sm"
                      className={cn(
                        "h-auto px-3 py-1.5",
                        selectedStatus === status && "bg-primary text-white hover:bg-primary/90"
                      )}
                      onClick={() => onStatusChange(selectedStatus === status ? null : status)}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Level Filter */}
              {showLevelFilter && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Level</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Jilid 1", "Jilid 2", "Jilid 3", "Jilid 4",
                      "Jilid 5", "Jilid 6", "Al-Quran", "Munaqosah"
                    ].map((level) => (
                      <Button
                        key={level}
                        variant="outline"
                        size="sm"
                        className={cn(
                          "h-auto px-3 py-1.5",
                          selectedLevel === level && "bg-primary text-white hover:bg-primary/90"
                        )}
                        onClick={() => onLevelChange(selectedLevel === level ? null : level as TilawatiJilid)}
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">Active filters:</span>
          {selectedStatus && (
            <Badge 
              variant="secondary" 
              className="flex items-center gap-1 bg-gray-100"
            >
              Status: {selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onStatusChange(null)}
                className="h-auto p-0 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {selectedLevel && (
            <Badge 
              variant="secondary" 
              className="flex items-center gap-1 bg-gray-100"
            >
              Level: {selectedLevel}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLevelChange(null)}
                className="h-auto p-0 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default TestFilters;

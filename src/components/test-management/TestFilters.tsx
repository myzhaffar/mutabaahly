import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Filter } from 'lucide-react';

const TestFilters: React.FC = () => {
  const [filtersOpen, setFiltersOpen] = useState(false);

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
              <h3 className="font-semibold text-gray-900 text-base sm:text-lg">Filters</h3>
              <p className="text-xs sm:text-sm text-gray-500">Refine your search results</p>
            </div>
            <span className="ml-auto text-xs text-gray-500">{filtersOpen ? 'Hide' : 'Show'}</span>
          </div>
        </button>
      </CardHeader>

      {filtersOpen && (
        <CardContent className="pt-0">
          <div className="space-y-4">
            <p className="text-sm text-gray-500 text-center py-4">
              Use the tabs above to filter by status and level.
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default TestFilters;
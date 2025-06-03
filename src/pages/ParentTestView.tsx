import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import ParentLayout from '@/components/layouts/ParentLayout';
import TestStatsCards from '@/components/test-management/TestStatsCards';
import TestFilters from '@/components/test-management/TestFilters';
import ParentTestTable from '@/components/test-management/ParentTestTable';
import { fetchTestsWithFilters } from '@/utils/testQueries';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TestStatus, TilawatiJilid, TilawatiTest } from '@/types/tilawati';

interface TestFilters {
  status?: TestStatus | 'all';
  searchTerm?: string;
  jilidLevel?: TilawatiJilid | 'all';
}

const ParentTestView: React.FC = () => {
  const { profile } = useAuth();
  const [filters, setFilters] = useState<TestFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  // Fetch children's tests
  const { data: tests, isLoading } = useQuery({
    queryKey: ['parent-tests', filters],
    queryFn: () => fetchTestsWithFilters(filters),
    enabled: !!profile?.id,
  });

  const handleFilterChange = (key: string, value: string | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value,
    }));
  };

  const handleViewTestDetails = (test: TilawatiTest) => {
    // Show detailed test information
    const message = `Detail Tes Tilawati:

Tanggal: ${new Date(test.date).toLocaleDateString('id-ID')}
Kelas: ${test.class_name || '-'}
Level Tilawati: ${test.tilawati_level}
Penguji (Munaqisy): ${test.munaqisy}
Status: ${test.status.charAt(0).toUpperCase() + test.status.slice(1).replace('_', ' ')}
Catatan: ${test.notes || 'Tidak ada catatan'}`;

    alert(message);
  };

  // Calculate stats
  const stats = React.useMemo(() => {
    if (!tests) return { total: 0, passed: 0, scheduled: 0, failed: 0 };
    
    return {
      total: tests.length,
      passed: tests.filter(t => t.status === 'passed').length,
      scheduled: tests.filter(t => t.status === 'scheduled').length,
      failed: tests.filter(t => t.status === 'failed').length,
    };
  }, [tests]);

  return (
    <ParentLayout>
      <div className="space-y-6 px-4 md:px-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-xl lg:text-2xl font-bold">Tes Kenaikan Level Anak</h1>
          <Button
            variant="outline"
            className="w-full md:w-auto flex items-center gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
            {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <TestStatsCards stats={stats} />
        </div>

        <div className={`transition-all duration-300 ease-in-out ${showFilters ? 'block' : 'hidden md:block'}`}>
          <TestFilters
            searchTerm={filters.searchTerm}
            status={filters.status}
            jilidLevel={filters.jilidLevel}
            onFilterChange={handleFilterChange}
          />
        </div>

        <ParentTestTable
          tests={tests || []}
          isLoading={isLoading}
          onViewDetails={handleViewTestDetails}
          showStudentName={true}
        />
      </div>
    </ParentLayout>
  );
};

export default ParentTestView;

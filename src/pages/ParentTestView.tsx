
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import ParentLayout from '@/components/layouts/ParentLayout';
import TestStatsCards from '@/components/test-management/TestStatsCards';
import TestFilters from '@/components/test-management/TestFilters';
import TestTable from '@/components/test-management/TestTable';
import { fetchTestsWithFilters } from '@/utils/testQueries';
import { useAuth } from '@/contexts/AuthContext';
import type { TestStatus, TilawatiJilid, TilawatiTest } from '@/types/tilawati';

interface TestFilters {
  status?: TestStatus | 'all';
  searchTerm?: string;
  jilidLevel?: TilawatiJilid | 'all';
}

const ParentTestView: React.FC = () => {
  const { profile } = useAuth();
  const [filters, setFilters] = useState<TestFilters>({});

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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl lg:text-2xl font-bold">Tes Kenaikan Level Anak</h1>
        </div>

        <TestStatsCards stats={stats} />

        <TestFilters
          searchTerm={filters.searchTerm}
          status={filters.status}
          jilidLevel={filters.jilidLevel}
          onFilterChange={handleFilterChange}
        />

        <TestTable
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

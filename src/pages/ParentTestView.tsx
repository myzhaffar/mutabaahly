import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import ParentLayout from '@/components/layouts/ParentLayout';
import TestStatsCards from '@/components/test-management/TestStatsCards';
import TestFilters from '@/components/test-management/TestFilters';
import ParentTestTable from '@/components/test-management/ParentTestTable';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TestStatus, TilawatiJilid, TilawatiTest } from '@/types/tilawati';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

interface Filters {
  searchQuery?: string;
  status?: TestStatus | 'all' | null;
  level?: TilawatiJilid | 'all' | null;
}

const ParentTestView: React.FC = () => {
  const { profile } = useAuth();
  const [filters, setFilters] = useState<Filters>({});
  const navigate = useNavigate();

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Tilawati Tests' }
  ];

  // Fetch children's tests
  const { data: tests, isLoading } = useQuery({
    queryKey: ['parent-tests', filters],
    queryFn: async () => {
      let query = supabase
        .from('tilawati_level_tests')
        .select(`
          *,
          student:student_id (
            name
          )
        `)
        .order('date', { ascending: false });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.level) {
        query = query.eq('tilawati_level', filters.level);
      }
      if (filters.searchQuery) {
        query = query.ilike('class_name', `%${filters.searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching tests:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!profile?.id,
  });

  const handleViewTestDetails = (test: TilawatiTest) => {
    // Show detailed test information
    const message = `Tilawati Test Details:
Student: ${test.student?.name || 'Unknown'}
Date: ${new Date(test.date).toLocaleDateString('en-US')}
Class: ${test.class_name}
Level: ${test.tilawati_level}
Examiner: ${test.munaqisy}
Status: ${test.status.charAt(0).toUpperCase() + test.status.slice(1).replace('_', ' ')}
Notes: ${test.notes || 'No notes available'}`;

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
    <ParentLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6 px-4 md:px-6">
        {/* Header Section */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 rounded-full border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            Tes Kenaikan Level Anak
          </h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-sm text-gray-500">Total Tes</h3>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-sm text-gray-500">Lulus</h3>
            <p className="text-2xl font-bold text-green-600">{stats.passed}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-sm text-gray-500">Terjadwal</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-sm text-gray-500">Not Passed</h3>
            <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
          </div>
        </div>

        {/* Filters Section */}
        <TestFilters
          searchTerm={filters.searchQuery}
          status={filters.status}
          jilidLevel={filters.level}
          onFilterChange={(key, value) => {
            setFilters(prev => ({
              ...prev,
              [key === 'searchTerm' ? 'searchQuery' : key === 'jilidLevel' ? 'level' : key]: value
            }));
          }}
        />

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <ParentTestTable
            tests={tests || []}
            isLoading={isLoading}
            onViewDetails={handleViewTestDetails}
            showStudentName={true}
          />
        </div>
      </div>
    </ParentLayout>
  );
};

export default ParentTestView;

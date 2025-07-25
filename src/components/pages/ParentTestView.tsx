'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import ParentLayout from '@/components/layouts/ParentLayout';
import TestFilters from '@/components/test-management/TestFilters';
import ParentTestTable from '@/components/test-management/ParentTestTable';
import { useAuth } from '@/contexts/useAuth';
import { ChevronLeft } from 'lucide-react';
import type { TestStatus, TilawatiJilid, TilawatiTest } from '@/types/tilawati';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface Filters {
  searchQuery?: string;
  status?: TestStatus[];
  level?: TilawatiJilid[];
}

const ParentTestView: React.FC = () => {
  const { profile } = useAuth();
  const [filters, setFilters] = useState<Filters>({});
  const router = useRouter();

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
      if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }
      if (filters.level && filters.level.length > 0) {
        query = query.in('tilawati_level', filters.level);
      }
      if (filters.searchQuery) {
        query = query.ilike('class_name', `%${filters.searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) {
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
      <div className="container mx-auto px-0 py-0 md:px-6 md:py-6 flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex items-center gap-4 mt-2 w-full">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-0 m-0 bg-transparent border-none outline-none flex items-center"
            aria-label="Back"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Tilawati Test
          </h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          <div className="bg-gradient-to-r from-orange-50 to-yellow-100 rounded-lg shadow-sm p-4 text-gray-900 transition duration-200 hover:shadow-lg hover:scale-105 cursor-pointer">
            <h3 className="text-sm text-gray-500">Total Tests</h3>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg shadow-sm p-4 text-gray-900 transition duration-200 hover:shadow-lg hover:scale-105 cursor-pointer">
            <h3 className="text-sm text-gray-500">Passed</h3>
            <p className="text-2xl font-bold text-green-600">{stats.passed}</p>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow-sm p-4 text-gray-900 transition duration-200 hover:shadow-lg hover:scale-105 cursor-pointer">
            <h3 className="text-sm text-gray-500">Scheduled</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
          </div>
          <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg shadow-sm p-4 text-gray-900 transition duration-200 hover:shadow-lg hover:scale-105 cursor-pointer">
            <h3 className="text-sm text-gray-500">Failed</h3>
            <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="w-full">
          <TestFilters
            searchTerm={filters.searchQuery}
            status={filters.status || []}
            jilidLevel={filters.level || []}
            onFilterChange={(key, value) => {
              setFilters(prev => ({
                ...prev,
                [key === 'searchTerm' ? 'searchQuery' : key === 'jilidLevel' ? 'level' : key]: value
              }));
            }}
          />
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden w-full">
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

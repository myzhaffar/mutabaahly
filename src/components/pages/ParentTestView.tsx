'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import ParentLayout from '@/components/layouts/ParentLayout';
import ParentTestTable from '@/components/test-management/ParentTestTable';
import { ChevronLeft } from 'lucide-react';
import type { TilawatiTest, TestStatus, TilawatiJilid } from '@/types/tilawati';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useSwipeBack } from '@/hooks/useSwipeBack';

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'passed', label: 'Passed' },
  { value: 'failed', label: 'Failed' },
];

const LEVEL_TABS = [
  { value: 'all', label: 'All Levels' },
  { value: 'Level 1', label: 'Level 1' },
  { value: 'Level 2', label: 'Level 2' },
  { value: 'Level 3', label: 'Level 3' },
  { value: 'Level 4', label: 'Level 4' },
  { value: 'Level 5', label: 'Level 5' },
  { value: 'Level 6', label: 'Level 6' },
];

const ParentTestView: React.FC = () => {
  const router = useRouter();
  const [filters, setFilters] = useState<{ status: TestStatus[]; jilidLevel: TilawatiJilid[] }>({ 
    status: [], 
    jilidLevel: [] 
  });
  
  // Add swipe back functionality
  useSwipeBack();

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Tilawati Tests' }
  ];

  // Fetch all tests (parents can view all tests)
  const { data: tests, isLoading } = useQuery({
    queryKey: ['parent-tests'],
    queryFn: async () => {
      // Get all tests for all students
      const { data, error } = await supabase
        .from('tilawati_level_tests')
        .select(`
          *,
          student:student_id (
            id,
            name
          )
        `)
        .order('date', { ascending: false });

      if (error) {
        throw error;
      }

      // Convert the data to match TilawatiTest type
      return data?.map(test => ({
        ...test,
        tilawati_level: test.tilawati_level as TilawatiJilid,
        status: test.status as TestStatus,
        notes: test.notes || undefined,
        created_at: test.created_at || '',
        updated_at: test.updated_at || ''
      })) || [];
    },
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

  // Apply filters to tests
  const filteredTests = React.useMemo(() => {
    if (!tests) return [];
    
    return tests.filter(test => {
      // Status filter
      const matchesStatus = filters.status.length === 0 || filters.status.includes(test.status as TestStatus);
      
      // Level filter
      const matchesLevel = filters.jilidLevel.length === 0 || filters.jilidLevel.includes(test.tilawati_level as TilawatiJilid);
      
      return matchesStatus && matchesLevel;
    });
  }, [tests, filters]);

  // Calculate stats based on filtered tests
  const stats = React.useMemo(() => {
    if (!filteredTests) return { total: 0, passed: 0, scheduled: 0, failed: 0 };
    
    return {
      total: filteredTests.length,
      passed: filteredTests.filter(t => t.status === 'passed').length,
      scheduled: filteredTests.filter(t => t.status === 'scheduled').length,
      failed: filteredTests.filter(t => t.status === 'failed').length,
    };
  }, [filteredTests]);

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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Tilawati Test
          </h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 w-full">
          <div className="bg-gradient-to-r from-orange-50 to-yellow-100 rounded-lg shadow-sm p-3 sm:p-4 text-gray-900 transition duration-200 hover:shadow-lg hover:scale-105 cursor-pointer">
            <h3 className="text-xs sm:text-sm text-gray-500">Total Tests</h3>
            <p className="text-lg sm:text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg shadow-sm p-3 sm:p-4 text-gray-900 transition duration-200 hover:shadow-lg hover:scale-105 cursor-pointer">
            <h3 className="text-xs sm:text-sm text-gray-500">Passed</h3>
            <p className="text-lg sm:text-2xl font-bold text-green-600">{stats.passed}</p>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow-sm p-3 sm:p-4 text-gray-900 transition duration-200 hover:shadow-lg hover:scale-105 cursor-pointer">
            <h3 className="text-xs sm:text-sm text-gray-500">Scheduled</h3>
            <p className="text-lg sm:text-2xl font-bold text-blue-600">{stats.scheduled}</p>
          </div>
          <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg shadow-sm p-3 sm:p-4 text-gray-900 transition duration-200 hover:shadow-lg hover:scale-105 cursor-pointer">
            <h3 className="text-xs sm:text-sm text-gray-500">Failed</h3>
            <p className="text-lg sm:text-2xl font-bold text-red-600">{stats.failed}</p>
          </div>
        </div>

        {/* Status Tabs Section */}
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <span className="text-sm text-gray-400 font-medium">Status</span>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {STATUS_TABS.map(tab => {
                const isActive = (filters.status?.length === 0 && tab.value === 'all') || (filters.status?.[0] === tab.value);
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        status: tab.value === 'all' ? [] : [tab.value as TestStatus],
                      }));
                    }}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium focus:outline-none transition-all duration-200
                      rounded-full whitespace-nowrap
                      ${isActive
                        ? 'bg-green-500 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:border-green-400 hover:text-green-600'}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Level Tabs Section */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <span className="text-sm text-gray-400 font-medium">Level</span>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {LEVEL_TABS.map(tab => {
                const isActive = (filters.jilidLevel?.length === 0 && tab.value === 'all') || (filters.jilidLevel?.[0] === tab.value);
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        jilidLevel: tab.value === 'all' ? [] : [tab.value as TilawatiJilid],
                      }));
                    }}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium focus:outline-none transition-all duration-200
                      rounded-full whitespace-nowrap
                      ${isActive
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-400 hover:text-blue-600'}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-xs sm:text-sm text-gray-600">
            Showing {filteredTests.length} of {tests?.length || 0} tests
          </p>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden w-full">
          <ParentTestTable
            tests={filteredTests || []}
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

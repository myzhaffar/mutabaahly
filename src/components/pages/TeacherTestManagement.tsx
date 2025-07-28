'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Plus, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { useToast } from '@/hooks/use-toast';
import TeacherLayout from '@/components/layouts/TeacherLayout';
import TestTable from '@/components/test-management/TestTable';
import AddTestDialog from '@/components/AddTestDialog';
import TestFilters from '@/components/test-management/TestFilters';
import { fetchTestsWithFilters } from '@/utils/testQueries';
import { GradientButton } from '@/components/ui/gradient-button';
import type { TilawatiJilid, TestStatus, StudentForTest } from '@/types/tilawati';

interface TestFilters {
  searchTerm?: string;
  status?: TestStatus[];
  jilidLevel?: TilawatiJilid[];
}

const TeacherTestManagement: React.FC = () => {
  const router = useRouter();
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [filters, setFilters] = useState<TestFilters>({ status: [], jilidLevel: [] });

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Tilawati Tests', href: '/tests/manage' }
  ];

  // Fetch students with progress for test scheduling
  const { data: students, refetch: refetchStudents } = useQuery({
    queryKey: ['students-for-tests'],
    queryFn: async (): Promise<StudentForTest[]> => {
      // For now, return empty array - this needs to be implemented properly
      return [];
    },
    enabled: !!profile?.id,
  });

  // Fetch tests with filters
  const { data: tests, isLoading } = useQuery({
    queryKey: ['tilawati-tests', filters],
    queryFn: () => fetchTestsWithFilters(filters),
    enabled: !!profile?.id,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const handleTestUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ['tilawati-tests'] });
    refetchStudents();
    toast({
      title: "Success",
      description: "Test data has been updated successfully.",
    });
  };

  const handleFilterChange = (key: string, value: string[] | string | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const getStudentName = (studentId: string) => {
    const student = students?.find(s => s.id === studentId);
    return student?.name || 'Unknown Student';
  };

  return (
    <TeacherLayout breadcrumbs={breadcrumbs}>
      <div className="container mx-auto px-0 md:px-6 md:py-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 w-full mb-6">
          <div className="flex flex-row items-center gap-3 sm:gap-4 mt-2">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="p-0 m-0 bg-transparent border-none outline-none flex items-center"
              aria-label="Back"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-bold">Tilawati Tests</h1>
          </div>
          <GradientButton 
            onClick={() => setIsAddDialogOpen(true)}
            className="w-full md:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Schedule Test
          </GradientButton>
        </div>

        {/* Filters Section */}
        <TestFilters
          searchTerm={filters.searchTerm}
          status={filters.status || []}
          jilidLevel={filters.jilidLevel || []}
          onFilterChange={handleFilterChange}
        />

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <TestTable
          tests={tests || []}
          isLoading={isLoading}
          onTestUpdated={handleTestUpdate}
          showStudentName={true}
          getStudentName={getStudentName}
        />
        </div>

        {/* Add Test Dialog */}
        <AddTestDialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          onTestAddedOrUpdated={handleTestUpdate}
          students={students || []}
        />
      </div>
    </TeacherLayout>
  );
};

export default TeacherTestManagement;

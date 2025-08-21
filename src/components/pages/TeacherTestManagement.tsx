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

import { fetchTestsWithFilters } from '@/utils/testQueries';
import { GradientButton } from '@/components/ui/gradient-button';
import type { TilawatiJilid, TestStatus, StudentForTest } from '@/types/tilawati';
import { supabase } from '@/lib/supabase';
import { calculateTilawatiEligibility, getStudentDisplayText } from '@/utils/eligibilityCalculations';


interface TestFilters {
  searchTerm?: string;
  status?: TestStatus[];
  jilidLevel?: TilawatiJilid[];
}

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'passed', label: 'Passed' },
  { value: 'failed', label: 'Failed' },
];

const LEVEL_TABS = [
  { value: 'all', label: 'All' },
  { value: 'Level 1', label: 'Level 1' },
  { value: 'Level 2', label: 'Level 2' },
  { value: 'Level 3', label: 'Level 3' },
  { value: 'Level 4', label: 'Level 4' },
  { value: 'Level 5', label: 'Level 5' },
  { value: 'Level 6', label: 'Level 6' },
];

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
      if (!profile?.id) return [];

      // Get all students (any teacher can see all students)
      const { data: teacherStudents, error: studentsError } = await supabase
        .from('students')
        .select(`
          id,
          name,
          current_tilawati_jilid,
          group_name,
          teacher
        `);

      if (studentsError) {
        console.error('Error fetching students:', studentsError);
        return [];
      }

      if (!teacherStudents) return [];

      // Calculate eligibility for each student
      const studentsWithEligibility = await Promise.all(
        teacherStudents.map(async (student: { id: string; name: string; current_tilawati_jilid: string | null; group_name: string | null; teacher: string | null }) => {
          const eligibility = await calculateTilawatiEligibility(
            student.id,
            student.current_tilawati_jilid as TilawatiJilid | null
          );

          return {
            id: student.id,
            name: student.name,
            current_tilawati_jilid: student.current_tilawati_jilid as TilawatiJilid,
            class_name: student.group_name || 'Unknown Class',
            teacher: student.teacher || 'Unknown Teacher',
            eligibility
          };
        })
      );

      // Filter to only show eligible students or those with specific statuses
      return studentsWithEligibility.filter((student: StudentForTest) => {
        const displayText = getStudentDisplayText(student);
        return displayText !== null;
      });
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



  const getStudentName = (studentId: string) => {
    const student = students?.find(s => s.id === studentId);
    return student?.name || 'Unknown Student';
  };

  return (
    <TeacherLayout breadcrumbs={breadcrumbs}>
      <div className="container mx-auto px-0 py-0 md:px-6 md:py-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 w-full mb-6">
          <div className="flex flex-row items-center gap-3 sm:gap-4 mt-2 w-full">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="p-0 m-0 bg-transparent border-none outline-none flex items-center"
              aria-label="Back"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <h1 className="text-xl sm:text-2xl font-bold">Tilawati Tests</h1>
          </div>
          <GradientButton 
            onClick={() => setIsAddDialogOpen(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Schedule Test
          </GradientButton>
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

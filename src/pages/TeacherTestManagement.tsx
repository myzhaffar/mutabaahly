import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GradientButton } from '@/components/ui/gradient-button';
import { useToast } from '@/components/ui/use-toast';
import AddTestDialog from '@/components/AddTestDialog';
import TeacherLayout from '@/components/layouts/TeacherLayout';
import TestFilters from '@/components/test-management/TestFilters';
import TestTable from '@/components/test-management/TestTable';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { fetchTestsWithFilters } from '@/utils/testQueries';
import { calculateTilawahProgress } from '@/utils/progressCalculations';
import type { TilawatiTest, TestStatus, TilawatiJilid, StudentForTest } from '@/types/tilawati';
import { useNavigate } from 'react-router-dom';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

interface TestFilters {
  searchTerm?: string;
  status?: TestStatus | 'all';
  jilidLevel?: TilawatiJilid | 'all';
  date?: string;
}

const TeacherTestManagement: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<TilawatiTest | null>(null);
  const [filters, setFilters] = useState<TestFilters>({});

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Tilawati Tests' }
  ];

  // Fetch students for the teacher
  const { data: students, isLoading: isLoadingStudents, refetch: refetchStudents } = useQuery({
    queryKey: ['teacher-students', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      // First fetch basic student information
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select(`
          id,
          name,
          group_name,
          grade,
          teacher,
          photo
        `)
        .order('name');

      if (studentsError) {
        console.error('Error fetching students:', studentsError);
        throw studentsError;
      }

      if (!studentsData || studentsData.length === 0) {
        return [];
      }

      // For each student, fetch their progress entries
      const studentsWithProgress = await Promise.all(
        studentsData.map(async (student) => {
          try {
            // Fetch tilawah progress entries
            const { data: tilawahEntries, error: tilawahError } = await supabase
          .from('progress_entries')
          .select('*')
          .eq('student_id', student.id)
          .eq('type', 'tilawah')
          .order('date', { ascending: false });

            if (tilawahError) {
              console.error(`Error fetching tilawah entries for student ${student.id}:`, tilawahError);
              return null;
            }

            // Calculate Tilawati progress
            const tilawahProgress = calculateTilawahProgress(tilawahEntries || []);

            // A student is eligible for test if they have completed 100% of their current level
            const isEligible = tilawahProgress.percentage === 100;

            if (!isEligible) {
              return null; // Skip students who haven't completed their level
            }

        return {
          id: student.id,
          name: student.name,
              current_tilawati_jilid: tilawahProgress.jilid as TilawatiJilid || "Jilid 1",
          class_name: student.group_name || '',
          teacher: student.teacher,
              progress_percentage: tilawahProgress.percentage,
              is_eligible_for_test: true
            } as StudentForTest;
          } catch (error) {
            console.error(`Error processing student ${student.id}:`, error);
            return null;
          }
        })
      );

      // Filter out null values (students who aren't eligible) and return the list
      return studentsWithProgress.filter((student): student is StudentForTest => student !== null);
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

  const handleFilterChange = (key: string, value: string | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value,
    }));
  };

  const getStudentName = (studentId: string) => {
    const student = students?.find(s => s.id === studentId);
    return student?.name || 'Unknown Student';
  };

  return (
    <TeacherLayout breadcrumbs={breadcrumbs}>
      <div className="container mx-auto px-0 sm:px-4 py-4 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4 w-full mb-4">
          <div className="flex flex-row items-center gap-3 sm:gap-4 mt-2">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="p-0 m-0 bg-transparent border-none outline-none flex items-center"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" />
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
          status={filters.status}
          jilidLevel={filters.jilidLevel}
          date={filters.date}
          onFilterChange={handleFilterChange}
          showDateFilter={true}
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

        {/* Add/Edit Test Dialog */}
        {isAddDialogOpen && (
          <AddTestDialog
            isOpen={isAddDialogOpen}
            onClose={() => {
              setIsAddDialogOpen(false);
              setSelectedTest(null);
            }}
            onTestAddedOrUpdated={handleTestUpdate}
            currentTest={selectedTest}
            students={students || []}
          />
        )}
      </div>
    </TeacherLayout>
  );
};

export default TeacherTestManagement;

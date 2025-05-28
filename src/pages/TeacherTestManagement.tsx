
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import AddTestDialog from '@/components/AddTestDialog';
import TeacherLayout from '@/components/layouts/TeacherLayout';
import TestFilters from '@/components/test-management/TestFilters';
import TestTable from '@/components/test-management/TestTable';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { fetchTestsWithFilters } from '@/utils/testQueries';
import type { TilawatiTest, TestStatus, TilawatiJilid, StudentForTest } from '@/types/tilawati';

interface TestFilters {
  status?: TestStatus | 'all';
  searchTerm?: string;
  jilidLevel?: TilawatiJilid | 'all';
  date?: string;
}

const TeacherTestManagement: React.FC = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<TilawatiTest | null>(null);
  const [filters, setFilters] = useState<TestFilters>({});

  // Fetch students for the teacher
  const { data: students, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['teacher-students', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      console.log('Fetching students for teacher:', profile.id);
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('teacher', profile.full_name);

      if (error) {
        console.error('Error fetching students:', error);
        throw error;
      }

      console.log('Found students:', data);
      return (data || []).map(student => ({
        id: student.id,
        name: student.name,
        class_name: student.group_name || '',
      }));
    },
    enabled: !!profile?.id,
  });

  // Fetch tests with filters
  const { data: tests, isLoading, refetch } = useQuery({
    queryKey: ['tilawati-tests', filters],
    queryFn: () => fetchTestsWithFilters(filters),
    enabled: !!profile?.id,
  });

  // Fetch students for the test dialog
  const { data: studentsForTest } = useQuery({
    queryKey: ['students-for-test'],
    queryFn: async () => {
      const { data: students, error } = await supabase
        .from('students')
        .select('*')
        .order('name');

      if (error) throw error;

      return (students || []).map(student => ({
        id: student.id,
        name: student.name,
        class_name: student.group_name || '',
      })) as StudentForTest[];
    },
    enabled: !!profile?.id,
  });

  const handleTestUpdate = () => {
    refetch();
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

  // Get student name by ID
  const getStudentName = (studentId: string) => {
    const student = students?.find(s => s.id === studentId);
    return student?.name || 'Unknown Student';
  };

  const handleEditTest = (test: TilawatiTest) => {
    setSelectedTest(test);
    setIsAddDialogOpen(true);
  };

  return (
    <TeacherLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Tes Kenaikan Level</h1>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Jadwalkan Tes
          </Button>
        </div>

        <TestFilters
          searchTerm={filters.searchTerm}
          status={filters.status}
          jilidLevel={filters.jilidLevel}
          date={filters.date}
          onFilterChange={handleFilterChange}
          showDateFilter={true}
        />

        <TestTable
          tests={tests || []}
          isLoading={isLoading}
          onEditTest={handleEditTest}
          showStudentName={true}
          getStudentName={getStudentName}
        />

        {/* Add/Edit Test Dialog */}
        {isAddDialogOpen && (
          <AddTestDialog
            isOpen={isAddDialogOpen}
            onClose={() => {
              setIsAddDialogOpen(false);
              setSelectedTest(null);
            }}
            onTestAddedOrUpdated={(test) => {
              refetch();
              setIsAddDialogOpen(false);
              setSelectedTest(null);
            }}
            currentTest={selectedTest}
            students={studentsForTest || []}
          />
        )}
      </div>
    </TeacherLayout>
  );
};

export default TeacherTestManagement;

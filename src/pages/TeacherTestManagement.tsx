import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import AddTestDialog from '@/components/AddTestDialog';
import TeacherLayout from '@/components/layouts/TeacherLayout';
import TestFilters from '@/components/test-management/TestFilters';
import TestTable from '@/components/test-management/TestTable';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { fetchTestsWithFilters, deleteTest } from '@/utils/testQueries';
import type { TilawatiTest, TestStatus, TilawatiJilid, StudentForTest } from '@/types/tilawati';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TestFilters {
  status?: TestStatus | 'all';
  searchTerm?: string;
  jilidLevel?: TilawatiJilid | 'all';
  date?: string;
}

const TeacherTestManagement: React.FC = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<TilawatiTest | null>(null);
  const [filters, setFilters] = useState<TestFilters>({});
  const [testToDelete, setTestToDelete] = useState<TilawatiTest | null>(null);

  // Fetch students for the teacher
  const { data: students, isLoading: isLoadingStudents, refetch: refetchStudents } = useQuery({
    queryKey: ['teacher-students', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      console.log('Starting to fetch students for teacher:', profile);

      // Get all students who might be eligible for testing
      const { data: students, error: studentsError } = await supabase
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

      console.log('Found students:', students);

      if (!students || students.length === 0) {
        console.log('No students found in the system');
        return [];
      }

      // For each student, fetch their progress entries
      const studentsWithProgress = await Promise.all((students || []).map(async (student) => {
        console.log('Processing student:', student.name);
        
        // Get all progress entries for this student to calculate proper progress
        const { data: progressEntries, error: progressError } = await supabase
          .from('progress_entries')
          .select('*')
          .eq('student_id', student.id)
          .eq('type', 'tilawah')
          .order('date', { ascending: false });

        if (progressError) {
          console.error('Error fetching progress for student:', student.id, progressError);
          return {
            id: student.id,
            name: student.name,
            class_name: student.group_name || '',
            teacher: student.teacher,
            current_tilawati_jilid: "Jilid 1" as TilawatiJilid,
            progress_percentage: 0,
            is_eligible_for_test: false
          };
        }

        console.log('Found progress entries for student:', student.name, progressEntries);

        // Get the latest entry for current jilid
        const latestEntry = progressEntries?.[0];
        const currentJilid = latestEntry?.surah_or_jilid || "Jilid 1";
        let highestPage = 0;

        // Find the highest page number from entries
        if (latestEntry?.ayat_or_page) {
          const pageRange = latestEntry.ayat_or_page;
          console.log('Processing page range for student:', student.name, pageRange);
          
          if (pageRange.includes('-')) {
            // If it's a range (e.g., "1-44"), take the end number
            const [_, end] = pageRange.split('-').map(num => parseInt(num.trim()));
            if (!isNaN(end)) {
              highestPage = end;
              console.log('Found page range for student:', student.name, 'using end page:', end);
            }
          } else {
            // If it's a single page
            const page = parseInt(pageRange);
            if (!isNaN(page)) {
              highestPage = page;
              console.log('Found single page for student:', student.name, 'page:', page);
            }
          }
        }

        // Calculate percentage based on highest page (44 is 100%)
        const progress_percentage = Math.min(Math.round((highestPage / 44) * 100), 100);
        const is_eligible_for_test = highestPage >= 44;

        console.log('Final progress for student:', student.name, {
          currentJilid,
          highestPage,
          progress_percentage,
          is_eligible_for_test,
          teacher: student.teacher
        });

        return {
          id: student.id,
          name: student.name,
          class_name: student.group_name || '',
          teacher: student.teacher,
          current_tilawati_jilid: currentJilid as TilawatiJilid,
          progress_percentage,
          is_eligible_for_test
        };
      }));

      // Only return students who are eligible for testing
      const eligibleStudents = studentsWithProgress.filter(student => student.is_eligible_for_test);
      console.log('Final eligible students:', eligibleStudents);
      return eligibleStudents;
    },
    enabled: !!profile?.id,
  });

  // Fetch tests with filters
  const { data: tests, isLoading, refetch: refetchTests } = useQuery({
    queryKey: ['tilawati-tests', filters],
    queryFn: () => fetchTestsWithFilters(filters),
    enabled: !!profile?.id,
    staleTime: 0, // Consider data as stale immediately
    gcTime: 0, // Don't keep unused data in cache
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });

  const handleTestUpdate = () => {
    refetchTests();
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

  // Get student name by ID
  const getStudentName = (studentId: string) => {
    const student = students?.find(s => s.id === studentId);
    return student?.name || 'Unknown Student';
  };

  const handleEditTest = (test: TilawatiTest) => {
    setSelectedTest(test);
    setIsAddDialogOpen(true);
  };

  const handleDeleteTest = async (test: TilawatiTest) => {
    setTestToDelete(test);
  };

  const confirmDelete = async () => {
    if (!testToDelete) return;

    try {
      await deleteTest(testToDelete.id);
      
      // Force refetch the tests
      await queryClient.invalidateQueries({ queryKey: ['tilawati-tests'] });
      await refetchTests();
      
      toast({
        title: "Success",
        description: "Test has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting test:', error);
      toast({
        title: "Error",
        description: "Failed to delete test. Please try again.",
        variant: "destructive",
      });
    } finally {
      setTestToDelete(null);
    }
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
          onDeleteTest={handleDeleteTest}
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
              refetchTests();
              setIsAddDialogOpen(false);
              setSelectedTest(null);
            }}
            currentTest={selectedTest}
            students={students || []}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!testToDelete} onOpenChange={(open) => !open && setTestToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Tes</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus tes ini? Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TeacherLayout>
  );
};

export default TeacherTestManagement;

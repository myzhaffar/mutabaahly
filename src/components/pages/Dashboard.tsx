'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/useAuth';

import StatsCards from '@/components/dashboard/StatsCards';
import { supabase } from '@/integrations/supabase/client';
import { useRouter } from 'next/navigation';
import { calculateHafalanProgress, calculateTilawahProgress } from '@/utils/progressCalculations';
import TeacherLayout from '@/components/layouts/TeacherLayout';
import AddStudentDialog from '@/components/AddStudentDialog';
import BulkUploadStudentsDialog from '@/components/BulkUploadStudentsDialog';
import ClassCard from '@/components/dashboard/ClassCard';
import ParentLayout from '@/components/layouts/ParentLayout';
import { useToast } from '@/hooks/use-toast';

// Skeleton components
const StatsCardsSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-gray-100 animate-pulse h-32 rounded-xl"></div>
    ))}
  </div>
);

const StudentGridSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="bg-gray-100 animate-pulse h-64 rounded-2xl"></div>
    ))}
  </div>
);

interface Student {
  id: string;
  name: string;
  grade: string;
  group_name: string;
  teacher: string;
  photo: string | null;
  hafalan_progress: {
    percentage: number;
    last_surah: string | null;
  } | null;
  tilawah_progress: {
    percentage: number;
    jilid: string | null;
  } | null;
}

interface FilterState {
  classes: string[];
}

const Dashboard = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [searchTerm] = useState('');
  const [filters] = useState<FilterState>({
    classes: []
  });
  const [stats, setStats] = useState({
    totalStudents: 0,
    avgHafalanProgress: 0,
    avgTilawahProgress: 0,
    completedStudents: 0
  });
  const [groupedByGrade, setGroupedByGrade] = useState<Record<string, { students: Student[]; classes: string[] }>>({});
  
  // Separate data fetching into smaller, parallel functions
  const fetchStudentsBase = useCallback(async () => {
    try {
      let studentsQuery = supabase
        .from('students')
        .select('*');
      
      // If parent, filter by parent_id
      if (profile?.role === 'parent' && profile?.id) {
        studentsQuery = studentsQuery.eq('parent_id', profile.id);
      }
      
      const { data: studentsData, error: studentsError } = await studentsQuery;

      if (studentsError) {
        toast({
          title: "Error",
          description: "Failed to fetch students. Please try again.",
          variant: "destructive",
        });
        return null;
      }
      
      return studentsData;
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching students.",
        variant: "destructive",
      });
      return null;
    }
  }, [toast, profile]);

  const fetchProgressEntries = useCallback(async (studentId: string) => {
    try {
      const { data: progressEntries, error: progressError } = await supabase
        .from('progress_entries')
        .select('*')
        .eq('student_id', studentId)
        .order('date', { ascending: false });

      if (progressError) {
        return [];
      }
      
      return progressEntries || [];
    } catch (error) {
      return [];
    }
  }, []);

  const fetchStudents = useCallback(async () => {
    setDataLoading(true);
    
    try {
      // Step 1: Get all students data
      const studentsData = await fetchStudentsBase();
      if (!studentsData) {
        setDataLoading(false);
        return;
      }
      
      // Step 2: Fetch progress entries for all students in parallel
      const studentsWithProgress = await Promise.all(
        studentsData.map(async (student) => {
          try {
            // Fetch progress entries from the database
            const progressEntries = await fetchProgressEntries(student.id);

            // Calculate progress based on actual entries
            const hafalanEntries = progressEntries.filter(entry => entry.type === 'hafalan');
            const tilawahEntries = progressEntries.filter(entry => entry.type === 'tilawah');

            // Calculate progress percentages
            const hafalanProgress = calculateHafalanProgress(hafalanEntries);
            const tilawahProgress = calculateTilawahProgress(tilawahEntries);

            return {
              id: student.id,
              name: student.name,
              grade: student.grade || 'Unknown',
              group_name: student.group_name || 'Unknown Class',
              teacher: student.teacher || 'Unknown Teacher',
              photo: student.photo,
              hafalan_progress: hafalanProgress.percentage > 0 ? {
                percentage: hafalanProgress.percentage,
                last_surah: hafalanProgress.last_surah
              } : null,
              tilawah_progress: tilawahProgress.percentage > 0 ? {
                percentage: tilawahProgress.percentage,
                jilid: tilawahProgress.jilid
              } : null
            };
          } catch (error) {
            return {
              id: student.id,
              name: student.name,
              grade: '',
              group_name: 'Unknown Class',
              teacher: 'Unknown Teacher',
              photo: student.photo,
              hafalan_progress: null,
              tilawah_progress: null
            };
          }
        })
      );

      setStudents(studentsWithProgress as Student[]);
      
      // Group students by grade and collect unique sub-classes
      const grouped: Record<string, { students: Student[]; classes: string[] }> = {};
      for (const student of studentsWithProgress) {
        const grade = student.grade || 'Unknown';
        if (!grouped[grade]) {
          grouped[grade] = { students: [], classes: [] };
        }
        grouped[grade].students.push(student);
        if (student.group_name && !grouped[grade].classes.includes(student.group_name)) {
          grouped[grade].classes.push(student.group_name);
        }
      }
      setGroupedByGrade(grouped);

      // Calculate stats
      const totalStudents = studentsWithProgress.length;
      const avgHafalan = studentsWithProgress.reduce((sum, s) => sum + (s.hafalan_progress?.percentage || 0), 0) / (totalStudents || 1);
      const avgTilawah = studentsWithProgress.reduce((sum, s) => sum + (s.tilawah_progress?.percentage || 0), 0) / (totalStudents || 1);
      const completed = studentsWithProgress.filter(s => 
        (s.hafalan_progress?.percentage || 0) === 100 && 
        (s.tilawah_progress?.percentage || 0) === 100
      ).length;

      setStats({
        totalStudents,
        avgHafalanProgress: Math.round(avgHafalan),
        avgTilawahProgress: Math.round(avgTilawah),
        completedStudents: completed
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching students.",
        variant: "destructive",
      });
    } finally {
      setDataLoading(false);
    }
  }, [fetchStudentsBase, fetchProgressEntries, toast]);

  useEffect(() => {
    if (user && profile) {
      fetchStudents();
    } else if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, profile, authLoading, router, fetchStudents]);

  const handleStudentAdded = () => {
    fetchStudents();
  };

  // Use useMemo for grade cards to prevent unnecessary re-renders
  const gradeCards = useMemo(() => {
    return Object.entries(groupedByGrade).map(([grade, info]) => (
      <ClassCard
        key={grade}
        grade={grade}
        students={info.students}
        classes={info.classes}
      />
    ));
  }, [groupedByGrade]);

  if (profile?.role === 'teacher') {
    const breadcrumbs = [{ label: 'Dashboard' }];
    return (
      <TeacherLayout breadcrumbs={breadcrumbs}>
        <div className="container mx-auto px-0 py-0 md:px-6 md:py-6">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4 pt-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Welcome back, {profile?.full_name}
                </h1>
                <p className="text-gray-600">Teacher Dashboard</p>
              </div>
              <div className="flex justify-center gap-2 sm:justify-end">
                <BulkUploadStudentsDialog onStudentsAdded={handleStudentAdded} />
                <AddStudentDialog onStudentAdded={handleStudentAdded} />
              </div>
            </div>
            {/* Stats Section */}
            {dataLoading ? <StatsCardsSkeleton /> : <StatsCards stats={stats} />}
            <div className="mb-6">
              {dataLoading ? <StudentGridSkeleton /> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {gradeCards}
                </div>
              )}
            </div>
          </div>
        </div>
      </TeacherLayout>
    );
  }

  // Parent view
  const breadcrumbs = [{ label: 'Dashboard' }];
  return (
    <ParentLayout breadcrumbs={breadcrumbs}>
      <div className="container mx-auto px-0 py-0 md:px-6 md:py-6">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4 pt-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {profile?.full_name}
              </h1>
              <p className="text-gray-600">Parent Dashboard</p>
            </div>
            {/* No add student buttons for parents */}
          </div>
          {/* Stats Section */}
          {dataLoading ? <StatsCardsSkeleton /> : <StatsCards stats={stats} />}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Children&apos;s Classes</h2>
              <div className="text-sm text-gray-500">
                {students.length} child{students.length !== 1 ? 'ren' : ''}
              </div>
            </div>
            {dataLoading ? <StudentGridSkeleton /> : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {gradeCards}
              </div>
            )}
            {!dataLoading && students.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Children Found</h3>
                <p className="text-gray-600">Your children haven&apos;t been added to the system yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ParentLayout>
  );
};

export default Dashboard;
 
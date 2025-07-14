'use client';

import React, { useState, useEffect, useCallback } from 'react';
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

// Simple skeleton components
const StatsCardsSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="bg-gray-100 rounded-lg h-24 animate-pulse" />
    ))}
  </div>
);

const StudentGridSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="bg-gray-100 rounded-lg h-40 animate-pulse" />
    ))}
  </div>
);

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

  const fetchStudents = useCallback(async () => {
    try {
      // Fetch all students for all roles (including parent)
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*');

      if (studentsError) {
        toast({
          title: "Error",
          description: "Failed to fetch students. Please try again.",
          variant: "destructive",
        });
        console.error('Error fetching students:', studentsError);
        return;
      }

      // For each student, fetch their progress entries and calculate dynamic progress
      const studentsWithProgress = await Promise.all(
        (studentsData || []).map(async (student) => {
          try {
            // Fetch hafalan progress entries
            const { data: hafalanEntries, error: hafalanError } = await supabase
              .from('progress_entries')
              .select('*')
              .eq('student_id', student.id)
              .eq('type', 'hafalan');

            if (hafalanError) {
              console.error(`Error fetching hafalan entries for student ${student.id} (${student.name}):`, hafalanError);
              // Potentially skip this student's progress update or handle error appropriately
            }

            // Fetch tilawah progress entries
            const { data: tilawahEntries, error: tilawahError } = await supabase
              .from('progress_entries')
              .select('*')
              .eq('student_id', student.id)
              .eq('type', 'tilawah');

            if (tilawahError) {
              console.error(`Error fetching tilawah entries for student ${student.id} (${student.name}):`, tilawahError);
              // Potentially skip this student's progress update
            }

            // Calculate progress based on entries
            const hafalanProgress = calculateHafalanProgress(hafalanEntries || []);
            const tilawahProgress = calculateTilawahProgress(tilawahEntries || []);

            // Update progress in database
            // Only attempt upsert if entries were successfully fetched and exist
            if (hafalanEntries && hafalanEntries.length > 0 && !hafalanError) {
              const { error: upsertHafalanError } = await supabase
                .from('hafalan_progress')
                .upsert({
                  student_id: student.id,
                  percentage: hafalanProgress.percentage,
                  last_surah: hafalanProgress.last_surah,
                  updated_at: new Date().toISOString()
                });
              if (upsertHafalanError) {
                console.error(`Error upserting hafalan progress for student ${student.id} (${student.name}):`, upsertHafalanError);
              }
            }

            if (tilawahEntries && tilawahEntries.length > 0 && !tilawahError) {
              const { error: upsertTilawahError } = await supabase
                .from('tilawah_progress')
                .upsert({
                  student_id: student.id,
                  percentage: tilawahProgress.percentage,
                  jilid: tilawahProgress.jilid,
                  updated_at: new Date().toISOString()
                });
              if (upsertTilawahError) {
                console.error(`Error upserting tilawah progress for student ${student.id} (${student.name}):`, upsertTilawahError);
              }
            }

            return {
              ...student,
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
            console.error(`Failed to process or update progress for student ${student.id} (${student.name}):`, error);
            // Return the original student object if an error occurs during processing
            // This ensures the student still appears in the list.
            // Add null progress fields to satisfy the Student type
            return { 
              ...student,
              hafalan_progress: null,
              tilawah_progress: null
            };
          }
        })
      );

      setStudents(studentsWithProgress as Student[]); // Explicitly cast to Student[]
      
      // Calculate stats
      const totalStudents = studentsWithProgress.length;
      const avgHafalan = studentsWithProgress.reduce((sum, s) => sum + (s.hafalan_progress?.percentage || 0), 0) / totalStudents;
      const avgTilawah = studentsWithProgress.reduce((sum, s) => sum + (s.tilawah_progress?.percentage || 0), 0) / totalStudents;
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
      console.error('Error in fetchStudents:', error);
    } finally {
      setDataLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (user && profile) {
      fetchStudents();
    } else if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, profile, authLoading, router, fetchStudents]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {

  }, [students, searchTerm, filters]);



  // const handleSearchChange = (search: string) => { // This function is removed as per the edit hint
  //   setSearchTerm(search);
  // };

  // const handleFiltersChange = (newFilters: FilterState) => { // This function is removed as per the edit hint
  //   setFilters(newFilters);
  // };



  const handleStudentAdded = () => {
    fetchStudents();
  };



  // Group students by class
  const classGroups = students.reduce((acc, student) => {
    if (!acc[student.group_name]) acc[student.group_name] = [];
    acc[student.group_name].push(student);
    return acc;
  }, {} as Record<string, Student[]>);

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
                  {Object.entries(classGroups).map(([className, classStudents]) => (
                    <ClassCard key={className} className={className} classStudents={classStudents} />
                  ))}
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
          <div className="mb-8 pt-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome back, {profile?.full_name}
                </h1>
                <p className="text-gray-600">Parent Dashboard</p>
              </div>
            </div>
            {dataLoading ? <StatsCardsSkeleton /> : <StatsCards stats={stats} />}
          </div>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Children&apos;s Overview</h2>
              {/* Removed filtered count for parent role */}
            </div>
            {dataLoading ? <StudentGridSkeleton /> : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Object.entries(classGroups).map(([className, classStudents]) => {
                  if (classStudents.length === 0) return null;
                  return (
                    <ClassCard key={className} className={className} classStudents={classStudents} />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </ParentLayout>
  );
};

export default Dashboard;
 
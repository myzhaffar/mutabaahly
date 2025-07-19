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
import type { ProgressEntry } from '@/types/progress';

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
      console.log('Fetching students...');
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
        console.error('Error fetching students:', studentsError);
        return;
      }

      console.log('Raw students data:', studentsData);

      // For each student, fetch their progress entries and calculate dynamic progress
      const studentsWithProgress = await Promise.all(
        (studentsData || []).map(async (student) => {
          try {
            // Fetch progress entries from the database
            const { data: progressEntries, error: progressError } = await supabase
              .from('progress_entries')
              .select('*')
              .eq('student_id', student.id)
              .order('date', { ascending: false });

            if (progressError) {
              console.error(`Error fetching progress for student ${student.id}:`, progressError);
            }

            console.log(`Progress entries for ${student.name}:`, progressEntries);

            // Calculate progress based on actual entries
            const hafalanEntries = progressEntries?.filter(entry => entry.type === 'hafalan') || [];
            const tilawahEntries = progressEntries?.filter(entry => entry.type === 'tilawah') || [];

            console.log(`Hafalan entries for ${student.name}:`, hafalanEntries);
            console.log(`Tilawah entries for ${student.name}:`, tilawahEntries);

            // Calculate progress percentages
            const hafalanProgress = calculateHafalanProgress(hafalanEntries);
            const tilawahProgress = calculateTilawahProgress(tilawahEntries);

            console.log(`Student ${student.name}: class=${student.group_name}, teacher=${student.teacher}`);
            console.log(`Progress - Hafalan: ${hafalanProgress.percentage}%, Tilawah: ${tilawahProgress.percentage}%`);
            console.log(`Hafalan details:`, hafalanProgress);
            console.log(`Tilawah details:`, tilawahProgress);

            return {
              id: student.id,
              name: student.name,
              grade: '', // Not used in current schema
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
            console.error(`Failed to process or update progress for student ${student.id} (${student.name}):`, error);
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

      console.log('Processed students with progress:', studentsWithProgress);
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
  }, [toast, profile]);

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
 
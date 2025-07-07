import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import SearchAndFilter from '@/components/SearchAndFilter';
import StatsCards from '@/components/dashboard/StatsCards';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { calculateHafalanProgress, calculateTilawahProgress } from '@/utils/progressCalculations';
import TeacherLayout from '@/components/layouts/TeacherLayout';
import AddStudentDialog from '@/components/AddStudentDialog';
import BulkUploadStudentsDialog from '@/components/BulkUploadStudentsDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ClassCard from '@/components/dashboard/ClassCard';
import { Checkbox } from '@/components/ui/checkbox';

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
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    classes: []
  });
  const [stats, setStats] = useState({
    totalStudents: 0,
    avgHafalanProgress: 0,
    avgTilawahProgress: 0,
    completedStudents: 0
  });

  useEffect(() => {
    if (user && profile) {
      fetchStudents();
    } else if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, profile, authLoading, navigate]);

  const fetchStudents = async () => {
    try {
      // Fetch all students for all roles (including parent)
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*');

      if (studentsError) {
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
      console.error('Error in fetchStudents:', error);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    let filtered = students;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply class filter
    if (filters.classes.length > 0) {
      filtered = filtered.filter(student =>
        filters.classes.includes(student.group_name)
      );
    }

    setFilteredStudents(filtered);
  }, [students, searchTerm, filters]);

  // Get unique values for filter options
  const getFilterOptions = () => {
    const classes = [...new Set(students.map(s => s.group_name))].sort();
    return { classes };
  };

  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleViewDetails = (studentId: string) => {
    navigate(`/student/${studentId}`);
  };

  const handleStudentAdded = () => {
    fetchStudents();
  };

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-islamic-500"></div>
      </div>
    );
  }

  const { classes } = getFilterOptions();

  // Group students by class
  const classGroups = students.reduce((acc, student) => {
    if (!acc[student.group_name]) acc[student.group_name] = [];
    acc[student.group_name].push(student);
    return acc;
  }, {} as Record<string, Student[]>);

  if (profile?.role === 'teacher') {
    const breadcrumbs = [{ label: 'Dashboard Overview' }];
    return (
      <TeacherLayout breadcrumbs={breadcrumbs}>
        <div className="bg-white rounded-lg shadow-sm px-0 sm:px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
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

        <StatsCards stats={stats} />

        <div className="mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Object.entries(classGroups).map(([className, classStudents]) => (
                <ClassCard key={className} className={className} classStudents={classStudents} />
              ))}
        </div>
          </div>
        </div>
      </TeacherLayout>
    );
  }

  // Parent view
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {profile?.full_name}
              </h1>
              <p className="text-gray-600">Parent Dashboard</p>
            </div>
          </div>
          <StatsCards stats={stats} />
        </div>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Children's Overview</h2>
            {/* Removed filtered count for parent role */}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Object.entries(classGroups).map(([className, classStudents]) => {
              if (classStudents.length === 0) return null;
              return (
                <ClassCard key={className} className={className} classStudents={classStudents} />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

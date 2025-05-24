import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';
import AddStudentDialog from '@/components/AddStudentDialog';
import SearchAndFilter from '@/components/SearchAndFilter';
import StatsCards from '@/components/dashboard/StatsCards';
import StudentsGrid from '@/components/dashboard/StudentsGrid';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { calculateHafalanProgress, calculateTilawahProgress } from '@/utils/progressCalculations';

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
  grades: string[];
  classes: string[];
  teachers: string[];
}

const Dashboard = () => {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    grades: [],
    classes: [],
    teachers: []
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
    }
  }, [user, profile]);

  const fetchStudents = async () => {
    try {
      // Fetch students
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
          // Fetch hafalan progress entries
          const { data: hafalanEntries } = await supabase
            .from('progress_entries')
            .select('*')
            .eq('student_id', student.id)
            .eq('type', 'hafalan');

          // Fetch tilawah progress entries
          const { data: tilawahEntries } = await supabase
            .from('progress_entries')
            .select('*')
            .eq('student_id', student.id)
            .eq('type', 'tilawah');

          // Calculate progress based on entries
          const hafalanProgress = calculateHafalanProgress(hafalanEntries || []);
          const tilawahProgress = calculateTilawahProgress(tilawahEntries || []);

          // Update progress in database
          if (hafalanEntries && hafalanEntries.length > 0) {
            await supabase
              .from('hafalan_progress')
              .upsert({
                student_id: student.id,
                percentage: hafalanProgress.percentage,
                last_surah: hafalanProgress.last_surah,
                updated_at: new Date().toISOString()
              });
          }

          if (tilawahEntries && tilawahEntries.length > 0) {
            await supabase
              .from('tilawah_progress')
              .upsert({
                student_id: student.id,
                percentage: tilawahProgress.percentage,
                jilid: tilawahProgress.jilid,
                updated_at: new Date().toISOString()
              });
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
        })
      );

      setStudents(studentsWithProgress);
      
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
      setLoading(false);
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

    // Apply grade filter
    if (filters.grades.length > 0) {
      filtered = filtered.filter(student =>
        filters.grades.includes(student.grade || 'N/A')
      );
    }

    // Apply class filter
    if (filters.classes.length > 0) {
      filtered = filtered.filter(student =>
        filters.classes.includes(student.group_name)
      );
    }

    // Apply teacher filter
    if (filters.teachers.length > 0) {
      filtered = filtered.filter(student =>
        filters.teachers.includes(student.teacher)
      );
    }

    setFilteredStudents(filtered);
  }, [students, searchTerm, filters]);

  // Get unique values for filter options
  const getFilterOptions = () => {
    const grades = [...new Set(students.map(s => s.grade || 'N/A'))].sort();
    const classes = [...new Set(students.map(s => s.group_name))].sort();
    const teachers = [...new Set(students.map(s => s.teacher))].sort();
    
    return { grades, classes, teachers };
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-islamic-500"></div>
        </div>
      </div>
    );
  }

  const { grades, classes, teachers } = getFilterOptions();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {profile?.full_name}
            </h1>
            <p className="text-gray-600">
              {profile?.role === 'teacher' ? 'Teacher Dashboard' : 'Parent Dashboard'}
            </p>
          </div>
          {profile?.role === 'teacher' && (
            <AddStudentDialog onStudentAdded={handleStudentAdded} />
          )}
        </div>

        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* Search and Filter Section */}
        <div className="mb-6">
          <SearchAndFilter
            onSearchChange={handleSearchChange}
            onFiltersChange={handleFiltersChange}
            availableGrades={grades}
            availableClasses={classes}
            availableTeachers={teachers}
            currentFilters={filters}
          />
        </div>

        {/* Students Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Students Overview</h2>
            {filteredStudents.length !== students.length && (
              <span className="text-sm text-gray-600">
                Showing {filteredStudents.length} of {students.length} students
              </span>
            )}
          </div>
          
          <StudentsGrid
            students={students}
            filteredStudents={filteredStudents}
            onViewDetails={handleViewDetails}
            userRole={profile?.role || 'teacher'}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TeacherLayout from '@/components/layouts/TeacherLayout';
import ParentLayout from '@/components/layouts/ParentLayout';
import { useAuth } from '@/contexts/useAuth';
import StudentsGrid from '@/components/dashboard/StudentsGrid';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { calculateHafalanProgress, calculateTilawahProgress } from '@/utils/progressCalculations';
import { ChevronLeft, Filter, X } from 'lucide-react';
import { FIXED_TEACHERS } from '@/utils/rankingDataService';
import { useToast } from '@/hooks/use-toast';

interface ClassStudent {
  id: string;
  name: string;
  grade: string | null;
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

const ClassDetail: React.FC = () => {
  const params = useParams();
  const className = decodeURIComponent(params?.className as string);
  console.log('DEBUG: className param:', className); // Debug log
  const { profile } = useAuth();
  const router = useRouter();
  const [students, setStudents] = useState<ClassStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [teacherFilterOpen, setTeacherFilterOpen] = useState(false);
  const { toast } = useToast();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('group_name', className);
      console.log('DEBUG: studentsData:', studentsData, 'studentsError:', studentsError); // Debug log
      if (studentsError || !studentsData) {
        toast({
          title: "Error",
          description: "Failed to fetch students for this class. Please try again.",
          variant: "destructive",
        });
        setStudents([]);
        setLoading(false);
        return;
      }
      // For each student, fetch their progress entries and calculate progress
      const studentsWithProgress = await Promise.all(
        studentsData.map(async (student) => {
          try {
            // TODO: Disabled because 'progress_entries' table does not exist in production DB.
            // const { data: hafalanEntries } = await supabase
            //   .from('progress_entries')
            //   .select('*')
            //   .eq('student_id', student.id)
            //   .eq('type', 'hafalan');
            // const { data: tilawahEntries } = await supabase
            //   .from('progress_entries')
            //   .select('*')
            //   .eq('student_id', student.id)
            //   .eq('type', 'tilawah');
            // If needed, set empty arrays or fallback:
            const hafalanEntries: ProgressEntry[] = [];
            const tilawahEntries: ProgressEntry[] = [];
            // Optionally, show a warning in the UI if this data is required.
            const hafalanProgress = calculateHafalanProgress(hafalanEntries || []);
            const tilawahProgress = calculateTilawahProgress(tilawahEntries || []);
            return {
              ...student,
              hafalan_progress: hafalanProgress.percentage > 0 ? hafalanProgress : null,
              tilawah_progress: tilawahProgress.percentage > 0 ? tilawahProgress : null
            };
          } catch {
            return {
              ...student,
              hafalan_progress: null,
              tilawah_progress: null
            };
          }
        })
      );
      setStudents(studentsWithProgress);
      setLoading(false);
    };
    fetchStudents();
  }, [className, toast]);

  const handleViewDetails = (studentId: string) => {
    router.push(`/student/${studentId}`);
  };

  // Use fixed teacher list for filter
  const teacherOptions = FIXED_TEACHERS;

  // Map student.teacher to ID if needed (for legacy data)
  const getTeacherId = (student: ClassStudent) => {
    // If already an ID, return as is
    if (teacherOptions.some(t => t.id === student.teacher)) return student.teacher;
    // Try to map by name
    const found = teacherOptions.find(t => t.name === student.teacher);
    return found ? found.id : student.teacher;
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(search.toLowerCase()) &&
    (selectedTeachers.length === 0 || selectedTeachers.includes(getTeacherId(student)))
  );

  const hasAnyActiveTeacherFilter = selectedTeachers.length > 0;
  const clearTeacherFilters = () => setSelectedTeachers([]);

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: className }
  ];

  const MainContent = (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 mb-1 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-0 m-0 bg-transparent border-none outline-none flex items-center mr-2"
            aria-label="Back"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            {className}
            <span className="inline-flex items-center justify-center px-2 py-0.5 ml-1 text-xs font-semibold leading-none text-white bg-emerald-500 rounded-full">
              {filteredStudents.length}
            </span>
          </h1>
        </div>
      </div>
      {/* Modern Filter Card with Search and Teacher Filter */}
      <div className="sticky top-14 z-20 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 mb-6 px-0 sm:px-0">
        <div className="px-6 pt-6 pb-2">
          <Input
            placeholder="Search students in this class..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-base py-2 px-4 shadow-sm"
          />
        </div>
        <div className="border-t border-gray-100 mx-6" />
        <button
          type="button"
          className="w-full flex items-center gap-3 px-6 py-4 focus:outline-none"
          onClick={() => setTeacherFilterOpen(open => !open)}
          aria-expanded={teacherFilterOpen}
        >
          <div className="p-2 bg-blue-50 rounded-lg">
            <Filter className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-semibold text-gray-900 text-base sm:text-lg">Teacher Filters</h3>
            <p className="text-xs sm:text-sm text-gray-500">Select one or more teachers to filter students</p>
            {hasAnyActiveTeacherFilter && (
              <div className="flex items-center gap-2 flex-wrap mt-2">
                {selectedTeachers.map(id => {
                  const teacher = teacherOptions.find(t => t.id === id);
                  return (
                    <span key={id} className="inline-flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1 bg-blue-100 text-blue-700 text-xs sm:text-sm rounded-full border border-blue-200">
                      {teacher?.name || id}
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); setSelectedTeachers(prev => prev.filter(t => t !== id)); }}
                        className="ml-1 text-xs text-gray-400 hover:text-red-600"
                        aria-label="Remove teacher filter"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); clearTeacherFilters(); }}
                  className="ml-2 text-xs text-gray-500 hover:text-red-600 underline"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
          <span className="ml-auto text-xs text-gray-500 font-medium">{teacherFilterOpen ? 'Hide' : 'Show'}</span>
        </button>
        {teacherFilterOpen && (
          <div className="px-6 pb-6 pt-2">
            <div className="max-h-48 overflow-y-auto flex flex-col gap-2 pr-2">
              {teacherOptions.map(teacher => (
                <div key={teacher.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`teacher-filter-${teacher.id}`}
                    checked={selectedTeachers.includes(teacher.id)}
                    onCheckedChange={() => {
                      setSelectedTeachers(prev => {
                        const exists = prev.includes(teacher.id);
                        return exists
                          ? prev.filter(t => t !== teacher.id)
                          : [...prev, teacher.id];
                      });
                    }}
                    className="rounded-full"
                  />
                  <label htmlFor={`teacher-filter-${teacher.id}`} className="text-sm text-gray-700 cursor-pointer">
                    {teacher.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading students...</div>
      ) : (
        <StudentsGrid
          students={students.map(student => ({
            ...student,
            grade: student.grade || 'Unknown'
          }))}
          filteredStudents={filteredStudents.map(student => ({
            ...student,
            grade: student.grade || 'Unknown'
          }))}
          onViewDetails={handleViewDetails}
          userRole={profile?.role || 'parent'}
        />
      )}
    </div>
  );

  if (profile?.role === 'parent') {
    return <ParentLayout breadcrumbs={breadcrumbs}>{MainContent}</ParentLayout>;
  }
  return <TeacherLayout breadcrumbs={breadcrumbs}>
    <div className="container mx-auto px-0 py-0 md:px-6 md:py-6">
      {MainContent}
    </div>
  </TeacherLayout>;
};

export default ClassDetail; 
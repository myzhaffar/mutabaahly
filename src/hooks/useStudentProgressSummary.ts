import useSWR from 'swr';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Define a type for the student data we'll work with
export interface StudentData {
  id: string;
  name: string;
  grade: string | null;
  group_name: string | null;
  teacher: string | null;
  photo: string | null;
  parent_id: string | null;
      tahfidz_progress?: {
    percentage: number;
    last_surah: string | null;
  } | null;
  tilawah_progress?: {
    percentage: number;
    jilid: string | null;
  } | null;
}

// Define the props for our hook
interface UseStudentProgressSummaryProps {
  parentId?: string;
  teacherId?: string;
  grade?: string;
  groupName?: string;
  studentId?: string;
  fetchAllStudents?: boolean; // New prop to fetch all students
}

// Type for the processed student data with calculated progress
export interface ProcessedStudent {
  id: string;
  name: string;
  grade: string;
  group_name: string;
  teacher: string;
  photo: string | null;
  parent_id: string | null; // Added to support filtering
      tahfidz_progress: {
    percentage: number;
    last_surah: string | null;
  } | null;
  tilawah_progress: {
    percentage: number;
    jilid: string | null;
  } | null;
}

// Type for the grouped data structure
export interface GroupedData {
  students: ProcessedStudent[];
  classes: string[];
}

// Type for the summary statistics
export interface SummaryStats {
  totalStudents: number;
      avgTahfidzProgress: number;
  avgTilawahProgress: number;
  completedStudents: number;
}

// Format grade value to ensure consistency
function formatGrade(grade: string | null): string {
  if (!grade) return 'Unknown';
  
  // Clean and normalize the grade value
  const cleanGrade = grade.toString().trim();
  
  // If grade already includes the word "Grade" (like "Grade 6"), extract just the number
  if (cleanGrade.toLowerCase().includes('grade')) {
    const number = cleanGrade.replace(/[^\d]/g, '');
    return number || 'Unknown';
  }
  
  // If grade is just a number, return it as is
  if (/^\d+$/.test(cleanGrade)) {
    return cleanGrade;
  }
  
  // For any other format, return as is
  return cleanGrade;
}

// The main hook
export const useStudentProgressSummary = ({
  parentId,
  teacherId,
  grade,
  groupName,
  studentId,
  fetchAllStudents = false,
}: UseStudentProgressSummaryProps = {}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Create a query key that includes all filters
  const queryKey = ['studentProgressSummary', fetchAllStudents, parentId, teacherId, grade, groupName, studentId];
  
  // Fetcher function for Supabase queries
  const fetcher = async () => {
    let query = supabase.from('students').select('*');
    
    // Apply filters to the database query
    if (parentId) {
      query = query.eq('parent_id', parentId);
    }
    
    if (teacherId) {
      query = query.eq('teacher', teacherId);
    }
    
    if (grade) {
      query = query.eq('grade', grade);
    }
    
    if (groupName) {
      query = query.eq('group_name', groupName);
    }
    
    if (studentId) {
      query = query.eq('id', studentId);
    }
    
    // If fetchAllStudents is true and no specific filters are applied, fetch all students
    if (fetchAllStudents && !parentId && !teacherId && !grade && !groupName && !studentId) {
      query = supabase.from('students').select('*');
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    // Now fetch progress entries for each student
    const studentsWithProgress = await Promise.all((data || []).map(async (student) => {
      // Fetch progress entries
      const { data: progressEntries } = await supabase
        .from('progress_entries')
        .select('*')
        .eq('student_id', student.id);
      
                      // Calculate tahfidz progress
        const tahfidzEntries = progressEntries?.filter(entry => entry.type === 'hafalan') || [];
        const tahfidzPercentage = tahfidzEntries.length > 0
          ? Math.min(100, Math.round((tahfidzEntries.length * 100) / 114))
          : 0;
        const lastSurah = tahfidzEntries.length > 0
          ? tahfidzEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.surah_or_jilid
          : null;
      
      // Calculate tilawah progress
      const tilawahEntries = progressEntries?.filter(entry => entry.type === 'tilawah') || [];
      const tilawahPercentage = tilawahEntries.length > 0
        ? Math.min(100, Math.round((tilawahEntries.length * 100) / 6))
        : 0;
      const lastJilid = tilawahEntries.length > 0
        ? tilawahEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.surah_or_jilid
        : null;
      
      // Ensure we have all required fields with proper fallbacks
      // Format grade to ensure consistency
      return {
        id: student.id,
        name: student.name || '',
        grade: formatGrade(student.grade),
        group_name: student.group_name || '',
        teacher: student.teacher || '',
        photo: student.photo,
        parent_id: student.parent_id, // Keep parent_id for filtering
        tahfidz_progress: tahfidzEntries.length > 0 ? {
          percentage: tahfidzPercentage,
          last_surah: lastSurah
        } : null,
        tilawah_progress: tilawahEntries.length > 0 ? {
          percentage: tilawahPercentage,
          jilid: lastJilid
        } : null
      } as ProcessedStudent;
    }));
    
    return studentsWithProgress;
  };
  
  // Use SWR for data fetching with caching and revalidation
  const { data: allStudentsData, error, mutate } = useSWR<ProcessedStudent[]>(
    queryKey,
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute
    }
  );
  
  // Use the data directly since filters are now applied at the database level
  const data = allStudentsData;
  
  // Custom refresh function
  const refresh = async () => {
    setIsRefreshing(true);
    await mutate();
    setIsRefreshing(false);
  };
  
  // Calculate summary statistics
  const summaryStats: SummaryStats = {
    totalStudents: data?.length || 0,
        avgTahfidzProgress: data?.length
      ? Math.round(data.reduce((sum, student) => sum + (student.tahfidz_progress?.percentage || 0), 0) / data.length)
      : 0,
    avgTilawahProgress: data?.length 
      ? Math.round(data.reduce((sum, student) => sum + (student.tilawah_progress?.percentage || 0), 0) / data.length) 
      : 0,
    completedStudents: data?.filter(s => 
              (s.tahfidz_progress?.percentage || 0) === 100 && 
      (s.tilawah_progress?.percentage || 0) === 100
    ).length || 0
  };
  
  // Group students by grade
  const groupedByGrade: Record<string, GroupedData> = {};
  
  if (data && data.length > 0) {
    for (const student of data) {
      const studentGrade = student.grade || 'Unknown';
      
      if (!groupedByGrade[studentGrade]) {
        groupedByGrade[studentGrade] = { students: [], classes: [] };
      }
      
      groupedByGrade[studentGrade].students.push(student);
      
      if (student.group_name && !groupedByGrade[studentGrade].classes.includes(student.group_name)) {
        groupedByGrade[studentGrade].classes.push(student.group_name);
      }
    }
    
    // Sort students alphabetically within each grade group
    Object.keys(groupedByGrade).forEach(grade => {
      groupedByGrade[grade].students.sort((a, b) => a.name.localeCompare(b.name));
      groupedByGrade[grade].classes.sort((a, b) => a.localeCompare(b));
    });
  }
  
  return {
    studentProgressData: data || [],
    summaryStats,
    groupedByGrade,
    isLoading: !error && !data,
    isRefreshing,
    isError: !!error,
    error,
    refresh,
  };
}; 
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { calculateHafalanProgress, calculateTilawahProgress } from '@/utils/progressCalculations';
import { useAuth } from '@/contexts/useAuth';
import { Database } from '@/integrations/supabase/types';

type Student = Database['public']['Tables']['students']['Row'];

interface ProgressEntry {
  id: string;
  date: string;
  type: string;
  surah_or_jilid: string | null;
  ayat_or_page: string | null;
  notes: string | null;
}

interface ProgressData {
  hafalan_progress: { percentage: number; last_surah: string | null } | null;
  tilawah_progress: { percentage: number; jilid: string | null } | null;
}

export const useStudentDetails = (id: string | undefined) => {
  const { profile } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [className, setClassName] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<ProgressData>({
    hafalan_progress: null,
    tilawah_progress: null
  });
  const [hafalanEntries, setHafalanEntries] = useState<ProgressEntry[]>([]);
  const [tilawahEntries, setTilawahEntries] = useState<ProgressEntry[]>([]);
  const [loadingStudent, setLoadingStudent] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(true);

  const fetchStudentData = useCallback(async () => {
    try {
      setLoadingStudent(true);
      if (!id || !profile) {
        setStudent(null);
        setClassName(null);
        return;
      }

      // Query includes parent_id to check access
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (studentError) throw studentError;

      // If no student found
      if (!studentData) {
        setStudent(null);
        setClassName(null);
        return;
      }

      setStudent(studentData);
      // Use group_name directly from studentData
      setClassName(studentData.group_name || null);

    } catch (error) {
      console.error('Error fetching student data:', error);
      setStudent(null);
      setClassName(null);
    } finally {
      setLoadingStudent(false);
    }
  }, [id, profile]);

  const fetchProgressEntries = useCallback(async () => {
    try {
      setLoadingProgress(true);
      // Only fetch progress if student exists
      if (!student) return;

      if (!id) return;
      
      console.log('Fetching progress entries for student:', id);
      
      const { data: entries, error } = await supabase
        .from('progress_entries')
        .select('*')
        .eq('student_id', id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching progress entries:', error);
        throw error;
      }

      console.log('Fetched progress entries:', entries);

      const hafalan = entries?.filter(entry => entry.type === 'hafalan') || [];
      const tilawah = entries?.filter(entry => entry.type === 'tilawah') || [];

      setHafalanEntries(hafalan);
      setTilawahEntries(tilawah);

      // Calculate dynamic progress
      const hafalanProgress = calculateHafalanProgress(hafalan);
      const tilawahProgress = calculateTilawahProgress(tilawah);

      setProgressData({
        hafalan_progress: hafalanProgress.percentage > 0 ? hafalanProgress : null,
        tilawah_progress: tilawahProgress.percentage > 0 ? tilawahProgress : null
      });

    } catch (error) {
      console.error('Error fetching progress entries:', error);
    } finally {
      setLoadingProgress(false);
    }
  }, [student, id]);

  const refetchData = () => {
    fetchStudentData();
    fetchProgressEntries();
  };

  useEffect(() => {
    if (id) {
      fetchStudentData();
    }
  }, [id, profile, fetchStudentData]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (student) {
      fetchProgressEntries();
    }
  }, [student, fetchProgressEntries]);

  return {
    student,
    className,
    progressData,
    hafalanEntries,
    tilawahEntries,
    loading: loadingStudent || loadingProgress,
    loadingStudent,
    loadingProgress,
    refetchData
  };
};

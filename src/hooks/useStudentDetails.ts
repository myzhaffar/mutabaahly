import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { calculateHafalanProgress, calculateTilawahProgress } from '@/utils/progressCalculations';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/types/supabase';

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
  const [progressData, setProgressData] = useState<ProgressData>({
    hafalan_progress: null,
    tilawah_progress: null
  });
  const [hafalanEntries, setHafalanEntries] = useState<ProgressEntry[]>([]);
  const [tilawahEntries, setTilawahEntries] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStudentData = async () => {
    try {
      if (!id || !profile) {
        setStudent(null);
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
        return;
      }

      // Set student data regardless of role
      setStudent(studentData);

    } catch (error) {
      console.error('Error fetching student data:', error);
      setStudent(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgressEntries = async () => {
    try {
      // Only fetch progress if student exists
      if (!student) return;

      const { data: entries, error } = await supabase
        .from('progress_entries')
        .select('*')
        .eq('student_id', id)
        .order('date', { ascending: false });

      if (error) throw error;

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

      // Only teachers can update progress in database
      if (profile.role === 'teacher') {
        if (hafalan.length > 0) {
          await supabase
            .from('hafalan_progress')
            .upsert({
              student_id: id,
              percentage: hafalanProgress.percentage,
              last_surah: hafalanProgress.last_surah,
              updated_at: new Date().toISOString()
            });
        }

        if (tilawah.length > 0) {
          await supabase
            .from('tilawah_progress')
            .upsert({
              student_id: id,
              percentage: tilawahProgress.percentage,
              jilid: tilawahProgress.jilid,
              updated_at: new Date().toISOString()
            });
        }
      }

    } catch (error) {
      console.error('Error fetching progress entries:', error);
    }
  };

  const refetchData = () => {
    fetchStudentData();
    fetchProgressEntries();
  };

  useEffect(() => {
    if (id) {
      fetchStudentData();
    }
  }, [id, profile]);

  useEffect(() => {
    if (student) {
      fetchProgressEntries();
    }
  }, [student]);

  return {
    student,
    progressData,
    hafalanEntries,
    tilawahEntries,
    loading,
    refetchData
  };
};

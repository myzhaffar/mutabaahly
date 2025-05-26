export interface ProgressEntry {
  id: string;
  student_id: string;
  date: string;
  type: string;
  surah_or_jilid: string | null;
  ayat_or_page: string | null;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ProgressData {
  hafalan_progress: { percentage: number; last_surah: string | null } | null;
  tilawah_progress: { percentage: number; jilid: string | null } | null;
} 
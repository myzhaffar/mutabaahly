// src/types/tilawati.ts

// Student information relevant for test management and dialogs
export type TilawatiJilid = 
  | "Level 1" | "Level 2" | "Level 3" | "Level 4" | "Level 5" | "Level 6"
  | "Ghorib" | "Tajwid" | "Quran" | "Evaluation";

export type TestStatus = 'scheduled' | 'passed' | 'failed' | 'pending_retake' | 'cancelled';

export interface StudentForTest {
  id: string;
  name: string;
  current_tilawati_jilid: TilawatiJilid;
  class_name: string;
  class_id?: string;
  teacher: string;
  progress_percentage?: number;
  is_eligible_for_test?: boolean;
}

// Represents a single Tilawati Level Test record
// This is the core type used for forms and database interaction
export interface TilawatiTest {
  id: string;
  date: string;
  student_id: string;
  student?: {
    name: string;
  };
  class_name: string;
  tilawati_level: TilawatiJilid;
  status: TestStatus;
  munaqisy: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TestFilters {
  status?: TestStatus | 'all';
  startDate?: string;
  endDate?: string;
  jilidLevel?: TilawatiJilid | 'all';
  searchTerm?: string;
}

export interface Student {
  id: string;
  name: string;
  current_tilawati_jilid?: TilawatiJilid;
  class_id?: string;
  class?: {
    name: string;
  };
  created_at: string;
  updated_at: string;
}

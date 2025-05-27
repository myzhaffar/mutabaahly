import { TilawatiJilid, TestStatus } from './tilawati';

export interface Database {
  public: {
    Tables: {
      students: {
        Row: {
          id: string;
          name: string;
          class_id: string | null;
          current_tilawati_jilid: TilawatiJilid | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          class_id?: string | null;
          current_tilawati_jilid?: TilawatiJilid | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          class_id?: string | null;
          current_tilawati_jilid?: TilawatiJilid | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tilawati_level_tests: {
        Row: {
          id: string;
          student_id: string;
          class_id: string | null;
          tilawati_level: TilawatiJilid;
          date: string;
          munaqisy: string;
          status: TestStatus;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          class_id?: string | null;
          tilawati_level: TilawatiJilid;
          date: string;
          munaqisy: string;
          status?: TestStatus;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          class_id?: string | null;
          tilawati_level?: TilawatiJilid;
          date?: string;
          munaqisy?: string;
          status?: TestStatus;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      classes: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      class_teachers: {
        Row: {
          id: string;
          class_id: string;
          teacher_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          teacher_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          teacher_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      test_status: TestStatus;
    };
  };
} 
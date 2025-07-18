export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      hafalan_progress: {
        Row: {
          created_at: string
          id: string
          last_surah: string | null
          percentage: number
          student_id: string
          total_surah: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_surah?: string | null
          percentage?: number
          student_id: string
          total_surah?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_surah?: string | null
          percentage?: number
          student_id?: string
          total_surah?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hafalan_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          role: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name: string
          id: string
          role?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      progress_entries: {
        Row: {
          ayat_or_page: string | null
          created_at: string
          date: string
          id: string
          notes: string | null
          student_id: string
          surah_or_jilid: string | null
          type: string
        }
        Insert: {
          ayat_or_page?: string | null
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          student_id: string
          surah_or_jilid?: string | null
          type: string
        }
        Update: {
          ayat_or_page?: string | null
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          student_id?: string
          surah_or_jilid?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_entries_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          created_at: string
          current_tilawati_jilid: string | null
          grade: string | null
          group_name: string
          id: string
          name: string
          parent_id: string | null
          photo: string | null
          teacher: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_tilawati_jilid?: string | null
          grade?: string | null
          group_name: string
          id?: string
          name: string
          parent_id?: string | null
          photo?: string | null
          teacher: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_tilawati_jilid?: string | null
          grade?: string | null
          group_name?: string
          id?: string
          name?: string
          parent_id?: string | null
          photo?: string | null
          teacher?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tilawah_progress: {
        Row: {
          created_at: string
          id: string
          jilid: string | null
          page: number | null
          percentage: number
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          jilid?: string | null
          page?: number | null
          percentage?: number
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          jilid?: string | null
          page?: number | null
          percentage?: number
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tilawah_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      tilawati_level_tests: {
        Row: {
          class_name: string
          created_at: string | null
          created_by: string | null
          date: string
          id: string
          munaqisy: string
          notes: string | null
          status: Database["public"]["Enums"]["test_status"]
          student_id: string
          tilawati_level: string
          updated_at: string | null
        }
        Insert: {
          class_name: string
          created_at?: string | null
          created_by?: string | null
          date: string
          id?: string
          munaqisy: string
          notes?: string | null
          status?: Database["public"]["Enums"]["test_status"]
          student_id: string
          tilawati_level: string
          updated_at?: string | null
        }
        Update: {
          class_name?: string
          created_at?: string | null
          created_by?: string | null
          date?: string
          id?: string
          munaqisy?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["test_status"]
          student_id?: string
          tilawati_level?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tilawati_level_tests_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_schedule_tilawati_test: {
        Args: { student_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      test_status:
        | "scheduled"
        | "passed"
        | "failed"
        | "pending_retake"
        | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      test_status: [
        "scheduled",
        "passed",
        "failed",
        "pending_retake",
        "cancelled",
      ],
    },
  },
} as const

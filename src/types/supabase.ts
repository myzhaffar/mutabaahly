export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
          created_at: string
          full_name: string
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          role?: string
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
          grade: string | null
          group_name: string
          id: string
          name: string
          photo: string | null
          teacher: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          grade?: string | null
          group_name: string
          id?: string
          name: string
          photo?: string | null
          teacher: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          grade?: string | null
          group_name?: string
          id?: string
          name?: string
          photo?: string | null
          teacher?: string
          updated_at?: string
        }
        Relationships: []
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
          id: string
          student_id: string
          current_jilid: string
          target_jilid: string
          test_date: string
          examiner_name: string | null
          status: 'scheduled' | 'passed' | 'failed' | 'pending_retake' | 'cancelled'
          score: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          current_jilid: string
          target_jilid: string
          test_date?: string
          examiner_name?: string | null
          status?: 'scheduled' | 'passed' | 'failed' | 'pending_retake' | 'cancelled'
          score?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          current_jilid?: string
          target_jilid?: string
          test_date?: string
          examiner_name?: string | null
          status?: 'scheduled' | 'passed' | 'failed' | 'pending_retake' | 'cancelled'
          score?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tilawati_level_tests_student_id_fkey"
            columns: ["student_id"]
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
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

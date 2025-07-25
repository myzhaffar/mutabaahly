-- Migration to further optimize database for improved loading times
-- This adds additional indexes for common query patterns

-- ============================================================
-- STEP 1: Add compound indexes for frequently joined tables
-- ============================================================

-- Add compound index for progress_entries by student_id and type (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_progress_entries_student_id_type_date ON public.progress_entries (student_id, type, date DESC);

-- Add compound index for tilawati_level_tests by student_id and date
CREATE INDEX IF NOT EXISTS idx_tilawati_level_tests_student_id_date ON public.tilawati_level_tests (student_id, date DESC);

-- Add index for students by group_name (for class filtering)
CREATE INDEX IF NOT EXISTS idx_students_group_name ON public.students (group_name);

-- Add index for students by teacher (for filtering by teacher)
CREATE INDEX IF NOT EXISTS idx_students_teacher ON public.students (teacher);

-- Add index for students by parent_id (for parent views)
CREATE INDEX IF NOT EXISTS idx_students_parent_id ON public.students (parent_id);

-- Add index for progress_entries by date (for sorting)
CREATE INDEX IF NOT EXISTS idx_progress_entries_date ON public.progress_entries (date DESC);

-- Add index for progress_entries by type (for filtering)
CREATE INDEX IF NOT EXISTS idx_progress_entries_type ON public.progress_entries (type);

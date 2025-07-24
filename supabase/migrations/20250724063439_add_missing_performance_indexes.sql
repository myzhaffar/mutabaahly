-- Migration to add missing indexes to foreign keys as suggested by Supabase Performance Advisor

-- Step 1: Add indexes to foreign keys in hafalan_progress table
CREATE INDEX IF NOT EXISTS idx_hafalan_progress_student_id ON public.hafalan_progress (student_id);
CREATE INDEX IF NOT EXISTS idx_hafalan_progress_teacher_id ON public.hafalan_progress (teacher_id);

-- Step 2: Add indexes to foreign keys in students table
CREATE INDEX IF NOT EXISTS idx_students_teacher_id ON public.students (teacher_id);
CREATE INDEX IF NOT EXISTS idx_students_grade ON public.students (grade);
CREATE INDEX IF NOT EXISTS idx_students_group_name ON public.students (group_name);

-- Step 3: Add indexes to foreign keys in tilawah_progress table
CREATE INDEX IF NOT EXISTS idx_tilawah_progress_student_id ON public.tilawah_progress (student_id);
CREATE INDEX IF NOT EXISTS idx_tilawah_progress_teacher_id ON public.tilawah_progress (teacher_id);

-- Step 4: Add indexes to foreign keys in tilawati_level_tests table
CREATE INDEX IF NOT EXISTS idx_tilawati_level_tests_student_id ON public.tilawati_level_tests (student_id);
CREATE INDEX IF NOT EXISTS idx_tilawati_level_tests_teacher_id ON public.tilawati_level_tests (teacher_id);

-- Step 5: Add indexes for the most common queries in progress_entries table
CREATE INDEX IF NOT EXISTS idx_progress_entries_student_id_type ON public.progress_entries (student_id, type);
CREATE INDEX IF NOT EXISTS idx_progress_entries_date ON public.progress_entries (date DESC);

-- Note: For the unused indexes on progress_entries that the Performance Advisor found,
-- we're not removing them yet until we can confirm they aren't needed by any queries.

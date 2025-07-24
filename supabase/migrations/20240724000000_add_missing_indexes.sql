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

-- Note: For the unused indexes on progress_entries, it's recommended to monitor the application
-- behavior after adding these indexes before removing any potentially unused ones,
-- as they might be used for specific queries not detected by the analyzer. 
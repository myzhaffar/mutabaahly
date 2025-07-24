-- Optimize RLS policies to fix performance issues
-- This migration replaces direct calls to auth.function() with (select auth.function())
-- to prevent unnecessary re-evaluation of RLS policies

-- ======= Table: hafalan_progress =======
-- Drop and recreate policies for hafalan_progress
DROP POLICY IF EXISTS "Teachers can view all hafalan progress" ON public.hafalan_progress;
CREATE POLICY "Teachers can view all hafalan progress" ON public.hafalan_progress
    FOR SELECT TO authenticated
    USING ((SELECT auth.role()) = 'authenticated' OR (SELECT auth.role()) = 'service_role');

-- ======= Table: tilawah_progress =======
-- Drop and recreate policies for tilawah_progress
DROP POLICY IF EXISTS "Teachers can view all tilawah progress" ON public.tilawah_progress;
CREATE POLICY "Teachers can view all tilawah progress" ON public.tilawah_progress
    FOR SELECT TO authenticated
    USING ((SELECT auth.role()) = 'authenticated' OR (SELECT auth.role()) = 'service_role');

-- ======= Table: progress_entries =======
-- Drop and recreate policies for progress_entries
DROP POLICY IF EXISTS "Allow authenticated users to view progress entries" ON progress_entries;
CREATE POLICY "Allow authenticated users to view progress entries" ON progress_entries
    FOR SELECT
    TO authenticated
    USING ((SELECT auth.role()) = 'authenticated' OR (SELECT auth.role()) = 'service_role');

DROP POLICY IF EXISTS "Allow authenticated users to insert progress entries" ON progress_entries;
CREATE POLICY "Allow authenticated users to insert progress entries" ON progress_entries
    FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.role()) = 'authenticated' OR (SELECT auth.role()) = 'service_role');

DROP POLICY IF EXISTS "Allow authenticated users to update progress entries" ON progress_entries;
CREATE POLICY "Allow authenticated users to update progress entries" ON progress_entries
    FOR UPDATE
    TO authenticated
    USING ((SELECT auth.role()) = 'authenticated' OR (SELECT auth.role()) = 'service_role');

DROP POLICY IF EXISTS "Allow authenticated users to delete progress entries" ON progress_entries;
CREATE POLICY "Allow authenticated users to delete progress entries" ON progress_entries
    FOR DELETE
    TO authenticated
    USING ((SELECT auth.role()) = 'authenticated' OR (SELECT auth.role()) = 'service_role');

-- ======= Table: students =======
-- Drop and recreate policies for students
DROP POLICY IF EXISTS "Teachers can view all students" ON public.students;
CREATE POLICY "Teachers can view all students" ON public.students
    FOR SELECT TO authenticated
    USING ((SELECT auth.role()) = 'authenticated' OR (SELECT auth.role()) = 'service_role');

DROP POLICY IF EXISTS "Teachers can insert students" ON public.students;
CREATE POLICY "Teachers can insert students" ON public.students
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT auth.role()) = 'authenticated' OR (SELECT auth.role()) = 'service_role');

DROP POLICY IF EXISTS "Teachers can update students" ON public.students;
CREATE POLICY "Teachers can update students" ON public.students
    FOR UPDATE TO authenticated
    USING ((SELECT auth.role()) = 'authenticated' OR (SELECT auth.role()) = 'service_role');

DROP POLICY IF EXISTS "Teachers can delete students" ON public.students;
CREATE POLICY "Teachers can delete students" ON public.students
    FOR DELETE TO authenticated
    USING ((SELECT auth.role()) = 'authenticated' OR (SELECT auth.role()) = 'service_role');

-- Re-establish RLS on all tables (just in case)
ALTER TABLE public.hafalan_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tilawah_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

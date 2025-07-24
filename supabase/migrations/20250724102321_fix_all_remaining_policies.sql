-- Fix for any remaining RLS policies causing performance issues
-- This migration ensures all policies are using (SELECT auth.function()) instead of direct auth.function() calls

-- ====================================================
-- Fix for tilawah_progress policies
-- ====================================================
DROP POLICY IF EXISTS "Teachers can manage tilawah progress" ON public.tilawah_progress;
DROP POLICY IF EXISTS "tilawah_progress_access" ON public.tilawah_progress;

CREATE POLICY "tilawah_progress_access" ON public.tilawah_progress
    AS PERMISSIVE
    FOR ALL
    TO authenticated
    USING (
        -- Teachers can access all records (optimized)
        ((SELECT auth.jwt() ->> 'role') = 'teacher')
        OR
        -- Parents can only view their children's records (optimized)
        ((SELECT auth.jwt() ->> 'role') = 'parent' AND EXISTS (
            SELECT 1 FROM public.students s
            WHERE s.id = public.tilawah_progress.student_id
            AND s.parent_id = (SELECT auth.uid())
        ))
    )
    WITH CHECK (
        -- Only teachers can modify (optimized)
        (SELECT auth.jwt() ->> 'role') = 'teacher'
    );

CREATE POLICY "Service role access to tilawah_progress" ON public.tilawah_progress
    AS PERMISSIVE
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ====================================================
-- Fix for progress_entries policies
-- ====================================================
DROP POLICY IF EXISTS "Teachers can manage progress entries" ON public.progress_entries;
DROP POLICY IF EXISTS "progress_entries_access" ON public.progress_entries;

CREATE POLICY "progress_entries_access" ON public.progress_entries
    AS PERMISSIVE
    FOR ALL
    TO authenticated
    USING (
        -- Teachers can access all records (optimized)
        ((SELECT auth.jwt() ->> 'role') = 'teacher')
        OR
        -- Parents can only view their children's records (optimized)
        ((SELECT auth.jwt() ->> 'role') = 'parent' AND EXISTS (
            SELECT 1 FROM public.students s
            WHERE s.id = public.progress_entries.student_id
            AND s.parent_id = (SELECT auth.uid())
        ))
    )
    WITH CHECK (
        -- Only teachers can modify (optimized)
        (SELECT auth.jwt() ->> 'role') = 'teacher'
    );

CREATE POLICY "Service role access to progress_entries" ON public.progress_entries
    AS PERMISSIVE
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ====================================================
-- Fix for students policies
-- ====================================================
DROP POLICY IF EXISTS "Teachers can manage students" ON public.students;
DROP POLICY IF EXISTS "students_access" ON public.students;

CREATE POLICY "students_access" ON public.students
    AS PERMISSIVE
    FOR ALL
    TO authenticated
    USING (
        -- Teachers can access all records (optimized)
        ((SELECT auth.jwt() ->> 'role') = 'teacher')
        OR
        -- Parents can only view their children (optimized)
        ((SELECT auth.jwt() ->> 'role') = 'parent' AND parent_id = (SELECT auth.uid()))
    )
    WITH CHECK (
        -- Only teachers can modify (optimized)
        (SELECT auth.jwt() ->> 'role') = 'teacher'
    );

CREATE POLICY "Service role access to students" ON public.students
    AS PERMISSIVE
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ====================================================
-- Fix for tilawati_level_tests policies
-- ====================================================
DROP POLICY IF EXISTS "Teachers can manage tests" ON public.tilawati_level_tests;
DROP POLICY IF EXISTS "tilawati_tests_access" ON public.tilawati_level_tests;

CREATE POLICY "tilawati_tests_access" ON public.tilawati_level_tests
    AS PERMISSIVE
    FOR ALL
    TO authenticated
    USING (
        -- Teachers can access all records (optimized)
        ((SELECT auth.jwt() ->> 'role') = 'teacher')
        OR
        -- Parents can only view their children's tests (optimized)
        ((SELECT auth.jwt() ->> 'role') = 'parent' AND EXISTS (
            SELECT 1 FROM public.students s
            WHERE s.id = public.tilawati_level_tests.student_id
            AND s.parent_id = (SELECT auth.uid())
        ))
    )
    WITH CHECK (
        -- Only teachers can modify (optimized)
        (SELECT auth.jwt() ->> 'role') = 'teacher'
    );

CREATE POLICY "Service role access to tilawati_level_tests" ON public.tilawati_level_tests
    AS PERMISSIVE
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Ensure RLS is enabled on all tables
ALTER TABLE public.tilawah_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tilawati_level_tests ENABLE ROW LEVEL SECURITY;

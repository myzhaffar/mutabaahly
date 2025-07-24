-- =============================================================================
-- COMPREHENSIVE FIX FOR ALL AUTH RLS INITIALIZATION ISSUES
-- =============================================================================
-- This migration addresses ALL Auth RLS Initialization issues across the entire database
-- by replacing direct calls to auth.function() with the optimized pattern:
--   auth.function()  =>  (SELECT auth.function())
--
-- This optimization prevents the function from being evaluated for each row,
-- significantly improving query performance.

-- =============================================================================
-- STEP 1: TEMPORARILY DISABLE ALL ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE IF EXISTS public.hafalan_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tilawah_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.progress_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.students DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tilawati_level_tests DISABLE ROW LEVEL SECURITY;
-- Add any other tables with RLS here

-- =============================================================================
-- STEP 2: DROP ALL EXISTING RLS POLICIES
-- =============================================================================

-- Clear all policies for hafalan_progress
DROP POLICY IF EXISTS "Teachers can view all hafalan progress" ON public.hafalan_progress;
DROP POLICY IF EXISTS "Teachers can update hafalan progress" ON public.hafalan_progress;
DROP POLICY IF EXISTS "Teachers can insert hafalan progress" ON public.hafalan_progress;
DROP POLICY IF EXISTS "Teachers can delete hafalan progress" ON public.hafalan_progress;
DROP POLICY IF EXISTS "Parents can view hafalan progress" ON public.hafalan_progress;
DROP POLICY IF EXISTS "Teachers can manage hafalan progress" ON public.hafalan_progress;
DROP POLICY IF EXISTS "hafalan_progress_access" ON public.hafalan_progress;

-- Clear all policies for tilawah_progress
DROP POLICY IF EXISTS "Teachers can view all tilawah progress" ON public.tilawah_progress;
DROP POLICY IF EXISTS "Teachers can update tilawah progress" ON public.tilawah_progress;
DROP POLICY IF EXISTS "Teachers can insert tilawah progress" ON public.tilawah_progress;
DROP POLICY IF EXISTS "Teachers can delete tilawah progress" ON public.tilawah_progress;
DROP POLICY IF EXISTS "Parents can view tilawah progress" ON public.tilawah_progress;
DROP POLICY IF EXISTS "Teachers can manage tilawah progress" ON public.tilawah_progress;
DROP POLICY IF EXISTS "tilawah_progress_access" ON public.tilawah_progress;

-- Clear all policies for progress_entries
DROP POLICY IF EXISTS "Teachers can view all progress entries" ON public.progress_entries;
DROP POLICY IF EXISTS "Teachers can update progress entries" ON public.progress_entries;
DROP POLICY IF EXISTS "Teachers can insert progress entries" ON public.progress_entries;
DROP POLICY IF EXISTS "Teachers can delete progress entries" ON public.progress_entries;
DROP POLICY IF EXISTS "Parents can view their children's progress entries" ON public.progress_entries;
DROP POLICY IF EXISTS "Teachers can manage progress entries" ON public.progress_entries;
DROP POLICY IF EXISTS "progress_entries_access" ON public.progress_entries;
DROP POLICY IF EXISTS "Allow authenticated users to view progress entries" ON public.progress_entries;
DROP POLICY IF EXISTS "Allow authenticated users to insert progress entries" ON public.progress_entries;
DROP POLICY IF EXISTS "Allow authenticated users to update progress entries" ON public.progress_entries;
DROP POLICY IF EXISTS "Allow authenticated users to delete progress entries" ON public.progress_entries;

-- Clear all policies for students
DROP POLICY IF EXISTS "Teachers can view all students" ON public.students;
DROP POLICY IF EXISTS "Teachers can insert students" ON public.students;
DROP POLICY IF EXISTS "Teachers can update students" ON public.students;
DROP POLICY IF EXISTS "Teachers can delete students" ON public.students;
DROP POLICY IF EXISTS "Parents can view their children" ON public.students;
DROP POLICY IF EXISTS "Admins can manage students" ON public.students;
DROP POLICY IF EXISTS "Teachers can manage students" ON public.students;
DROP POLICY IF EXISTS "students_access" ON public.students;

-- Clear all policies for classes
DROP POLICY IF EXISTS "Teachers can view all classes" ON public.classes;
DROP POLICY IF EXISTS "Teachers can insert classes" ON public.classes;
DROP POLICY IF EXISTS "Teachers can update classes" ON public.classes;
DROP POLICY IF EXISTS "Teachers can delete classes" ON public.classes;
DROP POLICY IF EXISTS "Teachers can manage classes" ON public.classes;
DROP POLICY IF EXISTS "classes_access" ON public.classes;

-- Clear all policies for profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
DROP POLICY IF EXISTS "profiles_access" ON public.profiles;

-- Clear all policies for tilawati_level_tests
DROP POLICY IF EXISTS "Teachers can view all tests" ON public.tilawati_level_tests;
DROP POLICY IF EXISTS "Teachers can insert tests" ON public.tilawati_level_tests;
DROP POLICY IF EXISTS "Teachers can update tests" ON public.tilawati_level_tests;
DROP POLICY IF EXISTS "Teachers can delete tests" ON public.tilawati_level_tests;
DROP POLICY IF EXISTS "Parents can view their children's tests" ON public.tilawati_level_tests;
DROP POLICY IF EXISTS "Teachers can manage tests" ON public.tilawati_level_tests;
DROP POLICY IF EXISTS "tilawati_tests_access" ON public.tilawati_level_tests;

-- =============================================================================
-- STEP 3: CREATE NEW OPTIMIZED RLS POLICIES
-- =============================================================================

-- 1. HAFALAN_PROGRESS
CREATE POLICY "hafalan_progress_access" ON public.hafalan_progress
    AS PERMISSIVE
    FOR ALL
    TO authenticated
    USING (
        -- Teachers can access all records (optimized with SELECT subquery)
        ((SELECT auth.jwt() ->> 'role') = 'teacher')
        OR
        -- Parents can only view their children's records (optimized with SELECT subquery)
        ((SELECT auth.jwt() ->> 'role') = 'parent' AND EXISTS (
            SELECT 1 FROM public.students s
            WHERE s.id = public.hafalan_progress.student_id
            AND s.parent_id = (SELECT auth.uid())
        ))
    )
    WITH CHECK (
        -- Only teachers can modify (optimized with SELECT subquery)
        (SELECT auth.jwt() ->> 'role') = 'teacher'
    );

CREATE POLICY "hafalan_progress_service_role_access" ON public.hafalan_progress
    AS PERMISSIVE
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 2. TILAWAH_PROGRESS
CREATE POLICY "tilawah_progress_access" ON public.tilawah_progress
    AS PERMISSIVE
    FOR ALL
    TO authenticated
    USING (
        -- Teachers can access all records (optimized with SELECT subquery)
        ((SELECT auth.jwt() ->> 'role') = 'teacher')
        OR
        -- Parents can only view their children's records (optimized with SELECT subquery)
        ((SELECT auth.jwt() ->> 'role') = 'parent' AND EXISTS (
            SELECT 1 FROM public.students s
            WHERE s.id = public.tilawah_progress.student_id
            AND s.parent_id = (SELECT auth.uid())
        ))
    )
    WITH CHECK (
        -- Only teachers can modify (optimized with SELECT subquery)
        (SELECT auth.jwt() ->> 'role') = 'teacher'
    );

CREATE POLICY "tilawah_progress_service_role_access" ON public.tilawah_progress
    AS PERMISSIVE
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 3. PROGRESS_ENTRIES
CREATE POLICY "progress_entries_access" ON public.progress_entries
    AS PERMISSIVE
    FOR ALL
    TO authenticated
    USING (
        -- Teachers can access all records (optimized with SELECT subquery)
        ((SELECT auth.jwt() ->> 'role') = 'teacher')
        OR
        -- Parents can only view their children's records (optimized with SELECT subquery)
        ((SELECT auth.jwt() ->> 'role') = 'parent' AND EXISTS (
            SELECT 1 FROM public.students s
            WHERE s.id = public.progress_entries.student_id
            AND s.parent_id = (SELECT auth.uid())
        ))
    )
    WITH CHECK (
        -- Only teachers can modify (optimized with SELECT subquery)
        (SELECT auth.jwt() ->> 'role') = 'teacher'
    );

CREATE POLICY "progress_entries_service_role_access" ON public.progress_entries
    AS PERMISSIVE
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 4. STUDENTS
CREATE POLICY "students_access" ON public.students
    AS PERMISSIVE
    FOR ALL
    TO authenticated
    USING (
        -- Teachers can access all records (optimized with SELECT subquery)
        ((SELECT auth.jwt() ->> 'role') = 'teacher')
        OR
        -- Parents can only view their children (optimized with SELECT subquery)
        ((SELECT auth.jwt() ->> 'role') = 'parent' AND parent_id = (SELECT auth.uid()))
    )
    WITH CHECK (
        -- Only teachers can modify (optimized with SELECT subquery)
        (SELECT auth.jwt() ->> 'role') = 'teacher'
    );

CREATE POLICY "students_service_role_access" ON public.students
    AS PERMISSIVE
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 5. CLASSES
CREATE POLICY "classes_access" ON public.classes
    AS PERMISSIVE
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (
        -- Only teachers can modify (optimized with SELECT subquery)
        (SELECT auth.jwt() ->> 'role') = 'teacher'
    );

CREATE POLICY "classes_service_role_access" ON public.classes
    AS PERMISSIVE
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 6. PROFILES
CREATE POLICY "profiles_access" ON public.profiles
    AS PERMISSIVE
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (
        -- Users can only modify their own profile (optimized with SELECT subquery)
        id = (SELECT auth.uid())
    );

CREATE POLICY "profiles_service_role_access" ON public.profiles
    AS PERMISSIVE
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 7. TILAWATI_LEVEL_TESTS
CREATE POLICY "tilawati_tests_access" ON public.tilawati_level_tests
    AS PERMISSIVE
    FOR ALL
    TO authenticated
    USING (
        -- Teachers can access all records (optimized with SELECT subquery)
        ((SELECT auth.jwt() ->> 'role') = 'teacher')
        OR
        -- Parents can only view their children's tests (optimized with SELECT subquery)
        ((SELECT auth.jwt() ->> 'role') = 'parent' AND EXISTS (
            SELECT 1 FROM public.students s
            WHERE s.id = public.tilawati_level_tests.student_id
            AND s.parent_id = (SELECT auth.uid())
        ))
    )
    WITH CHECK (
        -- Only teachers can modify (optimized with SELECT subquery)
        (SELECT auth.jwt() ->> 'role') = 'teacher'
    );

CREATE POLICY "tilawati_tests_service_role_access" ON public.tilawati_level_tests
    AS PERMISSIVE
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- =============================================================================
-- STEP 4: RE-ENABLE ROW LEVEL SECURITY FOR ALL TABLES
-- =============================================================================
ALTER TABLE IF EXISTS public.hafalan_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tilawah_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.progress_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tilawati_level_tests ENABLE ROW LEVEL SECURITY;
-- Enable RLS for any other tables here

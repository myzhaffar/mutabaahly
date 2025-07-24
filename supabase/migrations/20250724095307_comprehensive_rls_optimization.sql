-- Comprehensive optimization for RLS policies to address all warnings
-- This migration:
-- 1. Consolidates multiple permissive policies into single policies where possible
-- 2. Optimizes all RLS policies to use (SELECT auth.function()) pattern
-- 3. Cleans up any redundant policies

-- ============================================================
-- STEP 1: Temporarily disable RLS to avoid errors during updates
-- ============================================================
ALTER TABLE public.hafalan_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tilawah_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.students DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tilawati_level_tests DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 2: Remove all existing policies to start with a clean slate
-- ============================================================

-- hafalan_progress policies
DROP POLICY IF EXISTS "Teachers can view all hafalan progress" ON public.hafalan_progress;
DROP POLICY IF EXISTS "Teachers can update hafalan progress" ON public.hafalan_progress;
DROP POLICY IF EXISTS "Teachers can insert hafalan progress" ON public.hafalan_progress;
DROP POLICY IF EXISTS "Teachers can delete hafalan progress" ON public.hafalan_progress;
DROP POLICY IF EXISTS "Parents can view hafalan progress" ON public.hafalan_progress;

-- tilawah_progress policies
DROP POLICY IF EXISTS "Teachers can view all tilawah progress" ON public.tilawah_progress;
DROP POLICY IF EXISTS "Teachers can update tilawah progress" ON public.tilawah_progress;
DROP POLICY IF EXISTS "Teachers can insert tilawah progress" ON public.tilawah_progress;
DROP POLICY IF EXISTS "Teachers can delete tilawah progress" ON public.tilawah_progress;
DROP POLICY IF EXISTS "Parents can view tilawah progress" ON public.tilawah_progress;

-- progress_entries policies
DROP POLICY IF EXISTS "Allow authenticated users to view progress entries" ON public.progress_entries;
DROP POLICY IF EXISTS "Allow authenticated users to insert progress entries" ON public.progress_entries;
DROP POLICY IF EXISTS "Allow authenticated users to update progress entries" ON public.progress_entries;
DROP POLICY IF EXISTS "Allow authenticated users to delete progress entries" ON public.progress_entries;
DROP POLICY IF EXISTS "Teachers can view all progress entries" ON public.progress_entries;
DROP POLICY IF EXISTS "Teachers can update progress entries" ON public.progress_entries;
DROP POLICY IF EXISTS "Teachers can insert progress entries" ON public.progress_entries;
DROP POLICY IF EXISTS "Teachers can delete progress entries" ON public.progress_entries;
DROP POLICY IF EXISTS "Parents can view their children's progress entries" ON public.progress_entries;

-- students policies
DROP POLICY IF EXISTS "Teachers can view all students" ON public.students;
DROP POLICY IF EXISTS "Teachers can insert students" ON public.students;
DROP POLICY IF EXISTS "Teachers can update students" ON public.students;
DROP POLICY IF EXISTS "Teachers can delete students" ON public.students;
DROP POLICY IF EXISTS "Parents can view their children" ON public.students;
DROP POLICY IF EXISTS "Admins can manage students" ON public.students;

-- classes policies
DROP POLICY IF EXISTS "Teachers can view all classes" ON public.classes;
DROP POLICY IF EXISTS "Teachers can insert classes" ON public.classes;
DROP POLICY IF EXISTS "Teachers can update classes" ON public.classes;
DROP POLICY IF EXISTS "Teachers can delete classes" ON public.classes;

-- profiles policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;

-- tilawati_level_tests policies
DROP POLICY IF EXISTS "Teachers can view all tests" ON public.tilawati_level_tests;
DROP POLICY IF EXISTS "Teachers can insert tests" ON public.tilawati_level_tests;
DROP POLICY IF EXISTS "Teachers can update tests" ON public.tilawati_level_tests;
DROP POLICY IF EXISTS "Teachers can delete tests" ON public.tilawati_level_tests;
DROP POLICY IF EXISTS "Parents can view their children's tests" ON public.tilawati_level_tests;

-- ============================================================
-- STEP 3: Create consolidated and optimized policies
-- ============================================================

-- Optimized hafalan_progress policies
CREATE POLICY "hafalan_progress_access" ON public.hafalan_progress
    AS PERMISSIVE
    FOR ALL
    TO authenticated
    USING (
        -- Teachers can access all records
        ((SELECT auth.jwt() ->> 'role') = 'teacher')
        OR
        -- Parents can only view their children's records
        ((SELECT auth.jwt() ->> 'role') = 'parent' AND EXISTS (
            SELECT 1 FROM public.students s
            WHERE s.id = public.hafalan_progress.student_id
            AND s.parent_id = (SELECT auth.uid())
        ))
    )
    WITH CHECK (
        -- Only teachers can modify
        (SELECT auth.jwt() ->> 'role') = 'teacher'
    );

-- Optimized tilawah_progress policies
CREATE POLICY "tilawah_progress_access" ON public.tilawah_progress
    AS PERMISSIVE
    FOR ALL
    TO authenticated
    USING (
        -- Teachers can access all records
        ((SELECT auth.jwt() ->> 'role') = 'teacher')
        OR
        -- Parents can only view their children's records
        ((SELECT auth.jwt() ->> 'role') = 'parent' AND EXISTS (
            SELECT 1 FROM public.students s
            WHERE s.id = public.tilawah_progress.student_id
            AND s.parent_id = (SELECT auth.uid())
        ))
    )
    WITH CHECK (
        -- Only teachers can modify
        (SELECT auth.jwt() ->> 'role') = 'teacher'
    );

-- Optimized progress_entries policies
CREATE POLICY "progress_entries_access" ON public.progress_entries
    AS PERMISSIVE
    FOR ALL
    TO authenticated
    USING (
        -- Teachers can access all records
        ((SELECT auth.jwt() ->> 'role') = 'teacher')
        OR
        -- Parents can only view their children's records
        ((SELECT auth.jwt() ->> 'role') = 'parent' AND EXISTS (
            SELECT 1 FROM public.students s
            WHERE s.id = public.progress_entries.student_id
            AND s.parent_id = (SELECT auth.uid())
        ))
    )
    WITH CHECK (
        -- Only teachers can modify
        (SELECT auth.jwt() ->> 'role') = 'teacher'
    );

-- Optimized students policies
CREATE POLICY "students_access" ON public.students
    AS PERMISSIVE
    FOR ALL
    TO authenticated
    USING (
        -- Teachers can access all records
        ((SELECT auth.jwt() ->> 'role') = 'teacher')
        OR
        -- Parents can only view their children
        ((SELECT auth.jwt() ->> 'role') = 'parent' AND parent_id = (SELECT auth.uid()))
    )
    WITH CHECK (
        -- Only teachers can modify
        (SELECT auth.jwt() ->> 'role') = 'teacher'
    );

-- Optimized classes policies
CREATE POLICY "classes_access" ON public.classes
    AS PERMISSIVE
    FOR ALL
    TO authenticated
    USING (true) -- Everyone can view classes
    WITH CHECK (
        -- Only teachers can modify
        (SELECT auth.jwt() ->> 'role') = 'teacher'
    );

-- Optimized profiles policies
CREATE POLICY "profiles_access" ON public.profiles
    AS PERMISSIVE
    FOR ALL
    TO authenticated
    USING (true) -- Everyone can view profiles
    WITH CHECK (
        -- Users can only modify their own profile
        id = (SELECT auth.uid())
    );

-- Optimized tilawati_level_tests policies
CREATE POLICY "tilawati_tests_access" ON public.tilawati_level_tests
    AS PERMISSIVE
    FOR ALL
    TO authenticated
    USING (
        -- Teachers can access all records
        ((SELECT auth.jwt() ->> 'role') = 'teacher')
        OR
        -- Parents can only view their children's tests
        ((SELECT auth.jwt() ->> 'role') = 'parent' AND EXISTS (
            SELECT 1 FROM public.students s
            WHERE s.id = public.tilawati_level_tests.student_id
            AND s.parent_id = (SELECT auth.uid())
        ))
    )
    WITH CHECK (
        -- Only teachers can modify
        (SELECT auth.jwt() ->> 'role') = 'teacher'
    );

-- ============================================================
-- STEP 4: Re-enable RLS on all tables
-- ============================================================
ALTER TABLE public.hafalan_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tilawah_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tilawati_level_tests ENABLE ROW LEVEL SECURITY;

-- Fix for hafalan_progress policy causing performance issues
-- This migration specifically addresses the "Teachers can manage hafalan progress" policy
-- which is still using direct calls to auth functions causing performance issues

-- Step 1: Drop the problematic policy
DROP POLICY IF EXISTS "Teachers can manage hafalan progress" ON public.hafalan_progress;
DROP POLICY IF EXISTS "hafalan_progress_access" ON public.hafalan_progress;

-- Step 2: Create a new, optimized policy
-- Using the pattern (SELECT auth.function()) instead of direct auth.function() calls
CREATE POLICY "hafalan_progress_access" ON public.hafalan_progress
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
            WHERE s.id = public.hafalan_progress.student_id
            AND s.parent_id = (SELECT auth.uid())
        ))
    )
    WITH CHECK (
        -- Only teachers can modify (optimized)
        (SELECT auth.jwt() ->> 'role') = 'teacher'
    );

-- Additional policy for any other role-based access that might be needed
CREATE POLICY "Service role access to hafalan_progress" ON public.hafalan_progress
    AS PERMISSIVE
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE public.hafalan_progress ENABLE ROW LEVEL SECURITY;

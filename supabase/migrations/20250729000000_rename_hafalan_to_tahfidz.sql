-- Migration to rename hafalan references to tahfidz in database
-- This migration renames the hafalan_progress table and related structures to tahfidz_progress

-- Step 1: Drop existing indexes on hafalan_progress table
DROP INDEX IF EXISTS idx_hafalan_progress_student_id;
DROP INDEX IF EXISTS idx_hafalan_progress_teacher_id;

-- Step 2: Rename the hafalan_progress table to tahfidz_progress
ALTER TABLE public.hafalan_progress RENAME TO tahfidz_progress;

-- Step 3: Rename the foreign key constraint
ALTER TABLE public.tahfidz_progress 
DROP CONSTRAINT IF EXISTS hafalan_progress_student_id_fkey;

ALTER TABLE public.tahfidz_progress 
ADD CONSTRAINT tahfidz_progress_student_id_fkey 
FOREIGN KEY (student_id) REFERENCES public.students(id);

-- Step 4: Recreate indexes with new names
CREATE INDEX IF NOT EXISTS idx_tahfidz_progress_student_id ON public.tahfidz_progress (student_id);
CREATE INDEX IF NOT EXISTS idx_tahfidz_progress_teacher_id ON public.tahfidz_progress (teacher_id);

-- Step 5: Update the type constraint in progress_entries table
-- Note: We keep 'hafalan' as the type value for backward compatibility with existing data
-- The UI will display 'Tahfidz' but the database will store 'hafalan'
-- This is intentional to avoid breaking existing data

-- Step 6: Update RLS policies if they exist
-- Drop existing policies on the old table name
DROP POLICY IF EXISTS "hafalan_progress_access" ON public.tahfidz_progress;
DROP POLICY IF EXISTS "hafalan_progress_select_policy" ON public.tahfidz_progress;

-- Create new policies with tahfidz naming
CREATE POLICY "tahfidz_progress_access" ON public.tahfidz_progress
    AS PERMISSIVE
    FOR ALL
    TO authenticated
    USING (
        ((SELECT auth.jwt() ->> 'role') = 'teacher')
        OR
        ((SELECT auth.jwt() ->> 'role') = 'parent' AND EXISTS (
            SELECT 1 FROM public.students s
            WHERE s.id = public.tahfidz_progress.student_id
            AND s.parent_id = (SELECT auth.uid())
        ))
    )
    WITH CHECK (
        (SELECT auth.jwt() ->> 'role') = 'teacher'
    );

-- Step 7: Enable RLS on the renamed table
ALTER TABLE public.tahfidz_progress ENABLE ROW LEVEL SECURITY; 
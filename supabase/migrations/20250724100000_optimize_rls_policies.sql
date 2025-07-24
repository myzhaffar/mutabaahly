-- Migration to optimize Row Level Security (RLS) policies to address Auth RLS Initialization Plan warnings

-- Step 1: Create a function to check user roles more efficiently
CREATE OR REPLACE FUNCTION auth.is_teacher()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT role = 'teacher' FROM auth.users JOIN public.profiles ON id = auth.users.id WHERE auth.users.id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth.is_parent()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT role = 'parent' FROM auth.users JOIN public.profiles ON id = auth.users.id WHERE auth.users.id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create indexes to speed up RLS policy checks
CREATE INDEX IF NOT EXISTS idx_auth_user_role ON public.profiles (id, role);

-- Step 3: Optimize RLS policies for hafalan_progress table
DROP POLICY IF EXISTS "Teachers can see hafalan progress" ON public.hafalan_progress;
CREATE POLICY "Teachers can see hafalan progress" 
ON public.hafalan_progress
FOR SELECT 
USING (auth.is_teacher());

DROP POLICY IF EXISTS "Parents can see their children's hafalan progress" ON public.hafalan_progress;
CREATE POLICY "Parents can see their children's hafalan progress" 
ON public.hafalan_progress
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.students 
    WHERE students.id = hafalan_progress.student_id 
    AND students.parent_id = auth.uid()
  )
);

-- Step 4: Optimize RLS policies for tilawah_progress table
DROP POLICY IF EXISTS "Teachers can see tilawah progress" ON public.tilawah_progress;
CREATE POLICY "Teachers can see tilawah progress" 
ON public.tilawah_progress
FOR SELECT 
USING (auth.is_teacher());

DROP POLICY IF EXISTS "Parents can see their children's tilawah progress" ON public.tilawah_progress;
CREATE POLICY "Parents can see their children's tilawah progress" 
ON public.tilawah_progress
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.students 
    WHERE students.id = tilawah_progress.student_id 
    AND students.parent_id = auth.uid()
  )
);

-- Step 5: Optimize RLS policies for progress_entries table
DROP POLICY IF EXISTS "Teachers can see progress entries" ON public.progress_entries;
CREATE POLICY "Teachers can see progress entries" 
ON public.progress_entries
FOR SELECT 
USING (auth.is_teacher());

DROP POLICY IF EXISTS "Parents can see their children's progress entries" ON public.progress_entries;
CREATE POLICY "Parents can see their children's progress entries" 
ON public.progress_entries
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.students 
    WHERE students.id = progress_entries.student_id 
    AND students.parent_id = auth.uid()
  )
);

-- Step 6: Optimize RLS policies for students table
DROP POLICY IF EXISTS "Teachers can see students" ON public.students;
CREATE POLICY "Teachers can see students" 
ON public.students
FOR SELECT 
USING (auth.is_teacher());

DROP POLICY IF EXISTS "Parents can see their children" ON public.students;
CREATE POLICY "Parents can see their children" 
ON public.students
FOR SELECT 
USING (students.parent_id = auth.uid());

-- Create additional indexes to optimize the EXISTS subqueries in RLS policies
CREATE INDEX IF NOT EXISTS idx_students_parent_id ON public.students (parent_id);
CREATE INDEX IF NOT EXISTS idx_progress_entries_student_id ON public.progress_entries (student_id); 
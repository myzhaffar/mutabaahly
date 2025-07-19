-- Temporarily simplify RLS policies for testing
-- Drop existing policies
DROP POLICY IF EXISTS "Teachers can view progress entries" ON progress_entries;
DROP POLICY IF EXISTS "Teachers can insert progress entries" ON progress_entries;
DROP POLICY IF EXISTS "Teachers can update progress entries" ON progress_entries;
DROP POLICY IF EXISTS "Teachers can delete progress entries" ON progress_entries;
DROP POLICY IF EXISTS "Parents can view their children's progress" ON progress_entries;

-- Create simplified policies for testing
CREATE POLICY "Allow authenticated users to view progress entries" ON progress_entries
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to insert progress entries" ON progress_entries
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update progress entries" ON progress_entries
    FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to delete progress entries" ON progress_entries
    FOR DELETE
    TO authenticated
    USING (true); 
-- Create progress_entries table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS progress_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('hafalan', 'tilawah')),
    date DATE NOT NULL,
    surah_or_jilid TEXT,
    ayat_or_page TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_progress_entries_student ON progress_entries(student_id);
CREATE INDEX IF NOT EXISTS idx_progress_entries_type ON progress_entries(type);
CREATE INDEX IF NOT EXISTS idx_progress_entries_date ON progress_entries(date);

-- Add RLS policies (only if not already enabled)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'progress_entries' AND schemaname = 'public') THEN
        ALTER TABLE progress_entries ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Create RLS policies (only if they don't exist)
DO $$ 
BEGIN
    -- Teachers can view and manage progress entries for their students
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'progress_entries' AND policyname = 'Teachers can view progress entries') THEN
        CREATE POLICY "Teachers can view progress entries" ON progress_entries
            FOR SELECT
            TO authenticated
            USING (
                student_id IN (
                    SELECT id 
                    FROM students 
                    WHERE teacher = (SELECT full_name FROM profiles WHERE id = auth.uid())
                )
            );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'progress_entries' AND policyname = 'Teachers can insert progress entries') THEN
        CREATE POLICY "Teachers can insert progress entries" ON progress_entries
            FOR INSERT
            TO authenticated
            WITH CHECK (
                student_id IN (
                    SELECT id 
                    FROM students 
                    WHERE teacher = (SELECT full_name FROM profiles WHERE id = auth.uid())
                )
            );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'progress_entries' AND policyname = 'Teachers can update progress entries') THEN
        CREATE POLICY "Teachers can update progress entries" ON progress_entries
            FOR UPDATE
            TO authenticated
            USING (
                student_id IN (
                    SELECT id 
                    FROM students 
                    WHERE teacher = (SELECT full_name FROM profiles WHERE id = auth.uid())
                )
            );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'progress_entries' AND policyname = 'Teachers can delete progress entries') THEN
        CREATE POLICY "Teachers can delete progress entries" ON progress_entries
            FOR DELETE
            TO authenticated
            USING (
                student_id IN (
                    SELECT id 
                    FROM students 
                    WHERE teacher = (SELECT full_name FROM profiles WHERE id = auth.uid())
                )
            );
    END IF;

    -- Parents can only view progress entries for their children
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'progress_entries' AND policyname = 'Parents can view their childrens progress') THEN
        CREATE POLICY "Parents can view their children's progress" ON progress_entries
            FOR SELECT
            TO authenticated
            USING (
                student_id IN (
                    SELECT id 
                    FROM students 
                    WHERE parent_id = auth.uid()
                )
            );
    END IF;
END $$;

-- Create trigger to update updated_at timestamp (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_progress_entries_updated_at') THEN
        CREATE TRIGGER set_progress_entries_updated_at
            BEFORE UPDATE ON progress_entries
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$; 
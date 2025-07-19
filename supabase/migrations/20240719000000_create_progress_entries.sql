-- Create progress_entries table
CREATE TABLE progress_entries (
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

-- Create indexes for faster lookups
CREATE INDEX idx_progress_entries_student ON progress_entries(student_id);
CREATE INDEX idx_progress_entries_type ON progress_entries(type);
CREATE INDEX idx_progress_entries_date ON progress_entries(date);

-- Add RLS policies
ALTER TABLE progress_entries ENABLE ROW LEVEL SECURITY;

-- Teachers can view and manage progress entries for their students
CREATE POLICY "Teachers can view progress entries" ON progress_entries
    FOR SELECT
    TO authenticated
    USING (
        student_id IN (
            SELECT id 
            FROM students 
            WHERE teacher_id = auth.uid()
        )
    );

CREATE POLICY "Teachers can insert progress entries" ON progress_entries
    FOR INSERT
    TO authenticated
    WITH CHECK (
        student_id IN (
            SELECT id 
            FROM students 
            WHERE teacher_id = auth.uid()
        )
    );

CREATE POLICY "Teachers can update progress entries" ON progress_entries
    FOR UPDATE
    TO authenticated
    USING (
        student_id IN (
            SELECT id 
            FROM students 
            WHERE teacher_id = auth.uid()
        )
    );

CREATE POLICY "Teachers can delete progress entries" ON progress_entries
    FOR DELETE
    TO authenticated
    USING (
        student_id IN (
            SELECT id 
            FROM students 
            WHERE teacher_id = auth.uid()
        )
    );

-- Parents can only view progress entries for their children
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

-- Create trigger to update updated_at timestamp
CREATE TRIGGER set_progress_entries_updated_at
    BEFORE UPDATE ON progress_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 
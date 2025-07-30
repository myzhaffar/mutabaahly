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



-- Create trigger to update updated_at timestamp
CREATE TRIGGER set_progress_entries_updated_at
    BEFORE UPDATE ON progress_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 
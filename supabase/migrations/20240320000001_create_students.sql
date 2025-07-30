-- -- Create students table
CREATE TABLE students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    class_id UUID REFERENCES classes(id),
    teacher_id UUID REFERENCES auth.users(id),
    parent_id UUID REFERENCES auth.users(id),
    current_tilawati_jilid TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX idx_students_teacher ON students(teacher_id);
CREATE INDEX idx_students_parent ON students(parent_id);
CREATE INDEX idx_students_class ON students(class_id);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER set_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 
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

-- Add RLS policies
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Teachers can view and manage their students
CREATE POLICY "Teachers can view their students" ON students
    FOR SELECT
    TO authenticated
    USING (
        teacher_id = auth.uid() OR
        auth.uid() IN (
            SELECT teacher_id 
            FROM class_teachers 
            WHERE class_id = students.class_id
        )
    );

CREATE POLICY "Teachers can insert students" ON students
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() IN (
            SELECT id 
            FROM auth.users 
            WHERE raw_user_meta_data->>'role' = 'teacher'
        )
    );

CREATE POLICY "Teachers can update their students" ON students
    FOR UPDATE
    TO authenticated
    USING (
        teacher_id = auth.uid() OR
        auth.uid() IN (
            SELECT teacher_id 
            FROM class_teachers 
            WHERE class_id = students.class_id
        )
    );

-- Parents can only view their children
CREATE POLICY "Parents can view their children" ON students
    FOR SELECT
    TO authenticated
    USING (parent_id = auth.uid());

-- Create trigger to update updated_at timestamp
CREATE TRIGGER set_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 
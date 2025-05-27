-- Create classes table
CREATE TABLE classes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create class_teachers junction table
CREATE TABLE class_teachers (
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (class_id, teacher_id)
);

-- Create indexes
CREATE INDEX idx_class_teachers_teacher ON class_teachers(teacher_id);

-- Add RLS policies
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_teachers ENABLE ROW LEVEL SECURITY;

-- Teachers can view classes they teach
CREATE POLICY "Teachers can view their classes" ON classes
    FOR SELECT
    TO authenticated
    USING (
        id IN (
            SELECT class_id 
            FROM class_teachers 
            WHERE teacher_id = auth.uid()
        )
    );

-- Teachers can view class assignments
CREATE POLICY "Teachers can view class assignments" ON class_teachers
    FOR SELECT
    TO authenticated
    USING (teacher_id = auth.uid());

-- Only admins can manage classes and assignments (you'll need to implement admin role checks)
CREATE POLICY "Admins can manage classes" ON classes
    FOR ALL
    TO authenticated
    USING (
        auth.uid() IN (
            SELECT id 
            FROM auth.users 
            WHERE raw_user_meta_data->>'role' = 'admin'
        )
    );

CREATE POLICY "Admins can manage class assignments" ON class_teachers
    FOR ALL
    TO authenticated
    USING (
        auth.uid() IN (
            SELECT id 
            FROM auth.users 
            WHERE raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Create trigger to update updated_at timestamp
CREATE TRIGGER set_classes_updated_at
    BEFORE UPDATE ON classes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 
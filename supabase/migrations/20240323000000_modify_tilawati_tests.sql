-- First, drop existing triggers and dependencies
DROP TRIGGER IF EXISTS update_student_jilid_on_pass ON tilawati_level_tests;
DROP FUNCTION IF EXISTS update_student_jilid();
DROP TRIGGER IF EXISTS set_updated_at ON tilawati_level_tests;

-- Drop existing table
DROP TABLE IF EXISTS tilawati_level_tests;

-- Create enum for test status
DROP TYPE IF EXISTS test_status;
CREATE TYPE test_status AS ENUM ('scheduled', 'passed', 'failed', 'pending_retake', 'cancelled');

-- Create new tilawati_level_tests table
CREATE TABLE tilawati_level_tests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id),
    tilawati_level TEXT NOT NULL,
    status test_status NOT NULL DEFAULT 'scheduled',
    munaqisy TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX idx_tilawati_tests_date ON tilawati_level_tests(date);
CREATE INDEX idx_tilawati_tests_student ON tilawati_level_tests(student_id);
CREATE INDEX idx_tilawati_tests_class ON tilawati_level_tests(class_id);
CREATE INDEX idx_tilawati_tests_status ON tilawati_level_tests(status);

-- Add RLS policies
ALTER TABLE tilawati_level_tests ENABLE ROW LEVEL SECURITY;

-- Teachers can view and manage tests for their students
CREATE POLICY "Teachers can view tests for their students" ON tilawati_level_tests
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM students s
            WHERE s.id = tilawati_level_tests.student_id
            AND (
                s.teacher_id = auth.uid() OR
                auth.uid() IN (SELECT teacher_id FROM class_teachers ct WHERE ct.class_id = s.class_id)
            )
        )
    );

CREATE POLICY "Teachers can insert tests" ON tilawati_level_tests
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM students s
            WHERE s.id = tilawati_level_tests.student_id
            AND (
                s.teacher_id = auth.uid() OR
                auth.uid() IN (SELECT teacher_id FROM class_teachers ct WHERE ct.class_id = s.class_id)
            )
        )
    );

CREATE POLICY "Teachers can update tests" ON tilawati_level_tests
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM students s
            WHERE s.id = tilawati_level_tests.student_id
            AND (
                s.teacher_id = auth.uid() OR
                auth.uid() IN (SELECT teacher_id FROM class_teachers ct WHERE ct.class_id = s.class_id)
            )
        )
    );

-- Parents can only view their children's tests
CREATE POLICY "Parents can view their children's tests" ON tilawati_level_tests
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM students s
            WHERE s.id = tilawati_level_tests.student_id
            AND s.parent_id = auth.uid()
        )
    );

-- Create trigger to update updated_at timestamp
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON tilawati_level_tests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to update student's tilawati level when test is passed
CREATE OR REPLACE FUNCTION update_student_level() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'passed' AND OLD.status != 'passed' THEN
        UPDATE students
        SET current_tilawati_jilid = NEW.tilawati_level
        WHERE id = NEW.student_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_student_level_on_pass
    AFTER UPDATE ON tilawati_level_tests
    FOR EACH ROW
    EXECUTE FUNCTION update_student_level(); 
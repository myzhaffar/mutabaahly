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
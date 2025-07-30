-- Create enum for test status
CREATE TYPE test_status AS ENUM ('scheduled', 'passed', 'failed', 'pending_retake', 'cancelled');

-- Create tilawati_level_tests table
CREATE TABLE tilawati_level_tests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    current_jilid TEXT NOT NULL,
    target_jilid TEXT NOT NULL,
    test_date TIMESTAMP WITH TIME ZONE NOT NULL,
    examiner_name TEXT NOT NULL,
    status test_status NOT NULL DEFAULT 'scheduled',
    score INTEGER CHECK (score >= 0 AND score <= 100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_tilawati_tests_student ON tilawati_level_tests(student_id);
CREATE INDEX idx_tilawati_tests_date ON tilawati_level_tests(test_date);
CREATE INDEX idx_tilawati_tests_status ON tilawati_level_tests(status);



-- Create trigger to update updated_at timestamp
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON tilawati_level_tests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to update student's current jilid when test is passed
CREATE OR REPLACE FUNCTION update_student_jilid() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'passed' AND OLD.status != 'passed' THEN
        UPDATE students
        SET current_tilawati_jilid = NEW.target_jilid
        WHERE id = NEW.student_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_student_jilid_on_pass
    AFTER UPDATE ON tilawati_level_tests
    FOR EACH ROW
    EXECUTE FUNCTION update_student_jilid(); 
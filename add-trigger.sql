-- Create function to update student's current_tilawati_jilid when progress is added
CREATE OR REPLACE FUNCTION update_student_tilawati_level() RETURNS TRIGGER AS $$
BEGIN
    -- Only update if this is a tilawah entry with a Level
    IF NEW.type = 'tilawah' AND NEW.surah_or_jilid LIKE 'Level%' THEN
        -- Update the student's current_tilawati_jilid to match the progress entry
        UPDATE students 
        SET current_tilawati_jilid = NEW.surah_or_jilid,
            updated_at = NOW()
        WHERE id = NEW.student_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update student level when progress is added
DROP TRIGGER IF EXISTS update_student_level_on_progress ON progress_entries;
CREATE TRIGGER update_student_level_on_progress
    AFTER INSERT OR UPDATE ON progress_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_student_tilawati_level(); 
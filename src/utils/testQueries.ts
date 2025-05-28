
import { supabase } from '@/integrations/supabase/client';
import type { TilawatiTest, TestStatus, TilawatiJilid } from '@/types/tilawati';

interface TestFilters {
  status?: TestStatus | 'all';
  searchTerm?: string;
  jilidLevel?: TilawatiJilid | 'all';
  date?: string;
}

export const fetchTestsWithFilters = async (filters: TestFilters): Promise<TilawatiTest[]> => {
  console.log('Fetching tests with filters:', filters);
  
  let sql = 'SELECT * FROM tilawati_level_tests WHERE 1=1';
  const params: any[] = [];
  let paramIndex = 1;

  // Apply filters
  if (filters.status && filters.status !== 'all') {
    sql += ` AND status = $${paramIndex}`;
    params.push(filters.status);
    paramIndex++;
  }
  if (filters.jilidLevel && filters.jilidLevel !== 'all') {
    sql += ` AND tilawati_level = $${paramIndex}`;
    params.push(filters.jilidLevel);
    paramIndex++;
  }
  if (filters.searchTerm) {
    sql += ` AND class_name ILIKE $${paramIndex}`;
    params.push(`%${filters.searchTerm}%`);
    paramIndex++;
  }
  if (filters.date) {
    sql += ` AND date = $${paramIndex}`;
    params.push(filters.date);
    paramIndex++;
  }

  sql += ' ORDER BY created_at DESC';

  const { data, error } = await supabase.rpc('execute_sql', {
    sql,
    params
  });

  if (error) {
    console.error('Error fetching tests:', error);
    throw error;
  }

  console.log('Raw test data from database:', data);

  // Transform the data to match our TilawatiTest interface
  return (data || []).map((test: any) => ({
    id: test.id,
    date: test.date,
    student_id: test.student_id,
    class_name: test.class_name,
    tilawati_level: test.tilawati_level as TilawatiJilid,
    status: test.status as TestStatus,
    munaqisy: test.munaqisy,
    notes: test.notes,
    created_at: test.created_at || new Date().toISOString(),
    updated_at: test.updated_at || new Date().toISOString(),
  })) as TilawatiTest[];
};

export const saveTest = async (testData: {
  student_id: string;
  class_name: string;
  tilawati_level: TilawatiJilid;
  date: string;
  munaqisy: string;
  status: TestStatus;
  notes: string;
}, existingTestId?: string): Promise<TilawatiTest> => {
  console.log('Submitting test data:', testData);

  let result;
  if (existingTestId) {
    // Update existing test
    const { data, error } = await supabase.rpc('execute_sql', {
      sql: `
        UPDATE tilawati_level_tests 
        SET student_id = $1, class_name = $2, tilawati_level = $3, date = $4, 
            munaqisy = $5, status = $6, notes = $7, updated_at = NOW()
        WHERE id = $8
        RETURNING *
      `,
      params: [testData.student_id, testData.class_name, testData.tilawati_level, testData.date, testData.munaqisy, testData.status, testData.notes, existingTestId]
    });

    if (error) {
      console.error('Update error:', error);
      throw error;
    }
    result = Array.isArray(data) ? data[0] : data;
  } else {
    // Create new test
    const { data, error } = await supabase.rpc('execute_sql', {
      sql: `
        INSERT INTO tilawati_level_tests (student_id, class_name, tilawati_level, date, munaqisy, status, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `,
      params: [testData.student_id, testData.class_name, testData.tilawati_level, testData.date, testData.munaqisy, testData.status, testData.notes]
    });

    if (error) {
      console.error('Insert error:', error);
      throw error;
    }
    result = Array.isArray(data) ? data[0] : data;
  }
  
  console.log('Database result:', result);
  
  if (!result) {
    throw new Error('No data returned from database operation');
  }

  // Transform the result to match our TilawatiTest interface
  return {
    id: result.id,
    date: result.date,
    student_id: result.student_id,
    class_name: result.class_name,
    tilawati_level: result.tilawati_level as TilawatiJilid,
    status: result.status as TestStatus,
    munaqisy: result.munaqisy,
    notes: result.notes,
    created_at: result.created_at || new Date().toISOString(),
    updated_at: result.updated_at || new Date().toISOString(),
  };
};

import { supabase } from '@/lib/supabase';
import type { TestStatus, TilawatiJilid, TilawatiTest } from '@/types/tilawati';

export interface TestRecord {
  id: string;
  student_id: string;
  current_jilid: string;
  target_jilid: string;
  test_date: string;
  examiner_name: string;
  status: 'scheduled' | 'passed' | 'failed' | 'pending_retake' | 'cancelled';
  score?: number;
  notes: string;
  created_at: string;
  updated_at: string;
  student_name?: string;
  class_name?: string;
}

export const fetchTestsForTeacher = async (teacherId: string): Promise<TestRecord[]> => {
  try {
    const { data, error } = await supabase.rpc('get_tests_for_teacher', {
      teacher_id: teacherId
    });

    if (error) {
      console.error('Error fetching tests:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchTestsForTeacher:', error);
    throw error;
  }
};

export const fetchTestsForParent = async (parentId: string): Promise<TestRecord[]> => {
  try {
    const { data, error } = await supabase.rpc('get_tests_for_parent', {
      parent_id: parentId
    });

    if (error) {
      console.error('Error fetching tests for parent:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchTestsForParent:', error);
    throw error;
  }
};

interface DateRange {
  startDate?: Date;
  endDate?: Date;
}

interface TestFilters {
  status?: TestStatus | 'all';
  searchTerm?: string;
  jilidLevel?: TilawatiJilid | 'all';
  dateRange?: DateRange;
}

interface Student {
  id: string;
  name: string;
  group_name: string;
  grade: string;
  teacher: string;
}

export const fetchTestsWithFilters = async (filters: TestFilters): Promise<TilawatiTest[]> => {
  let query = supabase
    .from('tilawati_tests')
    .select(`
      id,
      student_id,
      class_name,
      tilawati_level,
      date,
      munaqisy,
      status,
      notes,
      created_at,
      updated_at,
      student:students (
        id,
        name,
        group_name,
        grade,
        teacher
      )
    `);

  // Apply filters
  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  if (filters.jilidLevel && filters.jilidLevel !== 'all') {
    query = query.eq('tilawati_level', filters.jilidLevel);
  }

  if (filters.searchTerm) {
    query = query.ilike('class_name', `%${filters.searchTerm}%`);
  }

  // Apply date range filter
  if (filters.dateRange?.startDate) {
    query = query.gte('date', filters.dateRange.startDate.toISOString().split('T')[0]);
  }
  if (filters.dateRange?.endDate) {
    query = query.lte('date', filters.dateRange.endDate.toISOString().split('T')[0]);
  }

  // Order by date
  query = query.order('date', { ascending: false });

  const { data: tests, error } = await query;

  if (error) {
    console.error('Error fetching tests:', error);
    throw error;
  }

  // Transform the data to match the TilawatiTest type
  return (tests || []).map(test => ({
    ...test,
    student: test.student?.[0] as Student | undefined
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
}, testId?: string): Promise<TilawatiTest> => {
  try {
    if (testId) {
      // Update existing test
      const { data, error } = await supabase
        .from('tilawati_level_tests')
        .update(testData)
        .eq('id', testId)
        .select()
        .single();

      if (error) {
        console.error('Error updating test:', error);
        throw error;
      }

      return data;
    } else {
      // Create new test
      const { data, error } = await supabase
        .from('tilawati_level_tests')
        .insert([testData])
        .select()
        .single();

      if (error) {
        console.error('Error creating test:', error);
        throw error;
      }

      return data;
    }
  } catch (error) {
    console.error('Error in saveTest:', error);
    throw error;
  }
};

export const createTest = async (testData: {
  student_id: string;
  current_jilid: string;
  target_jilid: string;
  test_date: string;
  examiner_name: string;
  status: string;
  notes: string;
}): Promise<TestRecord> => {
  try {
    const { data, error } = await supabase
      .from('tilawati_level_tests')
      .insert([testData])
      .select()
      .single();

    if (error) {
      console.error('Error creating test:', error);
      throw error;
    }

    if (!data) {
      throw new Error('No data returned from test creation');
    }

    return data as TestRecord;
  } catch (error) {
    console.error('Error in createTest:', error);
    throw error;
  }
};

export const updateTest = async (testId: string, updates: {
  current_jilid?: string;
  target_jilid?: string;
  test_date?: string;
  examiner_name?: string;
  status?: string;
  score?: number;
  notes?: string;
}): Promise<TestRecord> => {
  try {
    const { data, error } = await supabase
      .from('tilawati_level_tests')
      .update(updates)
      .eq('id', testId)
      .select()
      .single();

    if (error) {
      console.error('Error updating test:', error);
      throw error;
    }

    if (!data) {
      throw new Error('No data returned from test update');
    }

    return data as TestRecord;
  } catch (error) {
    console.error('Error in updateTest:', error);
    throw error;
  }
};

export const deleteTest = async (testId: string): Promise<void> => {
  if (!testId) {
    throw new Error('Test ID is required');
  }

  try {
    // First check if the test exists
    const { data: existingTest, error: checkError } = await supabase
      .from('tilawati_level_tests')
      .select('id')
      .eq('id', testId)
      .single();

    if (checkError) {
      throw new Error('Failed to verify test existence');
    }

    if (!existingTest) {
      throw new Error('Test not found');
    }

    // Delete the test
    const { error: deleteError } = await supabase
      .from('tilawati_level_tests')
      .delete()
      .eq('id', testId);

    if (deleteError) {
      console.error('Error deleting test:', deleteError);
      throw new Error(deleteError.message);
    }
  } catch (error) {
    console.error('Error in deleteTest:', error);
    throw error;
  }
};

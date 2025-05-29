import { supabase } from '@/lib/supabase';
import type { TilawatiTest, TilawatiJilid, TestStatus } from '@/types/tilawati';

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

export const fetchTestsWithFilters = async (filters: any): Promise<TilawatiTest[]> => {
  try {
    let query = supabase
      .from('tilawati_level_tests')
      .select('*')
      .order('date', { ascending: false });

    // Apply filters
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters.searchTerm) {
      query = query.ilike('class_name', `%${filters.searchTerm}%`);
    }

    if (filters.jilidLevel && filters.jilidLevel !== 'all') {
      query = query.eq('tilawati_level', filters.jilidLevel);
    }

    if (filters.date) {
      query = query.eq('date', filters.date);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching tests with filters:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchTestsWithFilters:', error);
    throw error;
  }
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
  try {
    const { error } = await supabase
      .from('tilawati_level_tests')
      .delete()
      .eq('id', testId);

    if (error) {
      console.error('Error deleting test:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteTest:', error);
    throw error;
  }
};

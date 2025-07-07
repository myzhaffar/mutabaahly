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

interface TestFilters {
  status?: TestStatus | TestStatus[] | 'all';
  searchTerm?: string;
  jilidLevel?: TilawatiJilid | TilawatiJilid[] | 'all';
  date?: string;
}

export const fetchTestsWithFilters = async (filters: TestFilters): Promise<TilawatiTest[]> => {
  try {
    console.log('Fetching tests with filters:', filters);
    let query = supabase
      .from('tilawati_level_tests')
      .select('*')
      .order('date', { ascending: false });

    // Status filter (array or single)
    if (filters.status && filters.status !== 'all' && Array.isArray(filters.status) && filters.status.length > 0) {
      if (filters.status.length === 1) {
        query = query.eq('status', filters.status[0]);
      } else {
        query = query.in('status', filters.status);
      }
    } else if (filters.status && filters.status !== 'all' && typeof filters.status === 'string') {
      query = query.eq('status', filters.status);
    }

    // JilidLevel filter (array or single)
    if (filters.jilidLevel && filters.jilidLevel !== 'all' && Array.isArray(filters.jilidLevel) && filters.jilidLevel.length > 0) {
      if (filters.jilidLevel.length === 1) {
        query = query.eq('tilawati_level', filters.jilidLevel[0]);
      } else {
        query = query.in('tilawati_level', filters.jilidLevel);
      }
    } else if (filters.jilidLevel && filters.jilidLevel !== 'all' && typeof filters.jilidLevel === 'string') {
      query = query.eq('tilawati_level', filters.jilidLevel);
    }

    if (filters.searchTerm) {
      query = query.ilike('class_name', `%${filters.searchTerm}%`);
    }

    if (filters.date) {
      query = query.eq('date', filters.date);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching tests with filters:', error);
      throw error;
    }

    console.log('Fetched tests:', data);
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
  if (!testId) {
    throw new Error("Test ID is required");
  }

  try {
    const { error } = await supabase
      .from("tilawati_level_tests")
      .delete()
      .eq("id", testId);
    if (error) {
      console.error("Error deleting test:", error);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error("Error in deleteTest:", error);
    throw error;
  }
};
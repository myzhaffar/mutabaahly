import useSWR from 'swr';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

// TODO: Improve typing for PostgrestFilterBuilder in the future
// The complex typing from Supabase requires database-specific type definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetcher = async (_key: string, query: any) => {
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// Hook for fetching students with caching
export const useStudents = (profileId?: string, role?: string) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Create a query key that includes relevant filters
  const queryKey = ['students', profileId, role];
  
  // Build the Supabase query based on the role
  const getQuery = () => {
    const query = supabase.from('students').select('*');
    
    // Parents can now see all students (not just their children)
    // Only apply parent_id filter if specifically needed for other use cases
    // if (role === 'parent' && profileId) {
    //   query = query.eq('parent_id', profileId);
    // }
    
    return query;
  };
  
  // Use SWR for data fetching with caching and revalidation
  const { data, error, mutate } = useSWR(
    profileId ? queryKey : null,
    () => fetcher(queryKey.join('_'), getQuery()),
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute
    }
  );
  
  // Custom refresh function
  const refresh = async () => {
    setIsRefreshing(true);
    await mutate();
    setIsRefreshing(false);
  };
  
  return {
    students: data || [],
    isLoading: !error && !data,
    isRefreshing,
    isError: !!error,
    refresh,
  };
};

// Hook for fetching progress entries with caching
export const useProgressEntries = (studentId?: string) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Use SWR for data fetching with caching
  const { data, error, isValidating, mutate } = useSWR(
    studentId ? ['progressEntries', studentId] : null,
    () => fetcher(
      `progressEntries_${studentId}`,
      supabase
        .from('progress_entries')
        .select('*')
        .eq('student_id', studentId!)
        .order('date', { ascending: false })
    ),
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute
    }
  );
  
  // Custom refresh function
  const refresh = async () => {
    setIsRefreshing(true);
    await mutate();
    setIsRefreshing(false);
  };
  
  return {
    entries: data || [],
    isLoading: !error && !data,
    isRefreshing: isRefreshing || isValidating,
    isError: !!error,
    refresh,
  };
};

// Additional hooks can be added here for other data types 

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const supabaseUrl = 'https://isyhakwwgdozgtlquzis.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzeWhha3d3Z2Rvemd0bHF1emlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NTY3NzcsImV4cCI6MjA2MjUzMjc3N30.-2Ya944q8mgJzRAuhMpRAWgxWVmt2yc3CqM0jjgFuuY';

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    db: {
      schema: 'public'
    }
  }
);

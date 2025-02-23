
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Create a test client with admin privileges
export const adminSupabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Create a test client with anonymous privileges
export const anonSupabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Helper to clean up test data
export async function cleanupTestData() {
  const { error } = await adminSupabase
    .from('profiles')
    .delete()
    .match({ email: 'test@example.com' });
  
  if (error) {
    console.error('Error cleaning up test data:', error);
  }
}

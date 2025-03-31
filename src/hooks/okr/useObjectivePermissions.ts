
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useObjectivePermissions() {
  const [canCreateObjective, setCanCreateObjective] = useState(false);
  
  // Query to check if user can create objectives
  const { data, isLoading } = useQuery({
    queryKey: ['objective-permissions'],
    queryFn: async () => {
      try {
        // Call the can_create_objective function we created in the database
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.user) {
          return { canCreate: false };
        }

        const { data, error } = await supabase.rpc('can_create_objective', {
          p_user_id: session.session.user.id
        });
        
        if (error) {
          console.error('Error checking objective permissions:', error);
          return { canCreate: false };
        }
        
        return { canCreate: data };
      } catch (err) {
        console.error('Failed to check objective permissions:', err);
        return { canCreate: false };
      }
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
  
  // Update state when query completes
  useEffect(() => {
    if (data) {
      setCanCreateObjective(data.canCreate);
    }
  }, [data]);
  
  return {
    canCreateObjective,
    isLoading
  };
}

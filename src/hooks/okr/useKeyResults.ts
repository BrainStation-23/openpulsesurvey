
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { KeyResult } from '@/types/okr';

export const useKeyResults = (objectiveId?: string) => {
  return useQuery({
    queryKey: ['keyResults', objectiveId],
    queryFn: async () => {
      if (!objectiveId) return [];
      
      const { data, error } = await supabase
        .from('key_results')
        .select('*')
        .eq('objective_id', objectiveId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching key results:', error);
        throw error;
      }
      
      return data as KeyResult[];
    },
    enabled: !!objectiveId
  });
};

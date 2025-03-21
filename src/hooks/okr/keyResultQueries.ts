
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { KeyResult } from '@/types/okr';

/**
 * Hook to fetch key results for a specific objective
 * 
 * @param objectiveId - The ID of the objective to fetch key results for
 * @returns Query result with key results data
 */
export const useKeyResultsQuery = (objectiveId?: string) => {
  return useQuery({
    queryKey: ['key-results', objectiveId],
    queryFn: async () => {
      if (!objectiveId) return [];
      
      const { data, error } = await supabase
        .from('key_results')
        .select('*')
        .eq('objective_id', objectiveId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching key results:', error);
        throw error;
      }
      
      return data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        objectiveId: item.objective_id,
        ownerId: item.owner_id,
        krType: item.kr_type,
        measurementType: item.measurement_type || 'numeric',
        unit: item.unit,
        startValue: item.start_value,
        currentValue: item.current_value,
        targetValue: item.target_value,
        booleanValue: item.boolean_value,
        progress: item.progress,
        status: item.status,
        weight: item.weight,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      })) as KeyResult[];
    },
    enabled: !!objectiveId
  });
};

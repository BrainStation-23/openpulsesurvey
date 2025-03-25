
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { KeyResult } from '@/types/okr';

// Helper function to convert snake_case response to camelCase
const convertKeyResult = (data: any): KeyResult => {
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    objectiveId: data.objective_id,
    ownerId: data.owner_id,
    krType: data.kr_type,
    measurementType: data.measurement_type,
    unit: data.unit,
    startValue: data.start_value,
    currentValue: data.current_value,
    targetValue: data.target_value,
    booleanValue: data.boolean_value,
    weight: data.weight,
    status: data.status,
    progress: data.progress,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
};

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
      
      // Convert each key result from snake_case to camelCase
      return data.map(convertKeyResult) as KeyResult[];
    },
    enabled: !!objectiveId
  });
};


import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { KeyResult, CreateKeyResultInput, UpdateKeyResultInput } from '@/types/okr';
import { useToast } from '@/hooks/use-toast';

export const useKeyResults = (objectiveId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { 
    data: keyResults, 
    isLoading, 
    error 
  } = useQuery({
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
      
      return data as KeyResult[];
    },
    enabled: !!objectiveId
  });

  // Create a new key result
  const createKeyResult = useMutation({
    mutationFn: async (keyResultData: CreateKeyResultInput) => {
      const { data, error } = await supabase
        .from('key_results')
        .insert({
          title: keyResultData.title,
          description: keyResultData.description,
          kr_type: keyResultData.krType,
          unit: keyResultData.unit,
          start_value: keyResultData.startValue,
          current_value: keyResultData.currentValue,
          target_value: keyResultData.targetValue,
          weight: keyResultData.weight,
          objective_id: keyResultData.objectiveId,
          owner_id: keyResultData.ownerId,
          status: 'not_started'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating key result:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['key-results', objectiveId] });
      // Since key results affect the objective's progress, also invalidate the objective
      queryClient.invalidateQueries({ queryKey: ['objective', objectiveId] });
      toast({
        title: 'Success',
        description: 'Key result created successfully',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error creating key result',
        description: error.message,
      });
    }
  });

  // Update an existing key result
  const updateKeyResult = useMutation({
    mutationFn: async (updateData: UpdateKeyResultInput & { id: string }) => {
      const { id, ...rest } = updateData;
      
      // Convert camelCase to snake_case for Supabase
      const mappedData: any = {};
      if (rest.title) mappedData.title = rest.title;
      if (rest.description !== undefined) mappedData.description = rest.description;
      if (rest.krType) mappedData.kr_type = rest.krType;
      if (rest.unit !== undefined) mappedData.unit = rest.unit;
      if (rest.startValue !== undefined) mappedData.start_value = rest.startValue;
      if (rest.currentValue !== undefined) mappedData.current_value = rest.currentValue;
      if (rest.targetValue !== undefined) mappedData.target_value = rest.targetValue;
      if (rest.weight !== undefined) mappedData.weight = rest.weight;
      if (rest.status) mappedData.status = rest.status;
      
      const { data, error } = await supabase
        .from('key_results')
        .update(mappedData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating key result:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['key-results', objectiveId] });
      queryClient.invalidateQueries({ queryKey: ['objective', objectiveId] });
      toast({
        title: 'Success',
        description: 'Key result updated successfully',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error updating key result',
        description: error.message,
      });
    }
  });

  // Delete a key result
  const deleteKeyResult = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('key_results')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting key result:', error);
        throw error;
      }
      
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['key-results', objectiveId] });
      queryClient.invalidateQueries({ queryKey: ['objective', objectiveId] });
      toast({
        title: 'Success',
        description: 'Key result deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error deleting key result',
        description: error.message,
      });
    }
  });

  return {
    keyResults,
    isLoading,
    error,
    createKeyResult,
    updateKeyResult,
    deleteKeyResult
  };
};

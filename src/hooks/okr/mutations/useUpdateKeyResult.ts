
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UpdateKeyResultInput } from '@/types/okr';
import { useToast } from '@/hooks/use-toast';
import { checkObjectivePermission } from '../utils/keyResultPermissions';
import { validateKeyResultData } from '../utils/keyResultValidation';

/**
 * Hook for updating an existing key result
 * 
 * @returns Mutation for updating a key result
 */
export const useUpdateKeyResult = (objectiveId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updateData: UpdateKeyResultInput & { id: string }) => {
      const { id, ...rest } = updateData;
      
      try {
        const { data: keyResultData, error: fetchError } = await supabase
          .from('key_results')
          .select('objective_id')
          .eq('id', id)
          .single();
          
        if (fetchError) {
          console.error('Error fetching key result:', fetchError);
          throw fetchError;
        }
        
        await checkObjectivePermission(keyResultData.objective_id);
        
        validateKeyResultData(rest);
        
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
        if (rest.progress !== undefined) mappedData.progress = rest.progress;
        
        console.log('Updating key result with data:', mappedData);
        
        const { data, error } = await supabase
          .from('key_results')
          .update(mappedData)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('Error updating key result:', error);
          
          if (error.code === '22003') {
            throw new Error("One of the values exceeds the allowed range in the database. Progress must be between 0-100 and other numeric values must be within reasonable limits.");
          }
          
          throw error;
        }

        return data;
      } catch (error: any) {
        console.error('Error in updateKeyResult:', error);
        throw error;
      }
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
};

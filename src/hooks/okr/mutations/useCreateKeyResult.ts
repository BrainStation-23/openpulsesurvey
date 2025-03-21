
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CreateKeyResultInput } from '@/types/okr';
import { useToast } from '@/hooks/use-toast';
import { checkObjectivePermission } from '../utils/keyResultPermissions';
import { validateKeyResultData } from '../utils/keyResultValidation';

/**
 * Hook for creating a new key result
 * 
 * @returns Mutation for creating a key result
 */
export const useCreateKeyResult = (objectiveId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (keyResultData: CreateKeyResultInput) => {
      await checkObjectivePermission(keyResultData.objectiveId);
      
      try {
        validateKeyResultData(keyResultData);

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
            status: 'not_started',
            progress: 0 // Always start at 0 progress
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating key result:', error);
          
          if (error.code === '22003') {
            throw new Error("One of the values exceeds the allowed range in the database. Progress must be between 0-100 and other numeric values must be within reasonable limits.");
          }
          
          throw error;
        }

        return data;
      } catch (error: any) {
        console.error('Error in createKeyResult:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['key-results', objectiveId] });
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
};

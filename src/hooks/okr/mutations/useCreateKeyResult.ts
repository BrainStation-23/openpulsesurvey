
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CreateKeyResultInput } from '@/types/okr';
import { useToast } from '@/hooks/use-toast';
import { checkObjectivePermission } from '../utils/keyResultPermissions';
import { validateKeyResultData, calculateProgress } from '../utils/keyResultValidation';

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
        // If progress is not provided, calculate it
        if (keyResultData.progress === undefined) {
          keyResultData.progress = Math.round(
            calculateProgress(
              keyResultData.currentValue,
              keyResultData.startValue,
              keyResultData.targetValue
            )
          );
        }
        
        // Validate the data before inserting
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
            progress: keyResultData.progress
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating key result:', error);
          
          if (error.code === '22003') {
            throw new Error("One of the values exceeds the allowed range in the database. Values must be between -999.99 and 999.99, and progress must be between 0-100.");
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

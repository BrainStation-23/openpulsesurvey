
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CreateKeyResultInput, MeasurementType } from '@/types/okr';
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
        // Default to numeric measurement type if not provided
        const measurementType = keyResultData.measurementType || 'numeric';
        
        // Calculate progress based on measurement type
        if (keyResultData.progress === undefined) {
          keyResultData.progress = Math.round(
            calculateProgress(
              measurementType,
              keyResultData.currentValue,
              keyResultData.startValue,
              keyResultData.targetValue,
              keyResultData.booleanValue
            )
          );
        }
        
        // Validate the data before inserting
        validateKeyResultData(keyResultData);

        // Build the insert object based on measurement type
        const insertData: any = {
          title: keyResultData.title,
          description: keyResultData.description,
          kr_type: keyResultData.krType,
          measurement_type: measurementType,
          unit: keyResultData.unit,
          weight: keyResultData.weight || 1,
          objective_id: keyResultData.objectiveId,
          owner_id: keyResultData.ownerId,
          status: 'not_started',
          progress: keyResultData.progress
        };

        // Add appropriate values based on measurement type
        if (measurementType === 'boolean') {
          insertData.boolean_value = keyResultData.booleanValue;
          // For boolean type, we need to set target_value to avoid not-null constraint
          insertData.target_value = 1; // Using 1 as a default for target
          insertData.start_value = 0;  // Using 0 as a default for start
          insertData.current_value = keyResultData.booleanValue ? 1 : 0;
        } else {
          insertData.start_value = keyResultData.startValue ?? 0;
          insertData.current_value = keyResultData.currentValue ?? 0;
          insertData.target_value = keyResultData.targetValue;
        }

        // Ensure progress is within valid range
        if (insertData.progress < 0) insertData.progress = 0;
        if (insertData.progress > 100) insertData.progress = 100;

        console.log('Creating key result with data:', insertData);

        const { data, error } = await supabase
          .from('key_results')
          .insert(insertData)
          .select()
          .single();

        if (error) {
          console.error('Error creating key result:', error);
          
          if (error.code === '22003') {
            throw new Error("One of the values exceeds the allowed range in the database. Values must be between -999.99 and 999.99, and progress must be between 0-100.");
          } else if (error.code === '23514') {
            throw new Error("Progress value is out of allowed range. Progress must be between 0 and 100.");
          } else if (error.code === '23502') {
            throw new Error("Required fields are missing. Make sure to provide target value for numeric key results.");
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

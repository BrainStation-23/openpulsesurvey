
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UpdateKeyResultInput, MeasurementType } from '@/types/okr';
import { useToast } from '@/hooks/use-toast';
import { checkObjectivePermission } from '../utils/keyResultPermissions';
import { validateKeyResultData, calculateProgress } from '../utils/keyResultValidation';

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
          .select('objective_id, start_value, target_value, current_value, measurement_type, boolean_value')
          .eq('id', id)
          .single();
          
        if (fetchError) {
          console.error('Error fetching key result:', fetchError);
          throw fetchError;
        }
        
        await checkObjectivePermission(keyResultData.objective_id);
        
        // Get the measurement type (either from update data or existing data)
        const measurementType = (rest.measurementType || keyResultData.measurement_type) as MeasurementType;
        
        // If we're updating a numeric key result and the current value is changing, but not progress, 
        // calculate the progress
        if (measurementType !== 'boolean' && rest.currentValue !== undefined && rest.progress === undefined) {
          const startValue = rest.startValue !== undefined 
            ? rest.startValue 
            : keyResultData.start_value;
            
          const targetValue = rest.targetValue !== undefined 
            ? rest.targetValue 
            : keyResultData.target_value;
            
          // Calculate progress
          const calculatedProgress = calculateProgress(
            measurementType,
            rest.currentValue,
            startValue,
            targetValue
          );
          
          rest.progress = Math.round(calculatedProgress);
        }
        
        // If we're updating a boolean key result and the boolean value is changing, but not progress, 
        // calculate the progress
        if (measurementType === 'boolean' && rest.booleanValue !== undefined && rest.progress === undefined) {
          rest.progress = rest.booleanValue ? 100 : 0;
        }
        
        // Validate the data before updating
        validateKeyResultData({
          ...rest,
          measurementType
        });
        
        // Map the data to database column names
        const mappedData: any = {};
        if (rest.title) mappedData.title = rest.title;
        if (rest.description !== undefined) mappedData.description = rest.description;
        if (rest.krType) mappedData.kr_type = rest.krType;
        if (rest.measurementType) mappedData.measurement_type = rest.measurementType;
        if (rest.unit !== undefined) mappedData.unit = rest.unit;
        if (rest.status) mappedData.status = rest.status;
        if (rest.progress !== undefined) mappedData.progress = rest.progress;
        if (rest.weight !== undefined) mappedData.weight = rest.weight;
        
        // Add appropriate values based on measurement type
        if (measurementType === 'boolean') {
          if (rest.booleanValue !== undefined) mappedData.boolean_value = rest.booleanValue;
        } else {
          if (rest.startValue !== undefined) mappedData.start_value = rest.startValue;
          if (rest.currentValue !== undefined) mappedData.current_value = rest.currentValue;
          if (rest.targetValue !== undefined) mappedData.target_value = rest.targetValue;
        }
        
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
            throw new Error("One of the values exceeds the allowed range in the database. Values must be between -999.99 and 999.99, and progress must be between 0-100.");
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

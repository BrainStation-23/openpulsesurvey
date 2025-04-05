
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ProgressCalculationMethod } from '@/types/okr';

export const useObjectiveProgressMethod = (id: string | undefined) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateProgressCalculationMethod = useMutation({
    mutationFn: async ({ method }: { method: ProgressCalculationMethod }) => {
      if (!id) throw new Error('Objective ID is required');
      
      const { data, error } = await supabase
        .from('objectives')
        .update({ progress_calculation_method: method })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating calculation method:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objective', id] });
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      
      // Use objective_id instead of p_objective_id
      supabase.rpc('calculate_cascaded_objective_progress', { objective_id: id })
        .then(() => {
          // Invalidate queries again after recalculation
          queryClient.invalidateQueries({ queryKey: ['objective', id] });
          queryClient.invalidateQueries({ queryKey: ['objectives'] });
        });
      
      toast({
        title: 'Success',
        description: 'Progress calculation method updated successfully',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error updating calculation method',
        description: error.message,
      });
    }
  });

  return {
    updateProgressCalculationMethod
  };
};

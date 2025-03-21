
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { checkObjectivePermission } from '../utils/keyResultPermissions';

/**
 * Hook for deleting a key result
 * 
 * @returns Mutation for deleting a key result
 */
export const useDeleteKeyResult = (objectiveId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
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
};

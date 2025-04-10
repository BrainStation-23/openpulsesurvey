
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useObjectiveRecalculate = (objectiveId?: string) => {
  const [isRecalculating, setIsRecalculating] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const recalculateProgress = async () => {
    if (!objectiveId) return;
    
    setIsRecalculating(true);
    try {
      // Use objective_id instead of p_objective_id
      const { error } = await supabase.rpc('calculate_cascaded_objective_progress', { 
        objective_id: objectiveId 
      });
      
      if (error) throw error;
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['objective', objectiveId] });
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      
      toast({
        title: 'Success',
        description: 'Progress recalculated successfully',
      });
      
      return true;
    } catch (error) {
      console.error('Error recalculating progress:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to recalculate progress',
      });
      
      return false;
    } finally {
      setIsRecalculating(false);
    }
  };

  return {
    isRecalculating,
    recalculateProgress
  };
};

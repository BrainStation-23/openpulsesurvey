
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Objective, ProgressCalculationMethod } from '@/types/okr';
import { useObjectiveMutations } from './useObjectiveMutations';
import { useObjectiveProgressMethod } from './useObjectiveProgressMethod';

export const useObjective = (id: string | undefined) => {
  const { 
    data: objective, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['objective', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('objectives')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching objective:', error);
        throw error;
      }
      
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        cycleId: data.cycle_id,
        ownerId: data.owner_id,
        status: data.status,
        progress: data.progress,
        visibility: data.visibility,
        parentObjectiveId: data.parent_objective_id,
        sbuId: data.sbu_id,
        approvalStatus: data.approval_status,
        progressCalculationMethod: data.progress_calculation_method as ProgressCalculationMethod,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      } as Objective;
    },
    enabled: !!id
  });

  // Get mutations from the separate hooks
  const { 
    updateStatus, 
    updateObjective, 
    deleteObjective, 
    isDeleting 
  } = useObjectiveMutations(id);
  
  const { updateProgressCalculationMethod } = useObjectiveProgressMethod(id);

  return {
    objective,
    isLoading,
    error,
    updateStatus,
    updateObjective,
    updateProgressCalculationMethod,
    deleteObjective,
    isDeleting
  };
};


import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Objective, UpdateObjectiveInput } from '@/types/okr';
import { useToast } from '@/hooks/use-toast';

export const useObjective = (id: string | undefined) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
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
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      } as Objective;
    },
    enabled: !!id
  });

  const updateStatus = useMutation({
    mutationFn: async (status: UpdateObjectiveInput) => {
      if (!id) throw new Error('Objective ID is required');
      
      const updateData: any = {};
      
      if (status.status) updateData.status = status.status;
      if (status.progress !== undefined) updateData.progress = status.progress;
      
      const { data, error } = await supabase
        .from('objectives')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating objective status:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objective', id] });
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
    }
  });

  const updateObjective = useMutation({
    mutationFn: async (data: UpdateObjectiveInput & { id: string }) => {
      const { id, ...updateData } = data;
      
      const { data: result, error } = await supabase
        .from('objectives')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating objective:', error);
        throw error;
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objective', id] });
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
    }
  });

  return {
    objective,
    isLoading,
    error,
    updateStatus,
    updateObjective
  };
};

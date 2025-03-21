
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Objective, UpdateObjectiveInput, ObjectiveStatus } from '@/types/okr';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export const useObjective = (id: string | undefined) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);
  
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
    mutationFn: async ({ status }: { status: ObjectiveStatus }) => {
      if (!id) throw new Error('Objective ID is required');
      
      const updateData: any = {};
      
      if (status) updateData.status = status;
      
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
      toast({
        title: 'Success',
        description: 'Objective status updated successfully',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error updating objective status',
        description: error.message,
      });
    }
  });

  const updateObjective = useMutation({
    mutationFn: async (objectiveData: UpdateObjectiveInput) => {
      if (!id) throw new Error('Objective ID is required');
      
      const updateData: any = {};
      
      if (objectiveData.title) updateData.title = objectiveData.title;
      if (objectiveData.description !== undefined) updateData.description = objectiveData.description;
      if (objectiveData.visibility) updateData.visibility = objectiveData.visibility;
      if (objectiveData.parentObjectiveId !== undefined) updateData.parent_objective_id = objectiveData.parentObjectiveId;
      if (objectiveData.sbuId !== undefined) updateData.sbu_id = objectiveData.sbuId;
      if (objectiveData.status) updateData.status = objectiveData.status;
      if (objectiveData.approvalStatus) updateData.approval_status = objectiveData.approvalStatus;
      
      const { data, error } = await supabase
        .from('objectives')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating objective:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objective', id] });
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      toast({
        title: 'Success',
        description: 'Objective updated successfully',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error updating objective',
        description: error.message,
      });
    }
  });

  const deleteObjective = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error('Objective ID is required');
      
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('objectives')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting objective:', error);
        throw error;
      }
      
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      toast({
        title: 'Success',
        description: 'Objective deleted successfully',
      });
      setIsDeleting(false);
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error deleting objective',
        description: error.message,
      });
      setIsDeleting(false);
    }
  });

  return {
    objective,
    isLoading,
    error,
    updateStatus,
    updateObjective,
    deleteObjective,
    isDeleting
  };
};

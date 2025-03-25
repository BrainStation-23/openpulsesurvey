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
      
      // Don't allow changing the status of a completed objective if progress is 100%
      if (objective?.progress === 100 && status !== 'completed') {
        throw new Error('Cannot change the status of a completed objective');
      }
      
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
      if (objectiveData.ownerId) updateData.owner_id = objectiveData.ownerId;
      if (objectiveData.status) {
        // Apply the status change rules when updating objective
        if (objective) {
          // Don't allow changing status to anything other than completed if progress is 100%
          if (objective.progress === 100 && objectiveData.status !== 'completed') {
            throw new Error('Cannot change the status of a completed objective');
          }
          
          // Auto change to in_progress if progress > 0 and status is draft
          if (
            objective.status === 'draft' &&
            (objectiveData.progress || objective.progress) > 0 && 
            !['at_risk', 'on_track', 'completed'].includes(objectiveData.status)
          ) {
            updateData.status = 'in_progress';
          } else {
            updateData.status = objectiveData.status;
          }
        } else {
          updateData.status = objectiveData.status;
        }
      }
      if (objectiveData.approvalStatus) updateData.approval_status = objectiveData.approvalStatus;
      
      // Handle progress updates with status logic
      if (objectiveData.progress !== undefined) {
        updateData.progress = objectiveData.progress;
        
        // Auto-complete if progress is 100%
        if (objectiveData.progress === 100) {
          updateData.status = 'completed';
        }
        // Auto transition from draft to in_progress if progress > 0
        else if (
          objective && 
          objective.status === 'draft' && 
          objectiveData.progress > 0 &&
          !updateData.status
        ) {
          updateData.status = 'in_progress';
        }
      }
      
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

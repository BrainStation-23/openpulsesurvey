
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Objective, CreateObjectiveInput, UpdateObjectiveInput } from '@/types/okr';
import { useToast } from '@/hooks/use-toast';

export const useObjectives = (cycleId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch objectives for a specific cycle
  const { 
    data: objectives, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['objectives', cycleId],
    queryFn: async () => {
      let query = supabase
        .from('objectives')
        .select('*');
      
      if (cycleId) {
        query = query.eq('cycle_id', cycleId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching objectives:', error);
        throw error;
      }
      
      return data.map(objective => ({
        id: objective.id,
        title: objective.title,
        description: objective.description,
        cycleId: objective.cycle_id,
        ownerId: objective.owner_id,
        status: objective.status,
        progress: objective.progress,
        visibility: objective.visibility,
        parentObjectiveId: objective.parent_objective_id,
        sbuId: objective.sbu_id,
        approvalStatus: objective.approval_status,
        createdAt: new Date(objective.created_at),
        updatedAt: new Date(objective.updated_at)
      })) as Objective[];
    },
    enabled: true
  });

  // Create a new objective
  const createObjective = useMutation({
    mutationFn: async (objectiveData: CreateObjectiveInput) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('objectives')
        .insert({
          title: objectiveData.title,
          description: objectiveData.description,
          cycle_id: objectiveData.cycleId,
          owner_id: session.session.user.id,
          visibility: objectiveData.visibility,
          parent_objective_id: objectiveData.parentObjectiveId,
          sbu_id: objectiveData.sbuId,
          status: 'draft',
          progress: 0,
          approval_status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating objective:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives', cycleId] });
      toast({
        title: 'Success',
        description: 'Objective created successfully',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error creating objective',
        description: error.message,
      });
    }
  });

  // Update an existing objective
  const updateObjective = useMutation({
    mutationFn: async ({ id, ...objectiveData }: UpdateObjectiveInput & { id: string }) => {
      const updateData: any = {};
      
      if (objectiveData.title) updateData.title = objectiveData.title;
      if (objectiveData.description !== undefined) updateData.description = objectiveData.description;
      if (objectiveData.status) updateData.status = objectiveData.status;
      if (objectiveData.progress !== undefined) updateData.progress = objectiveData.progress;
      if (objectiveData.visibility) updateData.visibility = objectiveData.visibility;
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
      queryClient.invalidateQueries({ queryKey: ['objectives', cycleId] });
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

  // Delete an objective
  const deleteObjective = useMutation({
    mutationFn: async (id: string) => {
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
      queryClient.invalidateQueries({ queryKey: ['objectives', cycleId] });
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
    objectives,
    isLoading,
    error,
    refetch,
    createObjective,
    updateObjective,
    deleteObjective,
    isDeleting
  };
};

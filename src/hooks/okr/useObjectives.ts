
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Objective, CreateObjectiveInput, UpdateObjectiveInput } from '@/types/okr';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useOkrPermissions } from '@/hooks/okr/useOkrPermissions';

export function useObjectives() {
  const queryClient = useQueryClient();
  const { userId, isAdmin } = useCurrentUser();
  const { canCreateObjectives, canCreateOrgObjectives, canCreateDeptObjectives, canCreateTeamObjectives } = useOkrPermissions();
  const [objectiveChildCounts, setObjectiveChildCounts] = useState<Record<string, number>>({});

  // Query to fetch all objectives
  const { data: objectives, isLoading, error, refetch } = useQuery({
    queryKey: ['objectives'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('objectives')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Objective[];
    }
  });

  // Calculate child counts for objectives
  useEffect(() => {
    if (objectives) {
      const counts: Record<string, number> = {};
      objectives.forEach(obj => {
        const childCount = objectives.filter(o => o.parentObjectiveId === obj.id).length;
        counts[obj.id] = childCount;
      });
      setObjectiveChildCounts(counts);
    }
  }, [objectives]);

  // Create a new objective
  const createObjective = useMutation({
    mutationFn: async (objective: CreateObjectiveInput) => {
      // Validate that the user has permission to create an objective with the selected visibility
      if (!isAdmin) {
        const hasPermission = 
          (objective.visibility === 'team' && (canCreateTeamObjectives || canCreateObjectives)) ||
          (objective.visibility === 'department' && (canCreateDeptObjectives || canCreateObjectives)) ||
          (objective.visibility === 'organization' && (canCreateOrgObjectives || canCreateObjectives)) || 
          (objective.visibility === 'private'); // Everyone can create private objectives
          
        if (!hasPermission) {
          throw new Error(`You don't have permission to create ${objective.visibility} objectives`);
        }
      }
      
      console.log('Creating objective with permissions check:', {
        visibility: objective.visibility,
        canCreateObjectives,
        canCreateTeamObjectives,
        canCreateDeptObjectives,
        canCreateOrgObjectives,
        isAdmin
      });
      
      // Prepare the data for insertion
      const objectiveData = {
        title: objective.title,
        description: objective.description || '',
        cycle_id: objective.cycleId,
        owner_id: objective.ownerId || userId, // Default to current user if not specified
        status: 'draft', // Default status
        progress: 0, // Default progress
        visibility: objective.visibility,
        parent_objective_id: objective.parentObjectiveId === 'none' ? null : objective.parentObjectiveId,
        sbu_id: objective.sbuId === 'none' ? null : objective.sbuId,
        approval_status: 'pending' // Default approval status
      };

      const { data, error } = await supabase
        .from('objectives')
        .insert([objectiveData])
        .select()
        .single();

      if (error) throw error;
      return data as Objective;
    },
    onSuccess: () => {
      // Invalidate and refetch objectives query
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
    }
  });

  // Update an existing objective
  const updateObjective = useMutation({
    mutationFn: async (objective: UpdateObjectiveInput & { id: string }) => {
      const { id, ...updates } = objective;
      
      // Transform field names to match database column names
      const objectiveData: Record<string, any> = {};
      if (updates.title !== undefined) objectiveData.title = updates.title;
      if (updates.description !== undefined) objectiveData.description = updates.description;
      if (updates.cycleId !== undefined) objectiveData.cycle_id = updates.cycleId;
      if (updates.ownerId !== undefined) objectiveData.owner_id = updates.ownerId;
      if (updates.status !== undefined) objectiveData.status = updates.status;
      if (updates.progress !== undefined) objectiveData.progress = updates.progress;
      if (updates.visibility !== undefined) objectiveData.visibility = updates.visibility;
      if (updates.parentObjectiveId !== undefined) {
        objectiveData.parent_objective_id = updates.parentObjectiveId === 'none' 
          ? null 
          : updates.parentObjectiveId;
      }
      if (updates.sbuId !== undefined) {
        objectiveData.sbu_id = updates.sbuId === 'none' ? null : updates.sbuId;
      }
      if (updates.approvalStatus !== undefined) objectiveData.approval_status = updates.approvalStatus;

      const { data, error } = await supabase
        .from('objectives')
        .update(objectiveData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Objective;
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch objectives query
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      queryClient.invalidateQueries({ queryKey: ['objective', variables.id] });
    }
  });

  // Delete an objective
  const deleteObjective = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('objectives')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      // Invalidate and refetch objectives query
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
    }
  });

  return {
    objectives,
    objectiveChildCounts,
    isLoading,
    error,
    refetch,
    createObjective,
    updateObjective,
    deleteObjective
  };
}

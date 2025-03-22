
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ObjectiveWithRelations, Objective } from '@/types/okr';
import { useObjective } from './useObjective';

export const useObjectiveWithRelations = (id: string | undefined) => {
  const { objective, isLoading: isLoadingObjective, error: objectiveError } = useObjective(id);
  
  // Fetch child objectives
  const { 
    data: childObjectives,
    isLoading: isLoadingChildren,
    error: childrenError
  } = useQuery({
    queryKey: ['objective-children', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('objectives')
        .select('*')
        .eq('parent_objective_id', id);
      
      if (error) {
        console.error('Error fetching child objectives:', error);
        throw error;
      }
      
      return data.map(obj => ({
        id: obj.id,
        title: obj.title,
        description: obj.description,
        cycleId: obj.cycle_id,
        ownerId: obj.owner_id,
        status: obj.status,
        progress: obj.progress,
        visibility: obj.visibility,
        parentObjectiveId: obj.parent_objective_id,
        sbuId: obj.sbu_id,
        approvalStatus: obj.approval_status,
        createdAt: new Date(obj.created_at),
        updatedAt: new Date(obj.updated_at)
      })) as Objective[];
    },
    enabled: !!id
  });
  
  // Fetch parent objective if this objective has a parent
  const { 
    data: parentObjective,
    isLoading: isLoadingParent,
    error: parentError
  } = useQuery({
    queryKey: ['objective-parent', objective?.parentObjectiveId],
    queryFn: async () => {
      if (!objective?.parentObjectiveId) return null;
      
      const { data, error } = await supabase
        .from('objectives')
        .select('*')
        .eq('id', objective.parentObjectiveId)
        .single();
      
      if (error) {
        console.error('Error fetching parent objective:', error);
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
    enabled: !!objective?.parentObjectiveId
  });
  
  // Fetch alignments
  const { 
    data: alignments,
    isLoading: isLoadingAlignments,
    error: alignmentsError
  } = useQuery({
    queryKey: ['objective-alignments', id],
    queryFn: async () => {
      if (!id) return [];
      
      // Fetch alignments where this objective is the source
      const { data: sourceAlignments, error: sourceError } = await supabase
        .from('okr_alignments')
        .select(`
          *,
          aligned_objective:aligned_objective_id (*)
        `)
        .eq('source_objective_id', id);
      
      if (sourceError) {
        console.error('Error fetching source alignments:', sourceError);
        throw sourceError;
      }
      
      // Fetch alignments where this objective is the target
      const { data: targetAlignments, error: targetError } = await supabase
        .from('okr_alignments')
        .select(`
          *,
          source_objective:source_objective_id (*)
        `)
        .eq('aligned_objective_id', id);
      
      if (targetError) {
        console.error('Error fetching target alignments:', targetError);
        throw targetError;
      }
      
      // Transform and combine the alignments
      const formattedSourceAlignments = sourceAlignments.map(a => ({
        id: a.id,
        sourceObjectiveId: a.source_objective_id,
        alignedObjectiveId: a.aligned_objective_id,
        alignmentType: a.alignment_type,
        weight: a.weight,
        createdBy: a.created_by,
        createdAt: new Date(a.created_at),
        alignedObjective: a.aligned_objective ? {
          id: a.aligned_objective.id,
          title: a.aligned_objective.title,
          description: a.aligned_objective.description,
          cycleId: a.aligned_objective.cycle_id,
          ownerId: a.aligned_objective.owner_id,
          status: a.aligned_objective.status,
          progress: a.aligned_objective.progress,
          visibility: a.aligned_objective.visibility,
          approvalStatus: a.aligned_objective.approval_status,
          createdAt: new Date(a.aligned_objective.created_at),
          updatedAt: new Date(a.aligned_objective.updated_at)
        } : undefined
      }));
      
      const formattedTargetAlignments = targetAlignments.map(a => ({
        id: a.id,
        sourceObjectiveId: a.source_objective_id,
        alignedObjectiveId: a.aligned_objective_id,
        alignmentType: a.alignment_type,
        weight: a.weight,
        createdBy: a.created_by,
        createdAt: new Date(a.created_at),
        sourceObjective: a.source_objective ? {
          id: a.source_objective.id,
          title: a.source_objective.title,
          description: a.source_objective.description,
          cycleId: a.source_objective.cycle_id,
          ownerId: a.source_objective.owner_id,
          status: a.source_objective.status,
          progress: a.source_objective.progress,
          visibility: a.source_objective.visibility,
          approvalStatus: a.source_objective.approval_status,
          createdAt: new Date(a.source_objective.created_at),
          updatedAt: new Date(a.source_objective.updated_at)
        } : undefined
      }));
      
      return [...formattedSourceAlignments, ...formattedTargetAlignments];
    },
    enabled: !!id
  });
  
  const isLoading = isLoadingObjective || isLoadingChildren || isLoadingParent || isLoadingAlignments;
  const error = objectiveError || childrenError || parentError || alignmentsError;
  
  // Combine all the data into an ObjectiveWithRelations
  const objectiveWithRelations: ObjectiveWithRelations | undefined = objective 
    ? {
        ...objective,
        childObjectives: childObjectives || [],
        alignedObjectives: alignments || [],
        parentObjective: parentObjective || undefined
      }
    : undefined;
  
  return {
    objective: objectiveWithRelations,
    isLoading,
    error
  };
};

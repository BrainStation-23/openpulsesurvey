
import { useCallback, useState } from 'react';
import { ObjectiveWithRelations, ObjectiveAlignment, Objective, AlignmentType } from '@/types/okr';
import { supabase } from '@/integrations/supabase/client';

export const useObjectiveData = (cachedData: Map<string, ObjectiveWithRelations>) => {
  const [objectiveCache, setObjectiveCache] = useState<Map<string, ObjectiveWithRelations>>(cachedData);

  // Fetch an objective and its related data with caching
  const fetchObjectiveWithRelations = useCallback(async (objectiveId: string) => {
    // Check cache first
    if (objectiveCache.has(objectiveId)) {
      return objectiveCache.get(objectiveId);
    }
    
    try {
      console.log(`Fetching objective with relations: ${objectiveId}`);
      // Fetch the objective
      const { data: objectiveData, error: objectiveError } = await supabase
        .from('objectives')
        .select('*')
        .eq('id', objectiveId)
        .single();
        
      if (objectiveError) throw objectiveError;
      
      // Fetch child objectives
      const { data: childObjectives, error: childrenError } = await supabase
        .from('objectives')
        .select('*')
        .eq('parent_objective_id', objectiveId);
        
      if (childrenError) throw childrenError;
      
      // Fetch alignments where this objective is the source
      const { data: sourceAlignments, error: sourceError } = await supabase
        .from('okr_alignments')
        .select(`
          id,
          source_objective_id,
          aligned_objective_id,
          alignment_type,
          weight,
          created_by,
          created_at,
          aligned_objective:objectives!aligned_objective_id (*)
        `)
        .eq('source_objective_id', objectiveId);
        
      if (sourceError) throw sourceError;

      // Transform the data
      const obj = {
        id: objectiveData.id,
        title: objectiveData.title,
        description: objectiveData.description,
        cycleId: objectiveData.cycle_id,
        ownerId: objectiveData.owner_id,
        status: objectiveData.status,
        progress: objectiveData.progress,
        visibility: objectiveData.visibility,
        parentObjectiveId: objectiveData.parent_objective_id,
        sbuId: objectiveData.sbu_id,
        approvalStatus: objectiveData.approval_status,
        createdAt: new Date(objectiveData.created_at),
        updatedAt: new Date(objectiveData.updated_at),
        childObjectives: childObjectives.map((child) => ({
          id: child.id,
          title: child.title,
          description: child.description,
          cycleId: child.cycle_id,
          ownerId: child.owner_id,
          status: child.status,
          progress: child.progress,
          visibility: child.visibility,
          parentObjectiveId: child.parent_objective_id,
          sbuId: child.sbu_id,
          approvalStatus: child.approval_status,
          createdAt: new Date(child.created_at),
          updatedAt: new Date(child.updated_at)
        })),
        alignedObjectives: sourceAlignments.map((align) => ({
          id: align.id,
          sourceObjectiveId: align.source_objective_id,
          alignedObjectiveId: align.aligned_objective_id,
          alignmentType: align.alignment_type as AlignmentType,
          weight: align.weight || 1,
          createdBy: align.created_by,
          createdAt: new Date(align.created_at),
          alignedObjective: align.aligned_objective ? {
            id: align.aligned_objective.id,
            title: align.aligned_objective.title,
            description: align.aligned_objective.description,
            cycleId: align.aligned_objective.cycle_id,
            ownerId: align.aligned_objective.owner_id,
            status: align.aligned_objective.status,
            progress: align.aligned_objective.progress,
            visibility: align.aligned_objective.visibility,
            parentObjectiveId: align.aligned_objective.parent_objective_id,
            sbuId: align.aligned_objective.sbu_id,
            approvalStatus: align.aligned_objective.approval_status,
            createdAt: new Date(align.aligned_objective.created_at),
            updatedAt: new Date(align.aligned_objective.updated_at)
          } : undefined
        })) as ObjectiveAlignment[]
      };
      
      // Cache the result
      const objWithRelations = obj as ObjectiveWithRelations;
      setObjectiveCache(prev => new Map(prev).set(objectiveId, objWithRelations));
      
      return objWithRelations;
    } catch (error) {
      console.error('Error fetching objective with relations:', error);
      return null;
    }
  }, [objectiveCache]);

  return {
    fetchObjectiveWithRelations,
    objectiveCache
  };
};

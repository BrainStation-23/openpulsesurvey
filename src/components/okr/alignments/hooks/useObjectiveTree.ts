
import { useEffect, useState, useCallback } from 'react';
import { ObjectiveWithRelations, Objective, AlignmentType } from '@/types/okr';
import { useAlignments } from '@/hooks/okr/useAlignments';
import { useHierarchyProcessor } from './useHierarchyProcessor';
import { useObjectivePath } from './useObjectivePath';
import { supabase } from '@/integrations/supabase/client';

export const useObjectiveTree = (objective: ObjectiveWithRelations, isAdmin = false, canEdit = false) => {
  const { deleteAlignment } = useAlignments(objective.id);
  // We need to fetch individual objectives, so create a function for that
  const [rootObjective, setRootObjective] = useState<ObjectiveWithRelations | null>(null);
  
  // Calculate objective path for highlighting
  const { currentObjectivePath } = useObjectivePath(objective);
  
  const handleDeleteAlignment = useCallback(async (alignmentId: string) => {
    await deleteAlignment.mutateAsync(alignmentId);
  }, [deleteAlignment]);
  
  const getAlignmentById = useCallback((alignmentId: string) => {
    return objective.alignedObjectives?.find(a => a.id === alignmentId) || null;
  }, [objective.alignedObjectives]);
  
  // Create a standalone function to fetch objective with relations
  const fetchObjectiveWithRelations = useCallback(async (objectiveId: string): Promise<ObjectiveWithRelations | null> => {
    try {
      // Use the hook with the specific ID to get the objective data
      const { data, error } = await supabase
        .from('objectives')
        .select('*')
        .eq('id', objectiveId)
        .single();
      
      if (error) throw error;
      if (!data) return null;
      
      // Fetch child objectives
      const { data: childObjectives = [] } = await supabase
        .from('objectives')
        .select('*')
        .eq('parent_objective_id', objectiveId);
      
      // Fetch alignments
      const { data: alignments = [] } = await supabase
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
      
      // Transform to our internal format
      const objectiveWithRelations: ObjectiveWithRelations = {
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
        updatedAt: new Date(data.updated_at),
        childObjectives: childObjectives.map(child => ({
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
        alignedObjectives: alignments.map(align => ({
          id: align.id,
          sourceObjectiveId: align.source_objective_id,
          alignedObjectiveId: align.aligned_objective_id,
          alignmentType: align.alignment_type as AlignmentType, // Explicitly cast to AlignmentType
          weight: align.weight,
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
        }))
      };
      
      return objectiveWithRelations;
    } catch (error) {
      console.error('Error fetching objective with relations:', error);
      return null;
    }
  }, []);
  
  // Use our hierarchy processor
  const { processHierarchyData, hasProcessedData } = useHierarchyProcessor({
    isAdmin,
    canEdit,
    objective,
    handleDeleteAlignment,
    handleEditAlignment: (alignmentId: string) => {
      console.log(`Edit alignment requested for alignment: ${alignmentId}`);
      // The actual handling is done in the parent component via state
      return alignmentId;
    },
    fetchObjectiveWithRelations
  });
  
  useEffect(() => {
    // Try to find the most appropriate root objective
    const findRootObjective = async () => {
      if (objective.parentObjectiveId) {
        try {
          // If there's a parent, try to get the parent as root
          const parentObj = await fetchObjectiveWithRelations(objective.parentObjectiveId);
          if (parentObj) {
            setRootObjective(parentObj);
            return;
          }
        } catch (error) {
          console.error('Error fetching parent objective:', error);
        }
      }
      
      // If no parent or couldn't fetch parent, use current objective as root
      setRootObjective(objective);
    };
    
    findRootObjective();
  }, [objective, objective.parentObjectiveId, fetchObjectiveWithRelations]);
  
  return {
    rootObjective,
    currentObjectivePath,
    processHierarchyData,
    hasProcessedData,
    getAlignmentById
  };
};

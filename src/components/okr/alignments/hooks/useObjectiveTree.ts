
import { useEffect, useState, useCallback } from 'react';
import { ObjectiveWithRelations } from '@/types/okr';
import { useAlignments } from '@/hooks/okr/useAlignments';
import { useObjectiveWithRelations } from '@/hooks/okr/useObjectiveWithRelations';
import { useHierarchyProcessor } from './useHierarchyProcessor';
import { useObjectivePath } from './useObjectivePath';

export const useObjectiveTree = (objective: ObjectiveWithRelations, isAdmin = false, canEdit = false) => {
  const { deleteAlignment } = useAlignments(objective.id);
  // Create a standalone instance of the useObjectiveWithRelations hook for fetching
  const objectiveRelationsHook = useObjectiveWithRelations();
  const [rootObjective, setRootObjective] = useState<ObjectiveWithRelations | null>(null);
  
  // Calculate objective path for highlighting
  const { currentObjectivePath } = useObjectivePath(objective);
  
  const handleDeleteAlignment = useCallback(async (alignmentId: string) => {
    await deleteAlignment.mutateAsync(alignmentId);
  }, [deleteAlignment]);
  
  const getAlignmentById = useCallback((alignmentId: string) => {
    return objective.alignedObjectives?.find(a => a.id === alignmentId) || null;
  }, [objective.alignedObjectives]);
  
  const fetchObjectiveWithRelations = useCallback(async (objectiveId: string) => {
    const result = await objectiveRelationsHook.getObjectiveWithRelations(objectiveId);
    return result;
  }, [objectiveRelationsHook]);
  
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
          const parentObj = await objectiveRelationsHook.getObjectiveWithRelations(objective.parentObjectiveId);
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
  }, [objective, objective.parentObjectiveId, objectiveRelationsHook]);
  
  return {
    rootObjective,
    currentObjectivePath,
    processHierarchyData,
    hasProcessedData,
    getAlignmentById
  };
};

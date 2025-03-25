
import { useCallback } from 'react';
import { ObjectiveWithRelations, ObjectiveAlignment } from '@/types/okr';
import { useAlignments } from '@/hooks/okr/useAlignments';

export const useAlignmentHelpers = (objective: ObjectiveWithRelations) => {
  const { deleteAlignment } = useAlignments(objective.id);

  const findParentAlignmentId = useCallback(() => {
    if (!objective.alignedObjectives) return null;
    
    const parentAlignment = objective.alignedObjectives.find(
      alignment => alignment.alignmentType === 'parent_child' && 
                   alignment.alignedObjectiveId === objective.id
    );
    
    return parentAlignment?.id || null;
  }, [objective]);

  const findChildAlignments = useCallback(() => {
    if (!objective.alignedObjectives) return [];
    
    return objective.alignedObjectives.filter(
      alignment => alignment.alignmentType === 'parent_child' && 
                   alignment.sourceObjectiveId === objective.id
    );
  }, [objective]);

  const handleDeleteAlignment = async (alignmentId: string) => {
    try {
      await deleteAlignment.mutateAsync(alignmentId);
    } catch (error) {
      console.error('Error deleting alignment:', error);
    }
  };

  return {
    findParentAlignmentId,
    findChildAlignments,
    handleDeleteAlignment
  };
};

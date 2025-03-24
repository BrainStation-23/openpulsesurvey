
import { useState, useEffect } from 'react';
import { ObjectiveWithRelations, Objective } from '@/types/okr';
import { useAlignments } from '@/hooks/okr/useAlignments';

export const useObjectiveTree = (objective: ObjectiveWithRelations, isAdmin: boolean, canEdit: boolean) => {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    [objective.id]: true, // Main objective is expanded by default
  });
  
  const { deleteAlignment } = useAlignments(objective.id);

  // Automatically expand the parent objective and current objective
  useEffect(() => {
    const newExpandedNodes = { ...expandedNodes };
    
    // Always expand the current objective
    newExpandedNodes[objective.id] = true;
    
    // Expand parent if exists
    if (objective.parentObjective) {
      newExpandedNodes[objective.parentObjective.id] = true;
    }
    
    setExpandedNodes(newExpandedNodes);
  }, [objective.id, objective.parentObjective]);

  const toggleNode = (objectiveId: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [objectiveId]: !prev[objectiveId]
    }));
  };

  // Find parent relationship in alignments if it exists
  const findParentAlignmentId = () => {
    if (!objective.alignedObjectives) return null;
    
    // Look for an alignment where this objective is the child (aligned_objective_id)
    const parentAlignment = objective.alignedObjectives.find(
      alignment => alignment.alignmentType === 'parent_child' && 
                   alignment.alignedObjectiveId === objective.id
    );
    
    return parentAlignment?.id || null;
  };

  // Find child alignments
  const findChildAlignments = () => {
    if (!objective.alignedObjectives) return [];
    
    // Look for alignments where this objective is the parent (source_objective_id)
    return objective.alignedObjectives.filter(
      alignment => alignment.alignmentType === 'parent_child' && 
                   alignment.sourceObjectiveId === objective.id
    );
  };

  const handleDeleteAlignment = async (alignmentId: string) => {
    try {
      await deleteAlignment.mutateAsync(alignmentId);
    } catch (error) {
      console.error('Error deleting alignment:', error);
    }
  };

  return {
    expandedNodes,
    toggleNode,
    findParentAlignmentId,
    findChildAlignments,
    handleDeleteAlignment
  };
};

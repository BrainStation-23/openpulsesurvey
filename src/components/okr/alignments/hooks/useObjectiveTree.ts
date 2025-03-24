import { useState, useEffect } from 'react';
import { ObjectiveWithRelations, Objective } from '@/types/okr';
import { useAlignments } from '@/hooks/okr/useAlignments';
import { supabase } from '@/integrations/supabase/client';

interface HierarchyNode {
  id: string;
  objective: Objective;
  parentId: string | null;
  children: HierarchyNode[];
}

export const useObjectiveTree = (objective: ObjectiveWithRelations, isAdmin: boolean, canEdit: boolean) => {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    [objective.id]: true, // Main objective is expanded by default
    ...(objective.parentObjective ? { [objective.parentObjective.id]: true } : {})
  });
  
  const [rootObjective, setRootObjective] = useState<Objective | null>(null);
  const [currentObjectivePath, setCurrentObjectivePath] = useState<string[]>([]);
  const { deleteAlignment } = useAlignments(objective.id);

  useEffect(() => {
    const findRootAndPath = async () => {
      if (!objective) return;
      
      if (!objective.parentObjectiveId) {
        setRootObjective(objective);
        setCurrentObjectivePath([objective.id]);
        return;
      }
      
      try {
        let currentObj = { ...objective };
        const path = [currentObj.id];
        
        while (currentObj.parentObjectiveId) {
          const { data, error } = await supabase
            .from('objectives')
            .select('*')
            .eq('id', currentObj.parentObjectiveId)
            .single();
            
          if (error || !data) break;
          
          currentObj = {
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
          
          path.unshift(currentObj.id);
          
          setExpandedNodes(prev => ({
            ...prev,
            [currentObj.id]: true
          }));
        }
        
        setRootObjective(currentObj);
        setCurrentObjectivePath(path);
      } catch (error) {
        console.error('Error finding root objective:', error);
      }
    };
    
    findRootAndPath();
  }, [objective]);

  const toggleNode = (objectiveId: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [objectiveId]: !prev[objectiveId]
    }));
  };

  const findParentAlignmentId = () => {
    if (!objective.alignedObjectives) return null;
    
    const parentAlignment = objective.alignedObjectives.find(
      alignment => alignment.alignmentType === 'parent_child' && 
                   alignment.alignedObjectiveId === objective.id
    );
    
    return parentAlignment?.id || null;
  };

  const findChildAlignments = () => {
    if (!objective.alignedObjectives) return [];
    
    return objective.alignedObjectives.filter(
      alignment => alignment.alignmentType === 'parent_child' && 
                   alignment.sourceObjectiveId === objective.id
    );
  };

  const buildObjectiveHierarchy = (rootObj: Objective): HierarchyNode => {
    const rootNode: HierarchyNode = {
      id: rootObj.id,
      objective: rootObj,
      parentId: null,
      children: []
    };
    
    if (rootObj.id === objective.id) {
      return rootNode;
    }
    
    const addChildren = (node: HierarchyNode) => {
      if (node.id === objective.id && objective.childObjectives) {
        objective.childObjectives.forEach(childObj => {
          const childNode: HierarchyNode = {
            id: childObj.id,
            objective: childObj,
            parentId: node.id,
            children: []
          };
          node.children.push(childNode);
        });
        
        findChildAlignments().forEach(alignment => {
          if (alignment.alignedObjective) {
            const childNode: HierarchyNode = {
              id: alignment.alignedObjectiveId,
              objective: alignment.alignedObjective,
              parentId: node.id,
              children: []
            };
            if (!node.children.some(child => child.id === childNode.id)) {
              node.children.push(childNode);
            }
          }
        });
      }
      
      if (objective.parentObjectiveId === node.id) {
        const ourNode: HierarchyNode = {
          id: objective.id,
          objective: objective,
          parentId: node.id,
          children: []
        };
        node.children.push(ourNode);
        addChildren(ourNode);
      } else if (node.id === objective.id) {
      } else {
        const pathIndex = currentObjectivePath.indexOf(node.id);
        if (pathIndex >= 0 && pathIndex < currentObjectivePath.length - 1) {
          const nextInPath = currentObjectivePath[pathIndex + 1];
          if (objective.id === nextInPath) {
            const ourNode: HierarchyNode = {
              id: objective.id,
              objective: objective,
              parentId: node.id,
              children: []
            };
            node.children.push(ourNode);
            addChildren(ourNode);
          } else if (objective.parentObjective && objective.parentObjective.id === nextInPath) {
            const parentNode: HierarchyNode = {
              id: objective.parentObjective.id,
              objective: objective.parentObjective,
              parentId: node.id,
              children: []
            };
            node.children.push(parentNode);
            addChildren(parentNode);
          }
        }
      }
    };
    
    addChildren(rootNode);
    
    return rootNode;
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
    handleDeleteAlignment,
    rootObjective,
    buildObjectiveHierarchy,
    currentObjectivePath
  };
};

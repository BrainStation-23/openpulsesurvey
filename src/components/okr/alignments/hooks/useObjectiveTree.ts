
import { useState, useEffect, useCallback } from 'react';
import { ObjectiveWithRelations, Objective } from '@/types/okr';
import { useAlignments } from '@/hooks/okr/useAlignments';
import { supabase } from '@/integrations/supabase/client';
import { Edge, Node } from '@xyflow/react';

interface HierarchyNode {
  id: string;
  objective: Objective;
  parentId: string | null;
  children: HierarchyNode[];
}

export const useObjectiveTree = (objective: ObjectiveWithRelations, isAdmin: boolean, canEdit: boolean) => {
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
        }
        
        setRootObjective(currentObj);
        setCurrentObjectivePath(path);
      } catch (error) {
        console.error('Error finding root objective:', error);
      }
    };
    
    findRootAndPath();
  }, [objective]);

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

  const handleDeleteAlignment = async (alignmentId: string) => {
    try {
      await deleteAlignment.mutateAsync(alignmentId);
    } catch (error) {
      console.error('Error deleting alignment:', error);
    }
  };

  // New function for generating React Flow nodes and edges
  const processHierarchyData = useCallback((rootObj: Objective, highlightPath: string[]) => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const processedNodes = new Set<string>();
    
    // Recursive function to process each node
    const processNode = (obj: Objective, level: number, x: number, y: number, parentId?: string) => {
      if (processedNodes.has(obj.id)) return;
      
      const isCurrentObjective = obj.id === objective.id;
      const isInPath = highlightPath.includes(obj.id);
      
      // Create node
      nodes.push({
        id: obj.id,
        type: 'objectiveNode',
        position: { x, y },
        data: {
          objective: obj,
          isAdmin,
          isCurrentObjective,
          isInPath,
          canDelete: canEdit && parentId !== undefined,
          onDelete: parentId ? () => {
            // Find the alignment and delete it
            const alignment = objective.alignedObjectives?.find(
              a => (a.sourceObjectiveId === parentId && a.alignedObjectiveId === obj.id) || 
                   (a.sourceObjectiveId === obj.id && a.alignedObjectiveId === parentId)
            );
            if (alignment) handleDeleteAlignment(alignment.id);
          } : undefined
        }
      });
      
      processedNodes.add(obj.id);
      
      // Create edge if there's a parent
      if (parentId) {
        edges.push({
          id: `${parentId}-${obj.id}`,
          source: parentId,
          target: obj.id,
          type: 'smoothstep',
          style: { 
            stroke: isInPath ? '#f59e0b' : '#64748b', 
            strokeWidth: isInPath ? 3 : 2 
          }
        });
      }
      
      // Process child objectives
      if (obj.id === objective.id && objective.childObjectives) {
        const childCount = objective.childObjectives.length;
        const startX = x - ((childCount - 1) * 300) / 2;
        
        objective.childObjectives.forEach((childObj, idx) => {
          processNode(childObj, level + 1, startX + idx * 300, y + 200, obj.id);
        });
      }
      
      // Process alignments if this is the current objective
      if (obj.id === objective.id) {
        const alignments = findChildAlignments();
        if (alignments.length > 0) {
          const alignmentCount = alignments.length;
          const startX = x - ((alignmentCount - 1) * 300) / 2;
          
          alignments.forEach((alignment, idx) => {
            if (alignment.alignedObjective) {
              processNode(
                alignment.alignedObjective, 
                level + 1, 
                startX + idx * 300, 
                y + 200, 
                obj.id
              );
            }
          });
        }
      }
      
      // If this is part of the path and not the current objective, process its children
      // to continue building the path
      if (isInPath && !isCurrentObjective) {
        const pathIdx = highlightPath.indexOf(obj.id);
        if (pathIdx >= 0 && pathIdx < highlightPath.length - 1) {
          const nextId = highlightPath[pathIdx + 1];
          
          // If the next one in path is the current objective
          if (nextId === objective.id) {
            processNode(objective, level + 1, x, y + 200, obj.id);
          }
          // If the next one is the parent of current objective  
          else if (objective.parentObjective && nextId === objective.parentObjective.id) {
            processNode(objective.parentObjective, level + 1, x, y + 200, obj.id);
          }
        }
      }
    };
    
    // Start processing from the root
    processNode(rootObj, 0, 0, 0);
    
    return { nodes, edges };
  }, [objective, isAdmin, canEdit, handleDeleteAlignment, findChildAlignments]);

  return {
    findParentAlignmentId,
    findChildAlignments,
    handleDeleteAlignment,
    rootObjective,
    processHierarchyData,
    currentObjectivePath
  };
};

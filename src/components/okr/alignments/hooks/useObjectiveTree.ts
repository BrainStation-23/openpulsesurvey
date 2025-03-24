
import { useState, useEffect, useCallback } from 'react';
import { ObjectiveWithRelations, Objective } from '@/types/okr';
import { useAlignments } from '@/hooks/okr/useAlignments';
import { supabase } from '@/integrations/supabase/client';
import { Edge, Node } from '@xyflow/react';

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

  // Process objective data into graph nodes and edges
  const processHierarchyData = useCallback((rootObj: Objective, highlightPath: string[]) => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const processedNodes = new Set<string>();
    
    // Calculate positions in a tree-like layout
    const calculateNodePosition = (level: number, index: number, totalNodesInLevel: number) => {
      const horizontalSpacing = 300;
      const verticalSpacing = 150;
      const levelWidth = totalNodesInLevel * horizontalSpacing;
      const startX = -levelWidth / 2 + horizontalSpacing / 2;
      
      return {
        x: startX + index * horizontalSpacing,
        y: level * verticalSpacing
      };
    };
    
    // Recursive function to process each node
    const processNode = (
      obj: Objective, 
      level: number = 0, 
      index: number = 0, 
      totalNodesInLevel: number = 1, 
      parentId?: string
    ) => {
      if (processedNodes.has(obj.id)) return;
      
      const isCurrentObjective = obj.id === objective.id;
      const isInPath = highlightPath.includes(obj.id);
      
      // Calculate position based on level and index
      const position = calculateNodePosition(level, index, totalNodesInLevel);
      
      // Create node
      nodes.push({
        id: obj.id,
        type: 'objectiveNode',
        position,
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
          animated: isInPath,
          style: { 
            stroke: isInPath ? '#9333ea' : '#64748b', 
            strokeWidth: isInPath ? 3 : 2 
          }
        });
      }
      
      // Process children
      const childNodes: Objective[] = [];
      
      // Add child objectives if this is the current objective
      if (obj.id === objective.id && objective.childObjectives) {
        childNodes.push(...objective.childObjectives);
      }
      
      // Add aligned objectives if this is the current objective
      if (obj.id === objective.id) {
        const alignments = findChildAlignments();
        alignments.forEach(alignment => {
          if (alignment.alignedObjective) {
            childNodes.push(alignment.alignedObjective);
          }
        });
      }
      
      // Process parent relationship for current objective
      if (isInPath && !isCurrentObjective) {
        const pathIdx = highlightPath.indexOf(obj.id);
        if (pathIdx >= 0 && pathIdx < highlightPath.length - 1) {
          const nextId = highlightPath[pathIdx + 1];
          
          // If the next one in path is the current objective
          if (nextId === objective.id) {
            childNodes.push(objective);
          }
          // If the next one is the parent of current objective  
          else if (objective.parentObjective && nextId === objective.parentObjective.id) {
            childNodes.push(objective.parentObjective);
          }
        }
      }
      
      // Process all child nodes
      if (childNodes.length > 0) {
        childNodes.forEach((childObj, idx) => {
          processNode(childObj, level + 1, idx, childNodes.length, obj.id);
        });
      }
    };
    
    // Start processing from the root
    processNode(rootObj, 0, 0, 1);
    
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

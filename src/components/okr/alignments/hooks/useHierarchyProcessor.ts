
import { useCallback } from 'react';
import { Objective, ObjectiveWithRelations } from '@/types/okr';
import { Node, Edge } from '@xyflow/react';

interface HierarchyProcessorProps {
  isAdmin: boolean;
  canEdit: boolean;
  objective: ObjectiveWithRelations;
  handleDeleteAlignment: (alignmentId: string) => Promise<void>;
  fetchObjectiveWithRelations: (objectiveId: string) => Promise<ObjectiveWithRelations | null>;
}

export const useHierarchyProcessor = ({
  isAdmin,
  canEdit,
  objective,
  handleDeleteAlignment,
  fetchObjectiveWithRelations
}: HierarchyProcessorProps) => {
  
  // Process objective data into graph nodes and edges
  const processHierarchyData = useCallback(async (rootObj: Objective, highlightPath: string[]) => {
    console.log('Starting to process hierarchy data');
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
    
    // Process nodes breadth-first instead of depth-first to improve performance
    const processHierarchy = async () => {
      const queue: Array<{
        obj: Objective | ObjectiveWithRelations,
        level: number,
        index: number,
        totalNodesInLevel: number,
        parentId?: string
      }> = [{
        obj: rootObj,
        level: 0,
        index: 0,
        totalNodesInLevel: 1
      }];
      
      while (queue.length > 0) {
        const { obj, level, index, totalNodesInLevel, parentId } = queue.shift()!;
        
        if (processedNodes.has(obj.id)) continue;
        
        const isCurrentObjective = obj.id === objective.id;
        const isInPath = highlightPath.includes(obj.id);
        
        // Calculate position
        const position = calculateNodePosition(level, index, totalNodesInLevel);
        
        // Create node
        nodes.push({
          id: obj.id,
          type: 'objectiveNode',
          position,
          draggable: true, // Allow dragging for better UX
          data: {
            objective: obj,
            isAdmin,
            isCurrentObjective,
            isInPath,
            canDelete: canEdit && parentId !== undefined,
            onDelete: parentId ? () => {
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
        
        // Fetch complete objective data with relations if needed
        let objWithRelations = obj as ObjectiveWithRelations;
        if (!('childObjectives' in obj) || !('alignedObjectives' in obj)) {
          const fetchedObj = await fetchObjectiveWithRelations(obj.id);
          if (fetchedObj) {
            objWithRelations = fetchedObj;
          }
        }
        
        // Process child objectives
        const childNodes: Objective[] = [];
        
        // Add direct child objectives
        if (objWithRelations.childObjectives && objWithRelations.childObjectives.length > 0) {
          childNodes.push(...objWithRelations.childObjectives);
        }
        
        // Add aligned objectives
        if (objWithRelations.alignedObjectives && objWithRelations.alignedObjectives.length > 0) {
          const alignments = objWithRelations.alignedObjectives.filter(
            alignment => alignment.alignmentType === 'parent_child' && 
                        alignment.sourceObjectiveId === obj.id
          );
          
          alignments.forEach(alignment => {
            if (alignment.alignedObjective) {
              childNodes.push(alignment.alignedObjective);
            }
          });
        }
        
        // Add child nodes to queue
        if (childNodes.length > 0) {
          childNodes.forEach((childObj, idx) => {
            queue.push({
              obj: childObj,
              level: level + 1,
              index: idx,
              totalNodesInLevel: childNodes.length,
              parentId: obj.id
            });
          });
        }
      }
    };
    
    await processHierarchy();
    console.log(`Processed ${nodes.length} nodes and ${edges.length} edges`);
    
    return { nodes, edges };
  }, [objective, isAdmin, canEdit, handleDeleteAlignment, fetchObjectiveWithRelations]);

  return { processHierarchyData };
};

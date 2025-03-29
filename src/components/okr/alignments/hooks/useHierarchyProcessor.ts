import { useCallback, useRef } from 'react';
import { Objective, ObjectiveWithRelations, ObjectiveAlignment } from '@/types/okr';
import { Node, Edge } from '@xyflow/react';

// Define a type for the node data
interface NodeData {
  objective: Objective;
  isAdmin: boolean;
  isCurrentObjective: boolean;
  isInPath: boolean;
  canDelete: boolean;
  canEdit: boolean;
  parentId?: string;
  alignment?: ObjectiveAlignment | null;
  onDelete?: () => void;
  onEdit?: () => void;
  [key: string]: unknown; // Adding index signature to satisfy Record<string, unknown>
}

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
  // Use a ref to store the last processed result to prevent reprocessing the same data
  const lastProcessedResult = useRef<{
    rootId: string;
    pathHash: string;
    result: { nodes: Node<NodeData>[]; edges: Edge[] };
  } | null>(null);
  
  // Process objective data into graph nodes and edges
  const processHierarchyData = useCallback(async (
    rootObj: Objective, 
    highlightPath: string[],
    useCache: boolean = false
  ) => {
    console.log('Starting to process hierarchy data');
    
    // Create a hash of the current path to use for caching
    const pathHash = highlightPath.join('-');
    
    // Check if we've already processed this exact hierarchy and path
    if (useCache && lastProcessedResult.current && 
        lastProcessedResult.current.rootId === rootObj.id &&
        lastProcessedResult.current.pathHash === pathHash) {
      console.log('Using cached hierarchy data');
      return lastProcessedResult.current.result;
    }
    
    const nodes: Node<NodeData>[] = [];
    const edges: Edge[] = [];
    const processedNodes = new Set<string>();
    
    // Calculate positions in a tree-like layout
    const calculateNodePosition = (level: number, index: number, totalNodesInLevel: number) => {
      const horizontalSpacing = 300;
      const verticalSpacing = 150;
      const levelWidth = Math.max(totalNodesInLevel * horizontalSpacing, horizontalSpacing);
      const startX = -levelWidth / 2 + horizontalSpacing / 2;
      
      return {
        x: startX + index * horizontalSpacing,
        y: level * verticalSpacing
      };
    };
    
    // Process nodes breadth-first instead of depth-first to improve performance
    const processHierarchy = async () => {
      console.log(`Processing hierarchy starting from objective: ${rootObj.id} (${rootObj.title})`);
      
      const queue: Array<{
        obj: Objective | ObjectiveWithRelations,
        level: number,
        index: number,
        totalNodesInLevel: number,
        parentId?: string,
        alignment?: ObjectiveAlignment | null
      }> = [{
        obj: rootObj,
        level: 0,
        index: 0,
        totalNodesInLevel: 1
      }];
      
      while (queue.length > 0) {
        const { obj, level, index, totalNodesInLevel, parentId, alignment } = queue.shift()!;
        
        if (processedNodes.has(obj.id)) {
          console.log(`Node ${obj.id} already processed, skipping`);
          continue;
        }
        
        console.log(`Processing node ${obj.id} (${obj.title}) at level ${level}, index ${index}`);
        
        const isCurrentObjective = obj.id === objective.id;
        const isInPath = highlightPath.includes(obj.id);
        
        // Calculate position
        const position = calculateNodePosition(level, index, totalNodesInLevel);
        
        // Set correct permissions - IMPORTANT: Make parentId and alignment checks more explicit
        const nodeCanDelete = canEdit && !!parentId;
        const nodeCanEdit = canEdit && !!parentId && !!alignment;
        
        console.log(`Node ${obj.id} permissions:`, { nodeCanDelete, nodeCanEdit, parentId, hasAlignment: !!alignment });
        
        // Create node
        const nodeData = {
          id: obj.id,
          type: 'objectiveNode',
          position,
          draggable: true, // Allow dragging for better UX
          data: {
            objective: obj,
            isAdmin,
            isCurrentObjective,
            isInPath,
            canDelete: nodeCanDelete,
            canEdit: nodeCanEdit,
            parentId,
            alignment,
            onDelete: parentId && alignment ? () => {
              handleDeleteAlignment(alignment.id);
            } : undefined,
            onEdit: () => {
              // This will trigger a refresh of the graph data
              console.log('Alignment edited, refreshing graph');
            }
          }
        };
        
        nodes.push(nodeData);
        console.log(`Added node: ${obj.id} (${obj.title}) at position (${position.x}, ${position.y})`);
        
        processedNodes.add(obj.id);
        
        // Create edge if there's a parent
        if (parentId) {
          const edgeData = {
            id: `${parentId}-${obj.id}`,
            source: parentId,
            target: obj.id,
            type: 'smoothstep',
            animated: isInPath,
            style: { 
              stroke: isInPath ? '#9333ea' : '#64748b', 
              strokeWidth: isInPath ? 3 : 2 
            }
          };
          
          edges.push(edgeData);
          console.log(`Added edge: ${parentId} -> ${obj.id}`);
        }
        
        // Fetch complete objective data with relations if needed
        let objWithRelations = obj as ObjectiveWithRelations;
        if (!('childObjectives' in obj) || !('alignedObjectives' in obj)) {
          console.log(`Fetching complete data for objective: ${obj.id}`);
          const fetchedObj = await fetchObjectiveWithRelations(obj.id);
          if (fetchedObj) {
            objWithRelations = fetchedObj;
          } else {
            console.warn(`Failed to fetch data for objective: ${obj.id}`);
          }
        }
        
        // Process child objectives
        const childNodes: { 
          objective: Objective, 
          alignment?: ObjectiveAlignment 
        }[] = [];
        
        // Add direct child objectives
        if (objWithRelations.childObjectives && objWithRelations.childObjectives.length > 0) {
          console.log(`Adding ${objWithRelations.childObjectives.length} child objectives for ${obj.id}`);
          objWithRelations.childObjectives.forEach(child => {
            childNodes.push({ objective: child });
          });
        }
        
        // Add aligned objectives
        if (objWithRelations.alignedObjectives && objWithRelations.alignedObjectives.length > 0) {
          const alignments = objWithRelations.alignedObjectives.filter(
            alignment => alignment.alignmentType === 'parent_child' && 
                        alignment.sourceObjectiveId === obj.id
          );
          
          console.log(`Adding ${alignments.length} aligned objectives for ${obj.id}`);
          
          alignments.forEach(alignment => {
            if (alignment.alignedObjective) {
              childNodes.push({ 
                objective: alignment.alignedObjective,
                alignment: alignment
              });
            } else {
              console.warn(`Alignment ${alignment.id} is missing alignedObjective data`);
            }
          });
        }
        
        // Add child nodes to queue
        if (childNodes.length > 0) {
          console.log(`Queuing ${childNodes.length} child nodes for ${obj.id}`);
          childNodes.forEach((childData, idx) => {
            queue.push({
              obj: childData.objective,
              level: level + 1,
              index: idx,
              totalNodesInLevel: childNodes.length,
              parentId: obj.id,
              alignment: childData.alignment
            });
          });
        } else {
          console.log(`No child nodes found for ${obj.id}`);
        }
      }
    };
    
    await processHierarchy();
    
    // Store the result in cache
    const result = { nodes, edges };
    lastProcessedResult.current = {
      rootId: rootObj.id,
      pathHash,
      result
    };
    
    console.log(`Processed ${nodes.length} nodes and ${edges.length} edges`);
    
    // Validate that nodes and edges are correctly formatted
    if (nodes.length === 0) {
      console.warn('No nodes were generated for the hierarchy');
    }
    
    // Check for common issues
    nodes.forEach(node => {
      if (!node.id) console.error('Node missing ID', node);
      if (!node.position) console.error('Node missing position', node);
      if (!node.data?.objective) console.error('Node missing objective data', node);
    });
    
    return result;
  }, [objective, isAdmin, canEdit, handleDeleteAlignment, fetchObjectiveWithRelations]);

  return { 
    processHierarchyData,
    // Return a method to check if we already have processed data
    hasProcessedData: (rootId: string, path: string[]) => {
      const pathHash = path.join('-');
      return lastProcessedResult.current?.rootId === rootId && 
             lastProcessedResult.current?.pathHash === pathHash;
    }
  };
};

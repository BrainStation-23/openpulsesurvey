
import { useCallback, useRef } from 'react';
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
  // Use a ref to store the last processed result to prevent reprocessing the same data
  const lastProcessedResult = useRef<{
    rootId: string;
    pathHash: string;
    result: { nodes: Node[]; edges: Edge[] };
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
    
    // Configuration for layout spacing
    const VERTICAL_SPACING = 200;  // Increased vertical space between levels
    const HORIZONTAL_SPACING = 250; // Space between siblings
    const NODE_WIDTH = 180; // Approximate width of a node

    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const processedNodes = new Set<string>();
    
    // First pass: Calculate node hierarchy and collect children information
    const nodeMap = new Map<string, { 
      node: Objective,
      children: string[],
      level: number,
      width: number, // Required width for this subtree
      position?: { x: number, y: number }
    }>();
    
    const collectNodeInfo = async (
      node: Objective | ObjectiveWithRelations, 
      level: number, 
      parentId?: string
    ) => {
      if (processedNodes.has(node.id)) {
        return;
      }
      
      processedNodes.add(node.id);
      nodeMap.set(node.id, { node, children: [], level, width: 0 });
      
      // Fetch complete objective data with relations if needed
      let objWithRelations = node as ObjectiveWithRelations;
      if (!('childObjectives' in node) || !('alignedObjectives' in node)) {
        const fetchedObj = await fetchObjectiveWithRelations(node.id);
        if (fetchedObj) {
          objWithRelations = fetchedObj;
        }
      }
      
      // Collect all child nodes
      const childNodes: Objective[] = [];
      
      // Add direct child objectives
      if (objWithRelations.childObjectives && objWithRelations.childObjectives.length > 0) {
        childNodes.push(...objWithRelations.childObjectives);
      }
      
      // Add aligned objectives
      if (objWithRelations.alignedObjectives && objWithRelations.alignedObjectives.length > 0) {
        const alignments = objWithRelations.alignedObjectives.filter(
          alignment => alignment.alignmentType === 'parent_child' && 
                      alignment.sourceObjectiveId === node.id
        );
        
        alignments.forEach(alignment => {
          if (alignment.alignedObjective) {
            childNodes.push(alignment.alignedObjective);
          }
        });
      }
      
      // Process each child and add to parent's children list
      for (const child of childNodes) {
        if (!processedNodes.has(child.id)) {
          const nodeInfo = nodeMap.get(node.id);
          if (nodeInfo) {
            nodeInfo.children.push(child.id);
          }
          await collectNodeInfo(child, level + 1, node.id);
        }
      }
    };
    
    // Start with the root node
    await collectNodeInfo(rootObj, 0);
    
    // Second pass: Calculate widths for each subtree
    const calculateSubtreeWidth = (nodeId: string): number => {
      const nodeInfo = nodeMap.get(nodeId);
      if (!nodeInfo) return NODE_WIDTH;
      
      if (nodeInfo.children.length === 0) {
        nodeInfo.width = NODE_WIDTH;
        return NODE_WIDTH;
      }
      
      // Calculate width of all children
      let totalChildrenWidth = 0;
      for (const childId of nodeInfo.children) {
        totalChildrenWidth += calculateSubtreeWidth(childId);
      }
      
      // Add spacing between children
      if (nodeInfo.children.length > 1) {
        totalChildrenWidth += (nodeInfo.children.length - 1) * HORIZONTAL_SPACING;
      }
      
      // Node width is max of its own width and width of all children
      nodeInfo.width = Math.max(NODE_WIDTH, totalChildrenWidth);
      return nodeInfo.width;
    };
    
    // Start width calculation from root
    calculateSubtreeWidth(rootObj.id);
    
    // Clear processed nodes for the next phase
    processedNodes.clear();
    
    // Third pass: Calculate positions for all nodes
    const calculateNodePositions = (nodeId: string, startX: number, y: number) => {
      const nodeInfo = nodeMap.get(nodeId);
      if (!nodeInfo || processedNodes.has(nodeId)) return;
      
      processedNodes.add(nodeId);
      
      // Calculate center position for this node
      const x = startX + (nodeInfo.width / 2) - (NODE_WIDTH / 2);
      nodeInfo.position = { x, y };
      
      // If no children, we're done
      if (nodeInfo.children.length === 0) return;
      
      // Calculate positions for children
      let childStartX = startX;
      for (const childId of nodeInfo.children) {
        const childInfo = nodeMap.get(childId);
        if (childInfo) {
          calculateNodePositions(
            childId, 
            childStartX, 
            y + VERTICAL_SPACING
          );
          childStartX += childInfo.width + HORIZONTAL_SPACING;
        }
      }
    };
    
    // Start position calculation from root
    calculateNodePositions(rootObj.id, 0, 0);
    
    // Fourth pass: Create nodes and edges
    for (const [id, info] of nodeMap.entries()) {
      if (!info.position) continue;
      
      const isCurrentObjective = id === objective.id;
      const isInPath = highlightPath.includes(id);
      const parentId = Array.from(nodeMap.entries()).find(
        ([_, nodeInfo]) => nodeInfo.children.includes(id)
      )?.[0];
      
      // Create node
      const nodeData = {
        id,
        type: 'objectiveNode',
        position: info.position,
        draggable: true,
        data: {
          objective: info.node,
          isAdmin,
          isCurrentObjective,
          isInPath,
          canDelete: canEdit && parentId !== undefined,
          onDelete: parentId ? () => {
            const alignment = objective.alignedObjectives?.find(
              a => (a.sourceObjectiveId === parentId && a.alignedObjectiveId === id) || 
                  (a.sourceObjectiveId === id && a.alignedObjectiveId === parentId)
            );
            if (alignment) handleDeleteAlignment(alignment.id);
          } : undefined
        }
      };
      
      nodes.push(nodeData);
      
      // Create edge if there's a parent
      if (parentId) {
        const edgeData = {
          id: `${parentId}-${id}`,
          source: parentId,
          target: id,
          type: 'smoothstep',
          animated: isInPath,
          style: { 
            stroke: isInPath ? '#9333ea' : '#64748b', 
            strokeWidth: isInPath ? 3 : 2 
          }
        };
        
        edges.push(edgeData);
      }
    }
    
    // Store the result in cache
    const result = { nodes, edges };
    lastProcessedResult.current = {
      rootId: rootObj.id,
      pathHash,
      result
    };
    
    console.log(`Processed ${nodes.length} nodes and ${edges.length} edges`);
    
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

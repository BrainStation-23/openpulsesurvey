import { Edge, Node } from '@xyflow/react';
import { Objective, ObjectiveWithRelations } from '@/types/okr';
import { useState, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';

interface HierarchyProcessorOptions {
  isAdmin: boolean;
  canEdit: boolean;
  objective: ObjectiveWithRelations;
  handleDeleteAlignment: (alignmentId: string, callback?: () => void) => void;
  fetchObjectiveWithRelations: (id: string) => Promise<ObjectiveWithRelations>;
}

interface NodeData {
  objective: Objective;
  isAdmin: boolean;
  isCurrentObjective: boolean;
  isInPath: boolean;
  canDelete: boolean;
  canEdit: boolean;
  onDelete?: () => void;
}

interface HierarchyData {
  nodes: Node<NodeData>[];
  edges: Edge[];
}

export const useHierarchyProcessor = ({
  isAdmin,
  canEdit,
  objective,
  handleDeleteAlignment,
  fetchObjectiveWithRelations
}: HierarchyProcessorOptions) => {
  const [processedData, setProcessedData] = useState<Map<string, HierarchyData>>(new Map());
  const { toast } = useToast();

  // Function to check if we've already processed a particular hierarchy
  const hasProcessedData = useCallback((rootId: string, pathIds: string[]) => {
    // Convert array to string for map key
    const key = `${rootId}-${pathIds.join('-')}`;
    return processedData.has(key);
  }, [processedData]);

  // Process the hierarchy data to create nodes and edges for ReactFlow
  const processHierarchyData = useCallback(async (
    rootObjective: ObjectiveWithRelations,
    currentObjectivePath: string[] = [],
    useCache = false
  ): Promise<HierarchyData> => {
    const nodes: Node<NodeData>[] = [];
    const edges: Edge[] = [];
    const processedNodes = new Set<string>();
    const layoutLevels: { [level: number]: number } = {};
    const horizontalSpacing = 250;
    const verticalSpacing = 150;
    
    // Create a unique key for this hierarchy configuration
    const cacheKey = `${rootObjective.id}-${currentObjectivePath.join('-')}`;

    // Check cache first if requested
    if (useCache && processedData.has(cacheKey)) {
      return processedData.get(cacheKey)!;
    }

    // Function to recursively process objectives and their relationships
    const processObjective = async (
      obj: ObjectiveWithRelations | Objective,
      level: number = 0,
      horizontalPosition: number = 0,
      path: string[] = [], 
      parent?: ObjectiveWithRelations
    ) => {
      if (processedNodes.has(obj.id)) return;
      processedNodes.add(obj.id);

      // Keep track of how many nodes we have at each level for positioning
      if (!layoutLevels[level]) {
        layoutLevels[level] = 0;
      }
      layoutLevels[level]++;

      // Calculate position
      const xPos = horizontalPosition * horizontalSpacing;
      const yPos = level * verticalSpacing;

      // Check if this objective is in the current path
      const isInPath = currentObjectivePath.includes(obj.id);
      const isCurrentObjective = objective.id === obj.id;

      // Add the node
      const nodeId = obj.id;
      nodes.push({
        id: nodeId,
        type: 'objectiveNode',
        position: { x: xPos, y: yPos },
        data: {
          objective: obj,
          isAdmin,
          isCurrentObjective,
          isInPath,
          canDelete: canEdit && parent !== undefined,
          canEdit: canEdit,
          onDelete: parent ? () => {
            // Need to find the alignment ID between parent and obj
            const alignment = parent.sourceAlignments?.find(
              a => a.alignedObjectiveId === obj.id
            );

            if (alignment && alignment.id) {
              handleDeleteAlignment(alignment.id, () => {
                // Clear the processed data cache to force a refresh
                setProcessedData(new Map());
                toast({
                  title: "Alignment removed",
                  description: "The alignment has been successfully removed."
                });
              });
            }
          } : undefined
        }
      });

      // Check if we need to add an edge from parent to this node
      if (parent) {
        edges.push({
          id: `${parent.id}-${nodeId}`,
          source: parent.id,
          target: nodeId,
          animated: isInPath,
          style: {
            stroke: isInPath ? '#9333EA' : '#94a3b8', // Purple if in path, gray otherwise
            strokeWidth: isInPath ? 2 : 1
          }
        });
      }

      // Get the full objective with relations if this is just a basic objective
      let objWithRelations = obj as ObjectiveWithRelations;
      if (!('sourceAlignments' in obj) && !useCache) {
        try {
          objWithRelations = await fetchObjectiveWithRelations(obj.id);
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Error loading alignments",
            description: error instanceof Error ? error.message : "Failed to load objective alignments"
          });
          return;
        }
      }

      // Process child objectives
      if (objWithRelations.sourceAlignments?.length) {
        // Count how many child nodes we'll have
        const childCount = objWithRelations.sourceAlignments.length;
        
        // Start children at position that centers them under parent
        const startPosition = horizontalPosition - (childCount - 1) / 2;
        
        // Process each child
        for (let i = 0; i < objWithRelations.sourceAlignments.length; i++) {
          const alignment = objWithRelations.sourceAlignments[i];
          const childPosition = startPosition + i;
          
          // Fetch the full objective if we only have the ID
          if (alignment.alignedObjective) {
            await processObjective(
              alignment.alignedObjective,
              level + 1,
              childPosition,
              [...path, obj.id],
              objWithRelations
            );
          }
        }
      }
    };

    // Start processing from the root objective
    await processObjective(rootObjective, 0, 0, [], undefined);

    // Cache the result
    const result = { nodes, edges };
    setProcessedData(prev => new Map(prev).set(cacheKey, result));
    
    return result;
  }, [objective.id, isAdmin, canEdit, handleDeleteAlignment, fetchObjectiveWithRelations, toast]);

  // Return the hook functions
  return {
    processHierarchyData,
    hasProcessedData
  };
};

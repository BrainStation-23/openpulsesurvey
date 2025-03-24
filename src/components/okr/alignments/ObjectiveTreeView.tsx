
import React, { useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ObjectiveWithRelations } from '@/types/okr';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useObjectiveTree } from './hooks/useObjectiveTree';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ObjectiveNode } from './components/ObjectiveNode';

interface ObjectiveTreeViewProps {
  objective: ObjectiveWithRelations;
  isAdmin?: boolean;
}

export const ObjectiveTreeView: React.FC<ObjectiveTreeViewProps> = ({ 
  objective,
  isAdmin = false
}) => {
  const { userId, isAdmin: userIsAdmin } = useCurrentUser();
  const canEdit = userIsAdmin || isAdmin || objective.ownerId === userId;
  
  const {
    handleDeleteAlignment,
    rootObjective,
    currentObjectivePath,
    processHierarchyData
  } = useObjectiveTree(objective, isAdmin, canEdit);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Use the rootObjective to build the graph
  useEffect(() => {
    if (rootObjective) {
      const { nodes: graphNodes, edges: graphEdges } = processHierarchyData(rootObjective, currentObjectivePath);
      setNodes(graphNodes);
      setEdges(graphEdges);
    }
  }, [rootObjective, currentObjectivePath, processHierarchyData]);

  const nodeTypes = {
    objectiveNode: ObjectiveNode
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="text-sm font-medium text-muted-foreground mb-3">Objective Hierarchy</div>
        <div className="h-[500px] border rounded-md overflow-hidden">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.1}
            maxZoom={2}
            proOptions={{ hideAttribution: true }}
          >
            <Controls />
            <MiniMap zoomable pannable />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>
        </div>
      </CardContent>
    </Card>
  );
};

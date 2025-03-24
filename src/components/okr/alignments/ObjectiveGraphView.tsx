
import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ObjectiveWithRelations } from '@/types/okr';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useObjectiveTree } from './hooks/useObjectiveTree';
import { useAlignments } from '@/hooks/okr/useAlignments';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ObjectiveNode } from './components/ObjectiveNode';
import { Maximize2, Minimize2 } from 'lucide-react';

interface ObjectiveGraphViewProps {
  objective: ObjectiveWithRelations;
  isAdmin?: boolean;
  canEdit?: boolean;
}

export const ObjectiveGraphView: React.FC<ObjectiveGraphViewProps> = ({ 
  objective,
  isAdmin = false,
  canEdit = false
}) => {
  const { userId, isAdmin: userIsAdmin } = useCurrentUser();
  const { deleteAlignment } = useAlignments(objective.id);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const graphRef = useRef<HTMLDivElement>(null);
  
  const {
    rootObjective,
    currentObjectivePath,
    processHierarchyData
  } = useObjectiveTree(objective, isAdmin, canEdit);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const handleDeleteAlignment = async (alignmentId: string) => {
    try {
      await deleteAlignment.mutateAsync(alignmentId);
    } catch (error) {
      console.error('Error deleting alignment:', error);
    }
  };

  // Toggle fullscreen functionality
  const toggleFullscreen = () => {
    if (!graphRef.current) return;
    
    if (!isFullscreen) {
      if (graphRef.current.requestFullscreen) {
        graphRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Memoized node types to prevent unnecessary re-renders
  const nodeTypes = useMemo(() => ({
    objectiveNode: ObjectiveNode
  }), []);

  // Prepare the graph data when the root objective changes
  useEffect(() => {
    if (rootObjective) {
      const { nodes: graphNodes, edges: graphEdges } = processHierarchyData(rootObjective, currentObjectivePath);
      setNodes(graphNodes);
      setEdges(graphEdges);
    }
  }, [rootObjective, currentObjectivePath, processHierarchyData, setNodes, setEdges]);

  return (
    <Card className={`shadow-sm ${isFullscreen ? 'fullscreen-card' : ''}`}>
      <CardContent className="p-4">
        <div className="text-sm font-medium text-muted-foreground mb-3">Objective Hierarchy Graph</div>
        <div 
          ref={graphRef}
          className={`${isFullscreen ? 'h-screen w-full' : 'h-[500px]'} border rounded-md overflow-hidden relative`}
        >
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
            <Panel position="top-right">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white" 
                onClick={toggleFullscreen}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </Panel>
            <Controls />
            <MiniMap 
              zoomable 
              pannable 
              nodeStrokeWidth={3}
              nodeStrokeColor={(n) => {
                if (n.id === objective.id) return '#f59e0b';
                return currentObjectivePath.includes(n.id) ? '#9333ea' : '#64748b';
              }}
              nodeBorderRadius={10}
            />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>
        </div>
      </CardContent>
    </Card>
  );
};

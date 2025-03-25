
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
import { LoadingSpinner } from '@/components/ui/loading-spinner';

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
  const [isLoading, setIsLoading] = useState(true);
  
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

  // Prepare the graph data only when rootObjective changes
  useEffect(() => {
    if (rootObjective) {
      setIsLoading(true);
      
      const loadGraphData = async () => {
        try {
          console.log('Processing hierarchy data...');
          const graphData = await processHierarchyData(rootObjective, currentObjectivePath);
          
          // Update nodes and edges atomically to avoid flickering
          setNodes(graphData.nodes);
          setEdges(graphData.edges);
        } catch (error) {
          console.error('Error processing hierarchy data:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      loadGraphData();
    }
  }, [rootObjective, currentObjectivePath, processHierarchyData, setNodes, setEdges]);

  // Memoize ReactFlow options to prevent re-renders
  const reactFlowOptions = useMemo(() => ({
    fitView: true,
    minZoom: 0.1,
    maxZoom: 2,
    proOptions: { hideAttribution: true },
    fitViewOptions: { padding: 0.2 }
  }), []);

  return (
    <Card className={`shadow-sm ${isFullscreen ? 'fullscreen-card' : ''}`}>
      <CardContent className="p-4">
        <div className="text-sm font-medium text-muted-foreground mb-3">Objective Hierarchy Graph</div>
        <div 
          ref={graphRef}
          className={`${isFullscreen ? 'h-screen w-full' : 'h-[500px]'} border rounded-md overflow-hidden relative`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full w-full">
              <div className="text-center space-y-3">
                <LoadingSpinner size="lg" />
                <p className="text-sm text-muted-foreground">Building objective hierarchy...</p>
              </div>
            </div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              {...reactFlowOptions}
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
                  return currentObjectivePath.includes(n.id as string) ? '#9333ea' : '#64748b';
                }}
                nodeBorderRadius={10}
              />
              <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

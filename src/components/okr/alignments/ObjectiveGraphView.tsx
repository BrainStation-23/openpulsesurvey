import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Node,
  Edge,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ObjectiveNode } from './components/ObjectiveNode';
import { Maximize2, Minimize2, AlertTriangle } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from "@/hooks/use-toast";

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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const graphRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dataLoadedRef = useRef(false);
  const { toast } = useToast();
  
  const {
    rootObjective,
    currentObjectivePath,
    processHierarchyData,
    hasProcessedData
  } = useObjectiveTree(objective, isAdmin, canEdit);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

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

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const nodeTypes = useMemo(() => ({
    objectiveNode: ObjectiveNode
  }), []);

  useEffect(() => {
    let mounted = true;
    
    const loadGraphData = async () => {
      if (!rootObjective || dataLoadedRef.current) return;
      
      if (rootObjective && hasProcessedData && 
          hasProcessedData(rootObjective.id, currentObjectivePath)) {
        console.log('Using cached hierarchy data');
        const cachedData = await processHierarchyData(rootObjective, currentObjectivePath, true);
        if (mounted) {
          if (cachedData.nodes.length === 0) {
            console.error('No nodes found in cached data');
            setError('No objectives found in the hierarchy. The graph may be empty.');
          } else {
            console.log(`Loaded ${cachedData.nodes.length} nodes and ${cachedData.edges.length} edges from cache`);
            setNodes(cachedData.nodes);
            setEdges(cachedData.edges);
          }
          dataLoadedRef.current = true;
          setIsLoading(false);
        }
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Processing hierarchy data for display...');
        const graphData = await processHierarchyData(rootObjective, currentObjectivePath, false);
        
        if (mounted) {
          if (!graphData || graphData.nodes.length === 0) {
            console.error('No nodes found in processed hierarchy data');
            setError('No objectives found in the hierarchy. The graph may be empty.');
          } else {
            console.log(`Processed ${graphData.nodes.length} nodes and ${graphData.edges.length} edges`);
            setNodes(graphData.nodes);
            setEdges(graphData.edges);
          }
          dataLoadedRef.current = true;
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error processing hierarchy data:', error);
        if (mounted) {
          setError(`Error loading objective hierarchy: ${error instanceof Error ? error.message : 'Unknown error'}`);
          toast({
            variant: "destructive",
            title: "Error loading objective hierarchy",
            description: error instanceof Error ? error.message : 'An unexpected error occurred'
          });
          setIsLoading(false);
        }
      }
    };
    
    loadGraphData();

    return () => {
      mounted = false;
    };
  }, [rootObjective, currentObjectivePath, processHierarchyData, hasProcessedData, toast]);

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
                <LoadingSpinner size={36} />
                <p className="text-sm text-muted-foreground">Building objective hierarchy...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full w-full">
              <div className="text-center space-y-3">
                <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto" />
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
          ) : nodes.length === 0 ? (
            <div className="flex items-center justify-center h-full w-full">
              <div className="text-center space-y-3">
                <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto" />
                <p className="text-sm text-muted-foreground">No objectives found in the hierarchy</p>
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
                  const nodeId = String(n.id);
                  const objectiveId = String(objective.id);
                  
                  if (nodeId === objectiveId) return '#f59e0b';
                  return currentObjectivePath.includes(nodeId) ? '#9333ea' : '#64748b';
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

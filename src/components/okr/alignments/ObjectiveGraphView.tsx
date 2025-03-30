
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ObjectiveWithRelations } from '@/types/okr';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useObjectiveTree } from './hooks/useObjectiveTree';
import { useBFSHierarchyLoader } from './hooks/useBFSHierarchyLoader';
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
import { Progress } from '@/components/ui/progress';

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
    hasProcessedData,
    handleDeleteAlignment
  } = useObjectiveTree(objective, isAdmin, canEdit);

  const { 
    findRootObjective, 
    loadObjectiveHierarchy, 
    loadingState 
  } = useBFSHierarchyLoader();

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

  // Load the hierarchy using BFS when the component mounts
  useEffect(() => {
    let mounted = true;
    
    const loadGraphData = async () => {
      if (!objective || dataLoadedRef.current) return;
      
      try {
        console.log('Starting BFS hierarchy loading process...');
        setIsLoading(true);
        setError(null);
        
        // Step 1: Find the root objective (objective with no parent)
        console.log('Finding root objective...');
        const root = await findRootObjective(objective.id);
        
        if (!mounted) return;
        
        if (!root) {
          console.error('Could not find root objective');
          setError('Could not find the root objective in the hierarchy.');
          setIsLoading(false);
          return;
        }
        
        // Step 2: Load the entire hierarchy using BFS
        console.log(`Found root objective: ${root.id}. Loading full hierarchy...`);
        const hierarchyMap = await loadObjectiveHierarchy(root.id);
        
        if (!mounted) return;
        
        if (hierarchyMap.size === 0) {
          setError('No objectives found in the hierarchy.');
          setIsLoading(false);
          return;
        }
        
        console.log(`Loaded ${hierarchyMap.size} objectives in the hierarchy.`);
        
        // Step 3: Build the graph using the hierarchy data
        const path = currentObjectivePath.length > 0 ? currentObjectivePath : [objective.id];
        const graphData = await processHierarchyData(root, path, false, hierarchyMap);
        
        if (!mounted) return;
        
        if (!graphData || graphData.nodes.length === 0) {
          setError('Could not build the hierarchy visualization.');
          setIsLoading(false);
          return;
        }
        
        // Step 4: Update the graph
        setNodes(graphData.nodes);
        setEdges(graphData.edges);
        
        dataLoadedRef.current = true;
        setIsLoading(false);
        
      } catch (error) {
        console.error('Error loading objective hierarchy:', error);
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
  }, [objective, findRootObjective, loadObjectiveHierarchy, processHierarchyData, currentObjectivePath, toast]);

  const reactFlowOptions = useMemo(() => ({
    fitView: true,
    minZoom: 0.1,
    maxZoom: 2,
    proOptions: { hideAttribution: true },
    fitViewOptions: { 
      padding: 0.3, // Increased padding to avoid nodes at edges
      includeHiddenNodes: false 
    }
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
            <div className="flex flex-col items-center justify-center h-full w-full">
              <div className="text-center space-y-4 max-w-md px-4">
                <LoadingSpinner size={36} />
                <p className="text-sm text-muted-foreground">
                  {loadingState.isLoading 
                    ? `Building objective hierarchy... (${loadingState.progress}/${loadingState.total})`
                    : "Preparing hierarchy visualization..."}
                </p>
                {loadingState.isLoading && loadingState.total > 0 && (
                  <Progress 
                    value={(loadingState.progress / loadingState.total) * 100} 
                    className="h-2" 
                  />
                )}
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
              defaultEdgeOptions={{
                type: 'smoothstep',
                animated: false,
                style: { stroke: '#64748b', strokeWidth: 2 }
              }}
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

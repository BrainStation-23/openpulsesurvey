
import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Supervisor, TeamMember, DirectReport } from "@/hooks/useTeamData";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  ConnectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { TeamMemberNode } from './nodes/TeamMemberNode';
import { LoadingState } from './states/LoadingState';
import { ErrorState } from './states/ErrorState';
import { EmptyState } from './states/EmptyState';
import { TeamLegendPanel } from './graph/TeamLegendPanel';
import { FullScreenToggle } from './graph/FullScreenToggle';
import { processTeamData, getReactFlowOptions } from './utils/teamGraphUtils';

interface TeamGraphViewProps {
  supervisor: Supervisor | null;
  teamMembers: TeamMember[];
  directReports?: DirectReport[];
  isLoading?: boolean;
  error?: Error | null;
}

export const TeamGraphView: React.FC<TeamGraphViewProps> = ({
  supervisor,
  teamMembers,
  directReports = [],
  isLoading = false,
  error = null
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const graphRef = useRef<HTMLDivElement>(null);

  const nodeTypes = React.useMemo(() => ({
    teamMember: TeamMemberNode
  }), []);

  useEffect(() => {
    if (isLoading || error || (!supervisor && teamMembers.length === 0 && directReports.length === 0)) {
      return;
    }
    
    const { nodes: newNodes, edges: newEdges } = processTeamData(supervisor, teamMembers, directReports);
    
    setNodes(newNodes);
    setEdges(newEdges);
  }, [supervisor, teamMembers, directReports, isLoading, error, setNodes, setEdges]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullScreen = () => {
    if (!graphRef.current) return;
    
    if (!isFullScreen) {
      if (graphRef.current.requestFullscreen) {
        graphRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const reactFlowOptions = React.useMemo(() => getReactFlowOptions(), []);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!supervisor && teamMembers.length === 0 && directReports.length === 0) {
    return <EmptyState />;
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="text-sm font-medium text-muted-foreground mb-3">Team Hierarchy by Level</div>
        <div 
          ref={graphRef}
          className={`${isFullScreen ? 'h-screen w-full fixed inset-0 z-50 bg-background' : 'h-[500px]'} border rounded-md overflow-hidden relative`}
        >
          <FullScreenToggle 
            isFullScreen={isFullScreen} 
            onToggle={toggleFullScreen} 
          />
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            {...reactFlowOptions}
            deleteKeyCode={null}
            snapToGrid={true}
            snapGrid={[10, 10]}
          >
            <Controls />
            <MiniMap 
              nodeStrokeWidth={3}
              nodeStrokeColor={(n) => {
                const nodeId = String(n.id);
                if (nodeId.startsWith('supervisor-')) return '#9333ea';
                if (nodeId.startsWith('report-')) return '#059669';
                if (nodes.find(node => node.id === nodeId)?.data?.isLoggedInUser) return '#3b82f6';
                return '#64748b';
              }}
              nodeBorderRadius={10}
            />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            <TeamLegendPanel />
          </ReactFlow>
        </div>
      </CardContent>
    </Card>
  );
}

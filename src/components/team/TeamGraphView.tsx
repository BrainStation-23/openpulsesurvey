
import React, { useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Supervisor, TeamMember } from "@/hooks/useTeamData";
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
import { processTeamData, getReactFlowOptions } from './utils/teamGraphUtils';

interface TeamGraphViewProps {
  supervisor: Supervisor | null;
  teamMembers: TeamMember[];
  isLoading?: boolean;
  error?: Error | null;
}

export const TeamGraphView: React.FC<TeamGraphViewProps> = ({
  supervisor,
  teamMembers,
  isLoading = false,
  error = null
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const nodeTypes = React.useMemo(() => ({
    teamMember: TeamMemberNode
  }), []);

  useEffect(() => {
    if (isLoading || error || (!supervisor && teamMembers.length === 0)) {
      return;
    }
    
    const { nodes: newNodes, edges: newEdges } = processTeamData(supervisor, teamMembers);
    
    setNodes(newNodes);
    setEdges(newEdges);
  }, [supervisor, teamMembers, isLoading, error, setNodes, setEdges]);

  const reactFlowOptions = React.useMemo(() => getReactFlowOptions(), []);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!supervisor && teamMembers.length === 0) {
    return <EmptyState />;
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="text-sm font-medium text-muted-foreground mb-3">Team Hierarchy</div>
        <div className="h-[400px] border rounded-md overflow-hidden">
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
};

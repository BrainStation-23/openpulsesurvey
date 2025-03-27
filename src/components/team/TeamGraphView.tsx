
import React, { useEffect, useState } from 'react';
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
  Node,
  Edge,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { InfoIcon, AlertTriangle } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface TeamNodeData {
  label: string;
  sublabel?: string;
  imageUrl?: string;
  isLoggedInUser?: boolean;
  isSupervisor?: boolean;
}

interface TeamGraphViewProps {
  supervisor: Supervisor | null;
  teamMembers: TeamMember[];
  isLoading?: boolean;
  error?: Error | null;
}

// Custom node component for team members
const TeamMemberNode: React.FC<{ data: TeamNodeData }> = ({ data }) => {
  return (
    <div className={`p-2 rounded-lg shadow-md min-w-48 border-2 ${
      data.isLoggedInUser 
        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
        : data.isSupervisor 
          ? 'border-purple-500 bg-purple-50 dark:bg-purple-950' 
          : 'border-gray-200 bg-white dark:bg-gray-800'
    }`}>
      <div className="flex items-center gap-3">
        {data.imageUrl ? (
          <img 
            src={data.imageUrl} 
            alt={data.label} 
            className="w-10 h-10 rounded-full object-cover border border-gray-200"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
            {data.label.charAt(0)}
          </div>
        )}
        <div className="flex flex-col">
          <div className="font-medium text-sm">{data.label}</div>
          {data.sublabel && (
            <div className="text-xs text-gray-500 dark:text-gray-400">{data.sublabel}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export const TeamGraphView: React.FC<TeamGraphViewProps> = ({
  supervisor,
  teamMembers,
  isLoading = false,
  error = null
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Register the custom node type
  const nodeTypes = React.useMemo(() => ({
    teamMember: TeamMemberNode
  }), []);

  // Build the graph when data changes
  useEffect(() => {
    if (isLoading || error || (!supervisor && teamMembers.length === 0)) {
      return;
    }
    
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    
    // Add supervisor node if it exists
    if (supervisor) {
      newNodes.push({
        id: `supervisor-${supervisor.id}`,
        type: 'teamMember',
        position: { x: 250, y: 50 },
        data: {
          label: `${supervisor.firstName} ${supervisor.lastName}`,
          sublabel: supervisor.designation || 'Supervisor',
          imageUrl: supervisor.profileImageUrl,
          isSupervisor: true
        }
      });
    }
    
    // Calculate positions for team members in a semi-circle below the supervisor
    const radius = Math.max(teamMembers.length * 25, 150);
    const centerX = 250;
    const startY = supervisor ? 200 : 100;
    
    teamMembers.forEach((member, index) => {
      // Calculate position in a semi-circle formation
      const angle = (Math.PI * (index + 1)) / (teamMembers.length + 1);
      const x = centerX + radius * Math.cos(angle) - 100;
      const y = startY + radius * Math.sin(angle);
      
      const nodeId = `member-${member.id}`;
      
      newNodes.push({
        id: nodeId,
        type: 'teamMember',
        position: { x, y },
        data: {
          label: `${member.firstName} ${member.lastName}`,
          sublabel: member.designation || member.email,
          imageUrl: member.profileImageUrl,
          isLoggedInUser: member.isLoggedInUser
        }
      });
      
      // Add edge from supervisor to team member
      if (supervisor) {
        newEdges.push({
          id: `edge-${supervisor.id}-${member.id}`,
          source: `supervisor-${supervisor.id}`,
          target: nodeId,
          type: 'smoothstep',
          style: { 
            stroke: '#64748b', 
            strokeWidth: 2 
          },
          // Remove animated property - it can cause issues with handles
          // animated: false
        });
      }
    });
    
    setNodes(newNodes);
    setEdges(newEdges);
  }, [supervisor, teamMembers, isLoading, error, setNodes, setEdges]);

  const reactFlowOptions = React.useMemo(() => ({
    fitView: true,
    minZoom: 0.5,
    maxZoom: 1.5,
    proOptions: { hideAttribution: true },
    fitViewOptions: { padding: 0.2 },
    // Add these options to improve dragging and connection behavior
    defaultEdgeOptions: {
      type: 'smoothstep',
      style: { 
        stroke: '#64748b', 
        strokeWidth: 2 
      }
    },
    connectionMode: 'loose'
  }), []);

  // Show loading state
  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="h-[400px] border rounded-md flex items-center justify-center">
            <div className="text-center space-y-3">
              <LoadingSpinner size={36} />
              <p className="text-sm text-muted-foreground">Loading team data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="h-[400px] border rounded-md flex items-center justify-center">
            <div className="text-center space-y-3">
              <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto" />
              <p className="text-sm text-muted-foreground">Error loading team data: {error.message}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show empty state
  if (!supervisor && teamMembers.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="h-[400px] border rounded-md flex items-center justify-center">
            <div className="text-center space-y-3">
              <InfoIcon className="h-10 w-10 text-blue-500 mx-auto" />
              <p className="text-sm text-muted-foreground">No team data available</p>
              <p className="text-xs text-muted-foreground max-w-md">
                There's no supervisor assigned to your profile or you don't have any team members.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show the team graph
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
            // Add these props to improve interaction
            deleteKeyCode={null} // Disable default delete behavior
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
            <Panel position="top-left" className="bg-white bg-opacity-80 dark:bg-gray-800 dark:bg-opacity-80 p-2 rounded text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span>Supervisor</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>You</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span>Team Member</span>
              </div>
            </Panel>
          </ReactFlow>
        </div>
      </CardContent>
    </Card>
  );
};

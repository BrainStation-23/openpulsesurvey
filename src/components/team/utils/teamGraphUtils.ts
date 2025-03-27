
import { Node, Edge, Position, ConnectionMode } from '@xyflow/react';
import { Supervisor, TeamMember } from "@/hooks/useTeamData";
import { TeamNodeData } from '../nodes/TeamMemberNode';

export const processTeamData = (
  supervisor: Supervisor | null,
  teamMembers: TeamMember[]
): { nodes: Node[], edges: Edge[] } => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  if (supervisor) {
    nodes.push({
      id: `supervisor-${supervisor.id}`,
      type: 'teamMember',
      position: { x: 250, y: 50 },
      data: {
        label: `${supervisor.firstName} ${supervisor.lastName}`,
        sublabel: supervisor.designation || 'Supervisor',
        imageUrl: supervisor.profileImageUrl,
        isSupervisor: true
      },
      sourcePosition: Position.Bottom
    });
  }
  
  const radius = Math.max(teamMembers.length * 25, 150);
  const centerX = 250;
  const startY = supervisor ? 200 : 100;
  
  teamMembers.forEach((member, index) => {
    const angle = (Math.PI * (index + 1)) / (teamMembers.length + 1);
    const x = centerX + radius * Math.cos(angle) - 100;
    const y = startY + radius * Math.sin(angle);
    
    const nodeId = `member-${member.id}`;
    
    nodes.push({
      id: nodeId,
      type: 'teamMember',
      position: { x, y },
      data: {
        label: `${member.firstName} ${member.lastName}`,
        sublabel: member.designation || member.email,
        imageUrl: member.profileImageUrl,
        isLoggedInUser: member.isLoggedInUser
      },
      targetPosition: Position.Top
    });
    
    if (supervisor) {
      edges.push({
        id: `edge-supervisor-${member.id}`,
        source: `supervisor-${supervisor.id}`,
        target: nodeId,
        type: 'smoothstep',
        sourceHandle: null,
        targetHandle: null,
        style: { 
          stroke: '#64748b', 
          strokeWidth: 2 
        }
      });
    }
  });
  
  return { nodes, edges };
};

export const getReactFlowOptions = () => ({
  fitView: true,
  minZoom: 0.5,
  maxZoom: 1.5,
  proOptions: { hideAttribution: true },
  fitViewOptions: { padding: 0.2 },
  defaultEdgeOptions: {
    type: 'smoothstep',
    style: { 
      stroke: '#64748b', 
      strokeWidth: 2 
    }
  },
  connectionMode: ConnectionMode.Loose
});

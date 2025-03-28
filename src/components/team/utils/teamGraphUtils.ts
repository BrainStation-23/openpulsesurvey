
import { Node, Edge, Position, ConnectionMode } from '@xyflow/react';
import { Supervisor, TeamMember } from "@/hooks/useTeamData";
import { TeamNodeData } from '../nodes/TeamMemberNode';

export const processTeamData = (
  supervisor: Supervisor | null,
  teamMembers: TeamMember[]
): { nodes: Node[], edges: Edge[] } => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  // Horizontal layout configuration
  const startX = 100;
  const supervisorX = startX;
  const teamMembersX = startX + 350; // Put team members to the right with good spacing
  const verticalSpacing = 120; // Space between team members vertically
  
  if (supervisor) {
    nodes.push({
      id: `supervisor-${supervisor.id}`,
      type: 'teamMember',
      position: { x: supervisorX, y: 200 }, // Center supervisor vertically
      data: {
        label: `${supervisor.firstName} ${supervisor.lastName}`,
        sublabel: supervisor.designation || 'Supervisor',
        imageUrl: supervisor.profileImageUrl,
        isSupervisor: true
      },
      sourcePosition: Position.Right // Connections come from right side
    });
  }
  
  // Position team members vertically on the right side
  teamMembers.forEach((member, index) => {
    const startY = Math.max(50, 200 - (verticalSpacing * (teamMembers.length - 1) / 2)); // Center the column vertically
    const y = startY + (index * verticalSpacing);
    
    const nodeId = `member-${member.id}`;
    
    nodes.push({
      id: nodeId,
      type: 'teamMember',
      position: { x: teamMembersX, y },
      data: {
        label: `${member.firstName} ${member.lastName}`,
        sublabel: member.designation || member.email,
        imageUrl: member.profileImageUrl,
        isLoggedInUser: member.isLoggedInUser
      },
      targetPosition: Position.Left // Connections come into left side
    });
    
    if (supervisor) {
      edges.push({
        id: `edge-supervisor-${member.id}`,
        source: `supervisor-${supervisor.id}`,
        target: nodeId,
        sourceHandle: 'supervisor-output',
        targetHandle: 'member-input',
        type: 'smoothstep',
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

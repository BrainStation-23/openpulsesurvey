
import { Node, Edge, Position, ConnectionMode } from '@xyflow/react';
import { Supervisor, TeamMember } from "@/hooks/useTeamData";
import { TeamNodeData } from '../nodes/TeamMemberNode';

export const processTeamData = (
  supervisor: Supervisor | null,
  teamMembers: TeamMember[]
): { nodes: Node[], edges: Edge[] } => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  // Improved layout configuration
  const startX = 200;
  const supervisorY = 100;
  const teamMembersY = supervisorY + 200; // Better vertical spacing
  const horizontalSpacing = 180; // Better horizontal spacing between team members
  
  // Calculate total width needed for team members
  const totalTeamWidth = teamMembers.length * horizontalSpacing;
  
  // Calculate starting X position to center the team members
  const teamStartX = startX - totalTeamWidth / 2 + horizontalSpacing / 2;
  
  if (supervisor) {
    nodes.push({
      id: `supervisor-${supervisor.id}`,
      type: 'teamMember',
      position: { x: startX, y: supervisorY }, // Position supervisor at the top center
      data: {
        label: `${supervisor.firstName} ${supervisor.lastName}`,
        sublabel: supervisor.designation || 'Supervisor',
        imageUrl: supervisor.profileImageUrl,
        isSupervisor: true
      },
      sourcePosition: Position.Bottom // Connections come from bottom side for hierarchical layout
    });
  }
  
  // Position team members in a row beneath the supervisor
  teamMembers.forEach((member, index) => {
    const x = teamStartX + (index * horizontalSpacing);
    
    const nodeId = `member-${member.id}`;
    
    nodes.push({
      id: nodeId,
      type: 'teamMember',
      position: { x, y: teamMembersY },
      data: {
        label: `${member.firstName} ${member.lastName}`,
        sublabel: member.designation || member.email,
        imageUrl: member.profileImageUrl,
        isLoggedInUser: member.isLoggedInUser
      },
      targetPosition: Position.Top // Connections come into top side for hierarchical layout
    });
    
    if (supervisor) {
      edges.push({
        id: `edge-supervisor-${member.id}`,
        source: `supervisor-${supervisor.id}`,
        target: nodeId,
        type: 'smoothstep',
        style: { 
          stroke: member.isLoggedInUser ? '#3b82f6' : '#64748b', 
          strokeWidth: member.isLoggedInUser ? 3 : 2
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

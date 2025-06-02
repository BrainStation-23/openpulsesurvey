
import { Node, Edge } from '@xyflow/react';
import { Supervisor, TeamMember, DirectReport } from '@/hooks/useTeamData';

export interface TeamMemberNodeData extends Record<string, unknown> {
  label: string;
  subtitle: string;
  email: string;
  userId: string;
  isLoggedInUser?: boolean;
  isSupervisor?: boolean;
  isDirectReport?: boolean;
  level?: {
    id: string;
    name: string;
    color_code?: string;
    rank: number;
  };
}

export type TeamMemberNode = Node<TeamMemberNodeData, 'teamMember'>;

export const processTeamData = (
  supervisor: Supervisor | null,
  teamMembers: TeamMember[],
  directReports: DirectReport[] = []
): { nodes: TeamMemberNode[]; edges: Edge[] } => {
  const nodes: TeamMemberNode[] = [];
  const edges: Edge[] = [];

  // Constants for positioning
  const HORIZONTAL_SPACING = 250;
  const VERTICAL_SPACING = 200;
  const CENTER_X = 400;

  // Add supervisor node (top level)
  if (supervisor) {
    nodes.push({
      id: `supervisor-${supervisor.id}`,
      type: 'teamMember',
      position: { x: CENTER_X, y: 50 },
      data: {
        label: `${supervisor.firstName} ${supervisor.lastName}`,
        subtitle: supervisor.designation || 'Supervisor',
        email: supervisor.email,
        userId: supervisor.id,
        isSupervisor: true,
        level: supervisor.level,
      },
    });
  }

  // Add team members (peers) in the middle level
  const peerY = supervisor ? 250 : 150;
  const peerStartX = CENTER_X - ((teamMembers.length - 1) * HORIZONTAL_SPACING) / 2;

  teamMembers.forEach((member, index) => {
    const nodeId = `peer-${member.id}`;
    nodes.push({
      id: nodeId,
      type: 'teamMember',
      position: { 
        x: peerStartX + index * HORIZONTAL_SPACING, 
        y: peerY 
      },
      data: {
        label: `${member.firstName} ${member.lastName}`,
        subtitle: member.designation || 'Team Member',
        email: member.email,
        userId: member.id,
        isLoggedInUser: member.isLoggedInUser,
        level: member.level,
      },
    });

    // Connect peers to supervisor
    if (supervisor) {
      edges.push({
        id: `supervisor-${supervisor.id}-${nodeId}`,
        source: `supervisor-${supervisor.id}`,
        target: nodeId,
        type: 'smoothstep',
        style: { stroke: '#64748b', strokeWidth: 2 },
      });
    }
  });

  // Add direct reports (bottom level)
  if (directReports.length > 0) {
    const currentUserNode = teamMembers.find(member => member.isLoggedInUser);
    if (currentUserNode) {
      const currentUserNodeId = `peer-${currentUserNode.id}`;
      const reportsY = peerY + VERTICAL_SPACING;
      const reportsStartX = CENTER_X - ((directReports.length - 1) * HORIZONTAL_SPACING) / 2;

      directReports.forEach((report, index) => {
        const reportNodeId = `report-${report.id}`;
        nodes.push({
          id: reportNodeId,
          type: 'teamMember',
          position: { 
            x: reportsStartX + index * HORIZONTAL_SPACING, 
            y: reportsY 
          },
          data: {
            label: `${report.firstName} ${report.lastName}`,
            subtitle: report.designation || 'Direct Report',
            email: report.email,
            userId: report.id,
            isDirectReport: true,
            level: report.level,
          },
        });

        // Connect direct reports to current user
        edges.push({
          id: `${currentUserNodeId}-${reportNodeId}`,
          source: currentUserNodeId,
          target: reportNodeId,
          type: 'smoothstep',
          style: { stroke: '#64748b', strokeWidth: 2 },
        });
      });
    }
  }

  return { nodes, edges };
};

export const getReactFlowOptions = () => ({
  nodesDraggable: true,
  nodesConnectable: false,
  elementsSelectable: true,
  connectionMode: 'loose' as const,
  fitView: true,
  fitViewOptions: {
    padding: 0.1,
    includeHiddenNodes: false,
  },
});

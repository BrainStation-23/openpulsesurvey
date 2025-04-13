
import { Node, Edge, Position, ConnectionMode } from '@xyflow/react';
import { Supervisor, TeamMember } from "@/hooks/useTeamData";
import { TeamNodeData } from '../nodes/TeamMemberNode';

export const processTeamData = (
  supervisor: Supervisor | null,
  teamMembers: TeamMember[]
): { nodes: Node[], edges: Edge[] } => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  if (!supervisor && teamMembers.length === 0) {
    return { nodes, edges };
  }
  
  // First, group team members by level
  const membersByLevel: Record<string, TeamMember[]> = {};
  let allLevels: { id: string, name: string, rank: number }[] = [];
  
  // Collect all levels from team members and supervisor
  teamMembers.forEach(member => {
    if (member.level) {
      // Create the level group if it doesn't exist
      if (!membersByLevel[member.level.id]) {
        membersByLevel[member.level.id] = [];
        // Add to allLevels if not already added
        if (!allLevels.some(l => l.id === member.level.id)) {
          allLevels.push({
            id: member.level.id,
            name: member.level.name,
            rank: member.level.rank || 999 // Default high rank if not specified
          });
        }
      }
      // Add member to their level group
      membersByLevel[member.level.id].push(member);
    } else {
      // For members without a level, create an "Unassigned" group
      if (!membersByLevel['unassigned']) {
        membersByLevel['unassigned'] = [];
        if (!allLevels.some(l => l.id === 'unassigned')) {
          allLevels.push({
            id: 'unassigned',
            name: 'Unassigned',
            rank: 1000 // Put at the end
          });
        }
      }
      membersByLevel['unassigned'].push(member);
    }
  });
  
  // Add supervisor level if applicable
  if (supervisor && supervisor.level) {
    if (!allLevels.some(l => l.id === supervisor.level.id)) {
      allLevels.push({
        id: supervisor.level.id,
        name: supervisor.level.name,
        rank: supervisor.level.rank || 0 // Default low rank for supervisor
      });
    }
  } else if (supervisor) {
    // For supervisor without level
    if (!allLevels.some(l => l.id === 'supervisor')) {
      allLevels.push({
        id: 'supervisor',
        name: 'Leadership',
        rank: 0 // Always put at the top
      });
    }
  }
  
  // Sort levels by rank
  allLevels.sort((a, b) => a.rank - b.rank);
  
  // Layout configuration
  const startX = 200;
  const levelSpacing = 150; // Vertical spacing between levels
  const memberHorizontalSpacing = 180; // Spacing between members in the same level
  
  // Track current Y position as we work through levels
  let currentY = 100;
  
  // Place supervisor at the top if present
  if (supervisor) {
    const supervisorLevelId = supervisor.level ? supervisor.level.id : 'supervisor';
    const supervisorNodeId = `supervisor-${supervisor.id}`;
    
    nodes.push({
      id: supervisorNodeId,
      type: 'teamMember',
      position: { x: startX, y: currentY },
      data: {
        label: `${supervisor.firstName} ${supervisor.lastName}`,
        sublabel: supervisor.designation || 'Supervisor',
        imageUrl: supervisor.profileImageUrl,
        isSupervisor: true,
        level: supervisor.level ? supervisor.level.name : 'Leadership'
      },
      sourcePosition: Position.Bottom
    });
    
    currentY += levelSpacing; // Move down for next level
  }
  
  // Process each level in rank order
  allLevels.forEach((level, levelIndex) => {
    const membersInLevel = membersByLevel[level.id] || [];
    
    if (membersInLevel.length === 0 && level.id !== 'supervisor') {
      return; // Skip empty levels (except supervisor level which was handled separately)
    }
    
    // Calculate total width needed for members in this level
    const totalLevelWidth = membersInLevel.length * memberHorizontalSpacing;
    
    // Calculate starting X position to center the members
    const levelStartX = startX - totalLevelWidth / 2 + memberHorizontalSpacing / 2;
    
    // Place each member in this level
    membersInLevel.forEach((member, memberIndex) => {
      const x = levelStartX + (memberIndex * memberHorizontalSpacing);
      const nodeId = `member-${member.id}`;
      
      nodes.push({
        id: nodeId,
        type: 'teamMember',
        position: { x, y: currentY },
        data: {
          label: `${member.firstName} ${member.lastName}`,
          sublabel: member.designation || member.email,
          imageUrl: member.profileImageUrl,
          isLoggedInUser: member.isLoggedInUser,
          level: member.level ? member.level.name : 'Unassigned'
        },
        targetPosition: Position.Top,
        sourcePosition: Position.Bottom
      });
      
      // Create edge from supervisor to team member if applicable
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
    
    // Move down for next level if we have more levels to process
    if (levelIndex < allLevels.length - 1) {
      currentY += levelSpacing;
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

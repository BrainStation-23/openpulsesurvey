
import { useState } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  NodeChange,
  EdgeChange,
  Edge,
  ConnectionLineType,
  Panel,
  NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CustomNode } from './CustomNode';
import { FullScreenToggle } from '@/components/team/graph/FullScreenToggle';
import { UserNode, UserNodeData } from '../types';

interface FlowWrapperProps {
  nodes: UserNode[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  toggleNodeExpansion: (userId: string) => void;
}

export const FlowWrapper = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  toggleNodeExpansion,
}: FlowWrapperProps) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Define node types mapping with correct typing
  const nodeTypes: NodeTypes = {
    userNode: CustomNode,
  };

  return (
    <div
      className={`bg-white border rounded-md ${
        isFullScreen ? 'fixed inset-0 z-50' : 'h-[500px]'
      }`}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.5}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <Panel position="top-right">
          <FullScreenToggle isFullScreen={isFullScreen} onToggle={toggleFullScreen} />
        </Panel>
      </ReactFlow>
    </div>
  );
};

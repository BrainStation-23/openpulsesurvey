
import { useState } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  NodeChange,
  EdgeChange,
  Node,
  Edge,
  ConnectionLineType,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CustomNode } from './CustomNode';
import { FullScreenToggle } from '@/components/team/graph/FullScreenToggle';
import { UserNodeData } from '../types';

interface FlowWrapperProps {
  nodes: Node<UserNodeData>[];
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

  // Define node types mapping
  const nodeTypes = {
    userNode: (props: any) => <CustomNode {...props} toggleNodeExpansion={toggleNodeExpansion} />,
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

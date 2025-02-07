
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CustomNode } from './CustomNode';
import { UserNode } from '../types';
import { Edge } from '@xyflow/react';

interface FlowWrapperProps {
  nodes: UserNode[];
  edges: Edge[];
  onNodesChange: any;
  onEdgesChange: any;
  toggleNodeExpansion: (userId: string) => void;
}

export const FlowWrapper = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  toggleNodeExpansion,
}: FlowWrapperProps) => {
  return (
    <div className="h-[600px] border rounded-lg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={{
          userNode: (props) => <CustomNode {...props} toggleNodeExpansion={toggleNodeExpansion} />,
        }}
        fitView
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Controls />
        <MiniMap zoomable pannable />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

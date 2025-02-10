
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useCallback } from 'react';
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
  const [isFullScreen, setIsFullScreen] = useState(false);

  const toggleFullScreen = useCallback(() => {
    if (!isFullScreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    setIsFullScreen(prev => !prev);
  }, [isFullScreen]);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullScreen) {
        document.body.style.overflow = '';
        setIsFullScreen(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = '';
    };
  }, [isFullScreen]);

  if (isFullScreen) {
    return (
      <div className="fixed inset-0 z-[100] bg-background">
        <Button
          variant="outline"
          size="icon"
          className="absolute top-4 right-4 z-10"
          onClick={toggleFullScreen}
        >
          <Minimize2 className="h-4 w-4" />
        </Button>
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
  }

  return (
    <div className="h-[600px] border rounded-lg relative">
      <Button
        variant="outline"
        size="icon"
        className="absolute top-4 right-4 z-10"
        onClick={toggleFullScreen}
      >
        <Maximize2 className="h-4 w-4" />
      </Button>
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

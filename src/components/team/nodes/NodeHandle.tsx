
import React from 'react';
import { Position } from '@xyflow/react';

interface NodeHandleProps {
  type: 'source' | 'target';
  position: Position;
}

// This component is deprecated in favor of using the built-in Handle component from @xyflow/react
export const NodeHandle: React.FC<NodeHandleProps> = ({ type, position }) => {
  console.warn('NodeHandle is deprecated. Use Handle from @xyflow/react instead.');
  
  return (
    <div
      style={{
        width: 10,
        height: 10,
        backgroundColor: '#9ca3af',
        borderRadius: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1
      }}
      className="nodrag"
      data-handletype={type}
      data-handlepos={position}
    />
  );
};


import React from 'react';
import { Handle, Position } from '@xyflow/react';

export interface TeamNodeData {
  label: string;
  sublabel?: string;
  imageUrl?: string;
  isLoggedInUser?: boolean;
  isSupervisor?: boolean;
}

interface TeamMemberNodeProps {
  data: TeamNodeData;
}

export const TeamMemberNode: React.FC<TeamMemberNodeProps> = ({ data }) => {
  return (
    <div className={`p-2 rounded-lg shadow-md min-w-48 border-2 ${
      data.isLoggedInUser 
        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
        : data.isSupervisor 
          ? 'border-purple-500 bg-purple-50 dark:bg-purple-950' 
          : 'border-gray-200 bg-white dark:bg-gray-800'
    }`}>
      <div className="flex items-center gap-3">
        {data.imageUrl ? (
          <img 
            src={data.imageUrl} 
            alt={data.label} 
            className="w-10 h-10 rounded-full object-cover border border-gray-200"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
            {data.label.charAt(0)}
          </div>
        )}
        <div className="flex flex-col">
          <div className="font-medium text-sm">{data.label}</div>
          {data.sublabel && (
            <div className="text-xs text-gray-500 dark:text-gray-400">{data.sublabel}</div>
          )}
        </div>
      </div>
      
      {/* Replace custom handles with built-in handles */}
      {data.isSupervisor ? (
        <Handle
          type="source"
          position={Position.Bottom}
          id="supervisor-output"
          style={{ bottom: -5, background: '#9ca3af', width: 10, height: 10, border: 'none' }}
          isConnectable={true}
        />
      ) : (
        <Handle
          type="target"
          position={Position.Top}
          id="member-input"
          style={{ top: -5, background: '#9ca3af', width: 10, height: 10, border: 'none' }}
          isConnectable={true}
        />
      )}
    </div>
  );
};

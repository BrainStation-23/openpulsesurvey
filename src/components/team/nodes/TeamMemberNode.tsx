
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { NodeHandle } from './NodeHandle';

export interface TeamNodeData {
  label: string;
  sublabel?: string;
  imageUrl?: string;
  isSupervisor?: boolean;
  isLoggedInUser?: boolean;
}

export const TeamMemberNode: React.FC<{ data: TeamNodeData }> = ({ data }) => {
  const { label, sublabel, imageUrl, isSupervisor, isLoggedInUser } = data;
  
  // Determine border color based on role
  const getBorderColor = () => {
    if (isSupervisor) return 'border-purple-500';
    if (isLoggedInUser) return 'border-blue-500';
    return 'border-slate-200';
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow-sm p-3 w-60 ${getBorderColor()} border-2`}
    >
      {/* Left side handle for target connections */}
      {!isSupervisor && (
        <NodeHandle 
          type="target" 
          position={Position.Left} 
          id="member-input" 
        />
      )}
      
      {/* Right side handle for source connections */}
      {isSupervisor && (
        <NodeHandle 
          type="source" 
          position={Position.Right} 
          id="supervisor-output" 
        />
      )}
      
      <div className="flex items-center gap-3">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={label} 
            className="h-10 w-10 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white flex-shrink-0 ${isSupervisor ? 'bg-purple-500' : 'bg-slate-500'}`}>
            {label.charAt(0)}
          </div>
        )}
        <div className="overflow-hidden">
          <div className="font-medium text-sm whitespace-nowrap overflow-hidden text-ellipsis">
            {label}
            {isLoggedInUser && <span className="ml-1 text-xs text-blue-500">(You)</span>}
          </div>
          {sublabel && (
            <div className="text-xs text-slate-500 whitespace-nowrap overflow-hidden text-ellipsis">
              {sublabel}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

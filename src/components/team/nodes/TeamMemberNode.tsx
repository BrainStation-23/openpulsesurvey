
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';

export interface TeamNodeData {
  label: string;
  sublabel: string;
  imageUrl?: string | null;
  isSupervisor?: boolean;
  isLoggedInUser?: boolean;
  level?: string;
}

export const TeamMemberNode: React.FC<{ 
  data: TeamNodeData;
  targetPosition?: Position;
  sourcePosition?: Position;
}> = ({ 
  data, 
  targetPosition = Position.Top,
  sourcePosition = Position.Bottom
}) => {
  return (
    <div className={`bg-card border shadow-sm p-4 rounded-lg w-[160px] text-center ${
      data.isLoggedInUser ? 'ring-2 ring-blue-500' : 
      data.isSupervisor ? 'ring-2 ring-purple-500' : ''
    }`}>
      {targetPosition !== null && (
        <Handle
          type="target"
          position={targetPosition}
          className="w-2 h-2 !bg-muted-foreground"
        />
      )}
      
      <div className="flex flex-col items-center gap-2">
        {data.imageUrl ? (
          <img
            src={data.imageUrl}
            alt={data.label}
            className="w-12 h-12 rounded-full object-cover border-2 border-background"
          />
        ) : (
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-medium ${
            data.isSupervisor ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {data.label.charAt(0)}
          </div>
        )}
        
        <div>
          <p className="font-medium text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
            {data.label}
            {data.isLoggedInUser && (
              <span className="ml-1 text-xs text-blue-500">(You)</span>
            )}
          </p>
          <p className="text-xs text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
            {data.sublabel}
          </p>
          
          {data.level && (
            <Badge variant="outline" className="mt-1 text-xs font-normal">
              {data.level}
            </Badge>
          )}
        </div>
      </div>
      
      {sourcePosition !== null && (
        <Handle
          type="source"
          position={sourcePosition}
          className="w-2 h-2 !bg-muted-foreground"
        />
      )}
    </div>
  );
};

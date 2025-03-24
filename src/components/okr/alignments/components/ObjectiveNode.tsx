
import React from 'react';
import { Link } from 'react-router-dom';
import { Handle, Position } from '@xyflow/react';
import { ObjectiveStatusBadge } from '@/components/okr/objectives/ObjectiveStatusBadge';
import { Objective } from '@/types/okr';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowRight, UserCircle2 } from 'lucide-react';

interface ObjectiveNodeProps {
  data: {
    objective: Objective;
    isAdmin: boolean;
    isCurrentObjective: boolean;
    canDelete: boolean;
    onDelete?: () => void;
  };
  isConnectable: boolean;
}

export const ObjectiveNode = ({ data, isConnectable }: ObjectiveNodeProps) => {
  const { objective, isAdmin, isCurrentObjective, canDelete, onDelete } = data;
  const basePath = isAdmin ? '/admin' : '/user';
  
  return (
    <TooltipProvider>
      <div className={`p-3 rounded-lg shadow-md ${
        isCurrentObjective 
          ? 'bg-amber-50 border border-amber-300' 
          : 'bg-white border border-gray-200'
      }`}>
        {/* Handles for connections */}
        <Handle
          type="target"
          position={Position.Top}
          isConnectable={isConnectable}
          className="w-3 h-3 border-2 border-gray-400 bg-white"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable}
          className="w-3 h-3 border-2 border-gray-400 bg-white"
        />
        
        <div className="w-64 max-w-full">
          <div className="flex items-center gap-1 mb-1">
            {isCurrentObjective && (
              <ArrowRight className="h-4 w-4 text-amber-500 mr-1 animate-pulse" />
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link 
                  to={`${basePath}/okrs/objectives/${objective.id}`} 
                  className={`font-medium hover:underline text-sm block truncate ${
                    isCurrentObjective ? 'text-amber-800 font-bold' : ''
                  }`}
                >
                  {objective.title}
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <div className="max-w-xs">
                  <p className="font-semibold mb-1">{objective.title}</p>
                  {objective.description && (
                    <p className="text-xs text-muted-foreground">{objective.description}</p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
            <ObjectiveStatusBadge status={objective.status} className="ml-2 text-xs h-5 px-1.5" />
          </div>
          
          <div className="mt-2 space-y-1">
            <div className="flex items-center">
              <div className="w-full bg-muted rounded-full h-2 mr-1">
                <div 
                  className={`rounded-full h-2 ${
                    objective.progress >= 100 ? 'bg-green-500' : 
                    objective.progress >= 70 ? 'bg-emerald-500' : 
                    objective.progress >= 50 ? 'bg-amber-500' : 
                    objective.progress >= 30 ? 'bg-orange-500' : 
                    'bg-red-500'
                  }`}
                  style={{ width: `${objective.progress || 0}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground min-w-[2.5rem] text-right">
                {Math.round(objective.progress)}%
              </span>
            </div>

            <div className="flex items-center text-xs text-muted-foreground">
              <UserCircle2 className="h-3 w-3 mr-1" />
              <span className="truncate">Owner: {objective.ownerId.substring(0, 8)}...</span>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

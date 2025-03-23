
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronDown, Info } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ObjectiveStatusBadge } from '@/components/okr/objectives/ObjectiveStatusBadge';
import { Objective } from '@/types/okr';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ObjectiveNodeDeleteButton } from './ObjectiveNodeDeleteButton';
import { ObjectiveNodeOwnerInfo } from './ObjectiveNodeOwnerInfo';

interface ObjectiveNodeProps {
  objective: Objective;
  level: number;
  isExpanded: boolean;
  onToggle: () => void;
  isAdmin?: boolean;
  canEdit?: boolean;
  showDeleteButton?: boolean;
  onDelete?: () => void;
  children?: React.ReactNode;
  isLastChild?: boolean;
}

export const ObjectiveNode: React.FC<ObjectiveNodeProps> = ({ 
  objective, 
  level, 
  isExpanded, 
  onToggle,
  isAdmin = false,
  canEdit = false,
  showDeleteButton = false,
  onDelete,
  children,
  isLastChild = false
}) => {
  const basePath = isAdmin ? '/admin' : '/user';
  const indentSize = 24; // Slightly larger indentation per level

  return (
    <TooltipProvider>
      <div className="relative">
        <div 
          className="flex items-start my-2 p-2 rounded-md hover:bg-muted/50 transition-colors relative"
          style={{ marginLeft: `${level * indentSize}px` }}
        >
          {/* Tree structure lines */}
          {level > 0 && (
            <div 
              className="absolute border-l-2 border-gray-300" 
              style={{ 
                left: `${(level * indentSize) - (indentSize/2)}px`,
                top: 0,
                height: isLastChild ? '50%' : '100%',
                bottom: isLastChild ? 'auto' : 0
              }}
            />
          )}
          
          {level > 0 && (
            <div 
              className="absolute border-t-2 border-gray-300" 
              style={{ 
                left: `${(level * indentSize) - (indentSize/2)}px`,
                width: `${indentSize/2}px`,
                top: '50%'
              }}
            />
          )}
          
          <div className="mr-2 mt-1 cursor-pointer flex-shrink-0 z-10">
            {children ? (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5 p-0" 
                onClick={onToggle}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            ) : (
              <div className="w-5 h-5"></div> /* Spacer for leaf nodes */
            )}
          </div>
          
          <div className="flex-1 min-w-0 z-10">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link 
                      to={`${basePath}/okrs/objectives/${objective.id}`} 
                      className="font-medium hover:underline text-sm block truncate"
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
                
                <div className="flex items-center mt-1 text-xs space-x-2">
                  <ObjectiveStatusBadge status={objective.status} className="text-xs h-5 px-1.5" />
                  <span className="text-muted-foreground">{Math.round(objective.progress)}%</span>
                  <ObjectiveNodeOwnerInfo ownerId={objective.ownerId} />
                </div>
              </div>
              
              {showDeleteButton && canEdit && onDelete ? (
                <ObjectiveNodeDeleteButton onDelete={onDelete} />
              ) : null}
            </div>
          </div>
        </div>
        
        {isExpanded && children ? children : null}
      </div>
    </TooltipProvider>
  );
};

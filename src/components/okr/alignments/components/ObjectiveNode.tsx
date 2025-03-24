
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronDown, Info, ArrowRight } from 'lucide-react';
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
  isCurrentObjective?: boolean;
  isInCurrentPath?: boolean;
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
  isLastChild = false,
  isCurrentObjective = false,
  isInCurrentPath = false
}) => {
  const basePath = isAdmin ? '/admin' : '/user';
  const indentSize = 24; // Slightly larger indentation per level

  return (
    <TooltipProvider>
      <div className="relative">
        <div 
          className={`flex items-start my-2 p-2 rounded-md hover:bg-muted/50 transition-colors relative ${
            isCurrentObjective ? 'bg-amber-50 border border-amber-200' : 
            isInCurrentPath ? 'bg-amber-50/50' : ''
          }`}
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
                <div className="flex items-center">
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
                </div>
                
                <div className="flex items-center mt-1 text-xs space-x-2">
                  <ObjectiveStatusBadge status={objective.status} className="text-xs h-5 px-1.5" />
                  <div className="flex items-center">
                    <div className="w-16 bg-muted rounded-full h-2 mr-1">
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
                    <span className="text-muted-foreground">{Math.round(objective.progress)}%</span>
                  </div>
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

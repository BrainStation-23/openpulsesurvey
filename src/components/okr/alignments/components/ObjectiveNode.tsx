
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronDown, Trash2, User, Info } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ObjectiveStatusBadge } from '@/components/okr/objectives/ObjectiveStatusBadge';
import { Objective } from '@/types/okr';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  
  // Fetch owner info
  const { data: ownerInfo } = useQuery({
    queryKey: ['user', objective.ownerId],
    queryFn: async () => {
      if (!objective.ownerId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', objective.ownerId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!objective.ownerId
  });
  
  const ownerName = ownerInfo 
    ? `${ownerInfo.first_name || ''} ${ownerInfo.last_name || ''}`.trim() 
    : '';

  return (
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
            <div className="w-5 h-5"></div> {/* Spacer for leaf nodes */}
          )}
        </div>
        
        <div className="flex-1 min-w-0 z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <TooltipProvider delayDuration={300}>
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
              </TooltipProvider>
              
              <div className="flex items-center mt-1 text-xs space-x-2">
                <ObjectiveStatusBadge status={objective.status} className="text-xs h-5 px-1.5" />
                <span className="text-muted-foreground">{Math.round(objective.progress)}%</span>
                
                {ownerName && (
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center text-muted-foreground gap-1">
                          <User className="h-3 w-3" />
                          <span className="truncate max-w-[120px]">{ownerName}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Owner: {ownerName}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
            
            {showDeleteButton && canEdit && onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-2">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove alignment?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove the parent-child relationship between these objectives.
                      The objectives themselves will not be deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete}>
                      Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </div>
      
      {isExpanded && children}
    </div>
  );
};

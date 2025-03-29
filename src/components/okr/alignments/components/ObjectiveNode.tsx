
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
import { ArrowRight, Edit, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { ObjectiveNodeOwnerInfo } from './ObjectiveNodeOwnerInfo';
import { Progress } from "@/components/ui/progress";
import { EditObjectiveDialog } from '../../objectives/EditObjectiveDialog';

interface ObjectiveNodeProps {
  data: {
    objective: Objective;
    isAdmin: boolean;
    isCurrentObjective: boolean;
    isInPath: boolean;
    canDelete: boolean;
    canEdit?: boolean;
    onDelete?: () => void;
  };
  isConnectable: boolean;
}

export const ObjectiveNode = ({ data, isConnectable }: ObjectiveNodeProps) => {
  const { objective, isAdmin, isCurrentObjective, isInPath, canDelete, canEdit = false, onDelete } = data;
  const basePath = isAdmin ? '/admin' : '/user';
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  
  // Get appropriate background color based on node status
  const getBgColor = () => {
    if (isCurrentObjective) return 'bg-amber-50 border-amber-300';
    if (isInPath) return 'bg-purple-50 border-purple-200';
    return 'bg-white border-gray-200';
  };
  
  return (
    <TooltipProvider>
      <div className={`p-4 rounded-lg shadow-md border ${getBgColor()} transition-colors duration-200 w-72`}>
        {/* Connection Handles */}
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
        
        {/* Card Content */}
        <div className="space-y-3">
          {/* 1. Header with objective title */}
          <div className="flex items-start gap-1">
            {isCurrentObjective && (
              <ArrowRight className="h-4 w-4 text-amber-500 mr-1 flex-shrink-0 animate-pulse" />
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link 
                  to={`${basePath}/okrs/objectives/${objective.id}`} 
                  className={`font-semibold text-base block truncate ${
                    isCurrentObjective ? 'text-amber-800 font-bold' : 
                    isInPath ? 'text-purple-800' : ''
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
          
          {/* 2. Status Badge */}
          <div>
            <ObjectiveStatusBadge status={objective.status} className="text-xs" />
          </div>
          
          {/* 3. Owner Information */}
          <div className="flex items-center gap-2">
            <User className="h-3 w-3 text-muted-foreground" />
            <ObjectiveNodeOwnerInfo ownerId={objective.ownerId} />
          </div>
          
          {/* 4. Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span>{Math.round(objective.progress)}%</span>
            </div>
            <Progress 
              value={objective.progress || 0} 
              className="h-2"
              indicatorClassName={
                objective.progress >= 100 ? 'bg-green-500' : 
                objective.progress >= 70 ? 'bg-emerald-500' : 
                objective.progress >= 50 ? 'bg-amber-500' : 
                objective.progress >= 30 ? 'bg-orange-500' : 
                'bg-red-500'
              }
            />
          </div>
          
          {/* 5. Action Buttons */}
          {(canDelete || canEdit) && (
            <div className="flex justify-end space-x-2 mt-2">
              {canEdit && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-7 px-2 text-xs"
                  onClick={() => setIsEditDialogOpen(true)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              )}
              {canDelete && onDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-red-500 hover:text-red-600">
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove Alignment?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove the relationship between these objectives.
                        The objectives themselves will not be deleted.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={onDelete}>Remove</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Objective Dialog */}
      {canEdit && (
        <EditObjectiveDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          objective={objective}
        />
      )}
    </TooltipProvider>
  );
};

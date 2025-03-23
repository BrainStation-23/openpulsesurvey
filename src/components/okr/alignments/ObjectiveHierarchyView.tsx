
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ObjectiveStatusBadge } from '@/components/okr/objectives/ObjectiveStatusBadge';
import { Objective, ObjectiveWithRelations } from '@/types/okr';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { useAlignments } from '@/hooks/okr/useAlignments';
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
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface ObjectiveNodeProps {
  objective: Objective;
  level: number;
  isExpanded: boolean;
  onToggle: () => void;
  isAdmin?: boolean;
  canEdit?: boolean;
  showDeleteButton?: boolean;
  onDelete?: () => void;
}

const ObjectiveNode: React.FC<ObjectiveNodeProps> = ({ 
  objective, 
  level, 
  isExpanded, 
  onToggle,
  isAdmin = false,
  canEdit = false,
  showDeleteButton = false,
  onDelete
}) => {
  const basePath = isAdmin ? '/admin' : '/user';
  const indentSize = level * 20; // 20px indentation per level

  return (
    <div className="my-2">
      <div 
        className="flex items-start p-3 border rounded-md hover:bg-muted/20 transition-colors"
        style={{ marginLeft: `${indentSize}px` }}
      >
        <div className="mr-2 mt-1 cursor-pointer" onClick={onToggle}>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <Link to={`${basePath}/okrs/objectives/${objective.id}`} className="font-medium hover:underline">
              {objective.title}
            </Link>
            <div className="flex items-center gap-2">
              <ObjectiveStatusBadge status={objective.status} />
              
              {showDeleteButton && canEdit && onDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
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
          
          {objective.description && (
            <p className="text-sm text-muted-foreground truncate max-w-md">{objective.description}</p>
          )}
          
          <div className="mt-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium">Progress: {Math.round(objective.progress)}%</span>
            </div>
            <Progress value={objective.progress} className="h-1" />
          </div>
        </div>
      </div>
    </div>
  );
};

interface ObjectiveHierarchyViewProps {
  objective: ObjectiveWithRelations;
  isAdmin?: boolean;
}

export const ObjectiveHierarchyView: React.FC<ObjectiveHierarchyViewProps> = ({ 
  objective,
  isAdmin = false
}) => {
  const [expandedNodes, setExpandedNodes] = React.useState<Record<string, boolean>>({
    [objective.id]: true // Main objective is expanded by default
  });
  const { userId, isAdmin: userIsAdmin } = useCurrentUser();
  const { deleteAlignment } = useAlignments(objective.id);
  
  const canEdit = userIsAdmin || isAdmin || objective.ownerId === userId;

  const toggleNode = (objectiveId: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [objectiveId]: !prev[objectiveId]
    }));
  };

  // Find parent relationship in alignments if it exists
  const findParentAlignmentId = () => {
    if (!objective.alignedObjectives) return null;
    
    // Look for an alignment where this objective is the child (aligned_objective_id)
    const parentAlignment = objective.alignedObjectives.find(
      alignment => alignment.alignmentType === 'parent_child' && 
                   alignment.alignedObjectiveId === objective.id
    );
    
    return parentAlignment?.id || null;
  };

  // Find child alignments
  const findChildAlignments = () => {
    if (!objective.alignedObjectives) return [];
    
    // Look for alignments where this objective is the parent (source_objective_id)
    return objective.alignedObjectives.filter(
      alignment => alignment.alignmentType === 'parent_child' && 
                   alignment.sourceObjectiveId === objective.id
    );
  };

  const handleDeleteAlignment = async (alignmentId: string) => {
    try {
      await deleteAlignment.mutateAsync(alignmentId);
    } catch (error) {
      console.error('Error deleting alignment:', error);
    }
  };

  // Render parent hierarchy first if exists
  const renderParentHierarchy = () => {
    if (!objective.parentObjective) return null;
    
    const parentAlignmentId = findParentAlignmentId();
    
    return (
      <div className="mb-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Parent Objective</h3>
        <ObjectiveNode 
          objective={objective.parentObjective}
          level={0}
          isExpanded={expandedNodes[objective.parentObjective.id] || false}
          onToggle={() => toggleNode(objective.parentObjective.id)}
          isAdmin={isAdmin}
          canEdit={canEdit}
          showDeleteButton={!!parentAlignmentId}
          onDelete={parentAlignmentId ? () => handleDeleteAlignment(parentAlignmentId) : undefined}
        />
      </div>
    );
  };

  // Render child objectives
  const renderChildObjectives = () => {
    const childAlignments = findChildAlignments();
    if (!childAlignments.length) return null;
    
    return (
      <div className="mt-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Child Objectives</h3>
        {childAlignments.map(alignment => {
          if (!alignment.alignedObjective) return null;
          
          return (
            <ObjectiveNode 
              key={alignment.alignedObjectiveId}
              objective={alignment.alignedObjective}
              level={0}
              isExpanded={expandedNodes[alignment.alignedObjectiveId] || false}
              onToggle={() => toggleNode(alignment.alignedObjectiveId)}
              isAdmin={isAdmin}
              canEdit={canEdit}
              showDeleteButton={true}
              onDelete={() => handleDeleteAlignment(alignment.id)}
            />
          );
        })}
      </div>
    );
  };

  return (
    <Card>
      <CardContent className="p-4">
        {renderParentHierarchy()}
        
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Current Objective</h3>
        <ObjectiveNode 
          objective={objective}
          level={0}
          isExpanded={true}
          onToggle={() => {}}
          isAdmin={isAdmin}
          canEdit={canEdit}
        />
        
        {renderChildObjectives()}
      </CardContent>
    </Card>
  );
};


import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronDown, Trash2, User } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ObjectiveStatusBadge } from '@/components/okr/objectives/ObjectiveStatusBadge';
import { Objective, ObjectiveWithRelations } from '@/types/okr';
import { useAlignments } from '@/hooks/okr/useAlignments';
import { useCurrentUser } from '@/hooks/useCurrentUser';
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
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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

const ObjectiveNode: React.FC<ObjectiveNodeProps> = ({ 
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
  const indentSize = 20; // 20px indentation per level
  
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
        className="flex items-start my-1 p-2 rounded-md hover:bg-muted/30 transition-colors relative"
        style={{ marginLeft: `${level * indentSize}px` }}
      >
        {/* Tree structure lines */}
        {level > 0 && (
          <div 
            className="absolute border-l-2 border-gray-300" 
            style={{ 
              left: `${(level * indentSize) - 10}px`,
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
              left: `${(level * indentSize) - 10}px`,
              width: '10px',
              top: '50%'
            }}
          />
        )}
        
        {children && (
          <div className="mr-1 mt-1 cursor-pointer z-10" onClick={onToggle}>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        )}
        
        <div className="flex-1 min-w-0 z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <Link 
                to={`${basePath}/okrs/objectives/${objective.id}`} 
                className="font-medium hover:underline text-sm block truncate"
              >
                {objective.title}
              </Link>
              
              <div className="flex items-center mt-1 text-xs space-x-2">
                <ObjectiveStatusBadge status={objective.status} className="text-xs h-5 px-1.5" />
                <span className="text-muted-foreground">{Math.round(objective.progress)}%</span>
                
                {ownerName && (
                  <div className="flex items-center text-muted-foreground gap-1">
                    <User className="h-3 w-3" />
                    <span className="truncate max-w-[120px]">{ownerName}</span>
                  </div>
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

interface ObjectiveTreeViewProps {
  objective: ObjectiveWithRelations;
  isAdmin?: boolean;
}

export const ObjectiveTreeView: React.FC<ObjectiveTreeViewProps> = ({ 
  objective,
  isAdmin = false
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    [objective.id]: true, // Main objective is expanded by default
    ...(objective.parentObjective ? { [objective.parentObjective.id]: true } : {})
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

  // Render the tree structure
  const renderObjectiveTree = () => {
    // First check if we have a parent
    const hasParent = !!objective.parentObjective;
    // Get all child alignments
    const childAlignments = findChildAlignments();
    const hasChildren = childAlignments.length > 0;
    
    // If no parent and no children, just render the current objective
    if (!hasParent && !hasChildren) {
      return (
        <ObjectiveNode 
          objective={objective}
          level={0}
          isExpanded={true}
          onToggle={() => {}}
          isAdmin={isAdmin}
          canEdit={canEdit}
        />
      );
    }
    
    // If we have a parent, start the tree with it
    if (hasParent) {
      const parentAlignmentId = findParentAlignmentId();
      
      return (
        <ObjectiveNode 
          objective={objective.parentObjective!}
          level={0}
          isExpanded={expandedNodes[objective.parentObjective!.id] || false}
          onToggle={() => toggleNode(objective.parentObjective!.id)}
          isAdmin={isAdmin}
          canEdit={canEdit}
          showDeleteButton={!!parentAlignmentId}
          onDelete={parentAlignmentId ? () => handleDeleteAlignment(parentAlignmentId) : undefined}
        >
          <ObjectiveNode 
            objective={objective}
            level={1}
            isExpanded={expandedNodes[objective.id] || false}
            onToggle={() => toggleNode(objective.id)}
            isAdmin={isAdmin}
            canEdit={canEdit}
            isLastChild={!hasChildren}
          >
            {hasChildren && childAlignments.map((alignment, index) => (
              alignment.alignedObjective && (
                <ObjectiveNode 
                  key={alignment.alignedObjectiveId}
                  objective={alignment.alignedObjective}
                  level={2}
                  isExpanded={expandedNodes[alignment.alignedObjectiveId] || false}
                  onToggle={() => toggleNode(alignment.alignedObjectiveId)}
                  isAdmin={isAdmin}
                  canEdit={canEdit}
                  showDeleteButton={true}
                  onDelete={() => handleDeleteAlignment(alignment.id)}
                  isLastChild={index === childAlignments.length - 1}
                />
              )
            ))}
          </ObjectiveNode>
        </ObjectiveNode>
      );
    }
    
    // If no parent but we have children
    return (
      <ObjectiveNode 
        objective={objective}
        level={0}
        isExpanded={expandedNodes[objective.id] || false}
        onToggle={() => toggleNode(objective.id)}
        isAdmin={isAdmin}
        canEdit={canEdit}
      >
        {hasChildren && childAlignments.map((alignment, index) => (
          alignment.alignedObjective && (
            <ObjectiveNode 
              key={alignment.alignedObjectiveId}
              objective={alignment.alignedObjective}
              level={1}
              isExpanded={expandedNodes[alignment.alignedObjectiveId] || false}
              onToggle={() => toggleNode(alignment.alignedObjectiveId)}
              isAdmin={isAdmin}
              canEdit={canEdit}
              showDeleteButton={true}
              onDelete={() => handleDeleteAlignment(alignment.id)}
              isLastChild={index === childAlignments.length - 1}
            />
          )
        ))}
      </ObjectiveNode>
    );
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-sm font-medium text-muted-foreground mb-3">Objective Hierarchy</div>
        <div className="tree-view-container">
          {renderObjectiveTree()}
        </div>
      </CardContent>
    </Card>
  );
};

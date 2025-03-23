
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ObjectiveWithRelations } from '@/types/okr';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useObjectiveTree } from './hooks/useObjectiveTree';
import { ObjectiveNode } from './components/ObjectiveNode';

interface ObjectiveTreeViewProps {
  objective: ObjectiveWithRelations;
  isAdmin?: boolean;
}

export const ObjectiveTreeView: React.FC<ObjectiveTreeViewProps> = ({ 
  objective,
  isAdmin = false
}) => {
  const { userId, isAdmin: userIsAdmin } = useCurrentUser();
  const canEdit = userIsAdmin || isAdmin || objective.ownerId === userId;
  
  const {
    expandedNodes,
    toggleNode,
    findParentAlignmentId,
    findChildAlignments,
    handleDeleteAlignment
  } = useObjectiveTree(objective, isAdmin, canEdit);

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

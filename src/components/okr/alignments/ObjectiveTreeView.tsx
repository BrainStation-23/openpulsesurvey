
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
    handleDeleteAlignment,
    rootObjective,
    buildObjectiveHierarchy,
    currentObjectivePath
  } = useObjectiveTree(objective, isAdmin, canEdit);

  // Render the tree structure
  const renderObjectiveTree = () => {
    // If we have a root objective (either the current objective is the root, or we found its root)
    if (rootObjective) {
      // Build the full hierarchy from the root
      const hierarchy = buildObjectiveHierarchy(rootObjective);
      
      // Create a path array of objective IDs leading from root to current objective
      // to highlight the current objective in the tree
      
      return renderObjectiveHierarchyNode(hierarchy, 0, currentObjectivePath);
    }
    
    // Fallback if no hierarchy found
    return (
      <ObjectiveNode 
        objective={objective}
        level={0}
        isExpanded={expandedNodes[objective.id] || false}
        onToggle={() => toggleNode(objective.id)}
        isAdmin={isAdmin}
        canEdit={canEdit}
        isCurrentObjective={true}
      />
    );
  };

  // Recursive function to render hierarchy nodes
  const renderObjectiveHierarchyNode = (node: any, level: number, highlightPath: string[]) => {
    const isCurrentObjective = node.id === objective.id;
    const isInPath = highlightPath.includes(node.id);
    const alignmentId = isCurrentObjective ? null : 
                        (node.parentId === objective.id ? 
                          findChildAlignments().find(a => a.alignedObjectiveId === node.id)?.id : 
                          node.parentId === objective.parentObjectiveId ? findParentAlignmentId() : null);
    
    return (
      <ObjectiveNode
        key={node.id}
        objective={node.objective}
        level={level}
        isExpanded={expandedNodes[node.id] || false}
        onToggle={() => toggleNode(node.id)}
        isAdmin={isAdmin}
        canEdit={canEdit}
        showDeleteButton={alignmentId !== null}
        onDelete={alignmentId ? () => handleDeleteAlignment(alignmentId) : undefined}
        isLastChild={!node.children || node.children.length === 0}
        isCurrentObjective={isCurrentObjective}
        isInCurrentPath={isInPath}
      >
        {node.children && node.children.length > 0 && expandedNodes[node.id] && (
          <React.Fragment>
            {node.children.map((child: any, index: number) => 
              renderObjectiveHierarchyNode(child, level + 1, highlightPath)
            )}
          </React.Fragment>
        )}
      </ObjectiveNode>
    );
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="text-sm font-medium text-muted-foreground mb-3">Objective Hierarchy</div>
        <div className="tree-view-container overflow-x-auto">
          {renderObjectiveTree()}
        </div>
      </CardContent>
    </Card>
  );
};

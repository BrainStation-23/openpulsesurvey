
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ObjectiveStatusBadge } from '@/components/okr/objectives/ObjectiveStatusBadge';
import { Objective, ObjectiveWithRelations } from '@/types/okr';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface ObjectiveNodeProps {
  objective: Objective;
  level: number;
  isExpanded: boolean;
  onToggle: () => void;
  isAdmin?: boolean;
}

const ObjectiveNode: React.FC<ObjectiveNodeProps> = ({ 
  objective, 
  level, 
  isExpanded, 
  onToggle,
  isAdmin = false 
}) => {
  const basePath = isAdmin ? '/admin' : '/user';
  const indentSize = level * 20; // 20px indentation per level

  return (
    <div className="my-2">
      <div 
        className="flex items-start p-3 border rounded-md hover:bg-muted/20 cursor-pointer transition-colors"
        onClick={onToggle}
        style={{ marginLeft: `${indentSize}px` }}
      >
        <div className="mr-2 mt-1">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <Link to={`${basePath}/okrs/objectives/${objective.id}`} className="font-medium hover:underline" onClick={(e) => e.stopPropagation()}>
              {objective.title}
            </Link>
            <ObjectiveStatusBadge status={objective.status} />
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

  const toggleNode = (objectiveId: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [objectiveId]: !prev[objectiveId]
    }));
  };

  // Recursive function to render the hierarchy
  const renderObjectiveTree = (obj: Objective, level: number = 0) => {
    const isExpanded = expandedNodes[obj.id] || false;
    
    // Find child objectives
    const children = objective.childObjectives?.filter(child => 
      child.parentObjectiveId === obj.id
    ) || [];

    return (
      <div key={obj.id}>
        <ObjectiveNode 
          objective={obj} 
          level={level} 
          isExpanded={isExpanded} 
          onToggle={() => toggleNode(obj.id)}
          isAdmin={isAdmin}
        />
        
        {isExpanded && children.length > 0 && (
          <div>
            {children.map(child => renderObjectiveTree(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Render parent hierarchy first if exists
  const renderParentHierarchy = () => {
    if (!objective.parentObjective) return null;
    
    return (
      <div className="mb-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Parent Objective</h3>
        {renderObjectiveTree(objective.parentObjective, 0)}
      </div>
    );
  };

  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-4">Objective Hierarchy</h2>
        
        {renderParentHierarchy()}
        
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Current Objective</h3>
        {renderObjectiveTree(objective, objective.parentObjective ? 1 : 0)}
        
        {objective.childObjectives && objective.childObjectives.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Child Objectives</h3>
            {/* Child objectives are already rendered in the tree */}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

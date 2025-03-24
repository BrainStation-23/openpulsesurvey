import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { ObjectiveWithRelations, Objective } from '@/types/okr';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useObjectiveTree } from './hooks/useObjectiveTree';
import { ObjectiveNode } from './components/ObjectiveNode';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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

  // Find the root objective by traversing up the parent chain
  const { data: rootObjective, isLoading: isLoadingRoot } = useQuery({
    queryKey: ['root-objective', objective.id],
    queryFn: async () => {
      if (!objective.parentObjective) {
        return objective; // Current objective is already the root
      }
      
      // Start with the immediate parent
      let currentObj: Objective = objective.parentObjective;
      let rootObj: Objective = currentObj;
      
      // Keep traversing up until we find the topmost parent (root)
      while (currentObj.parentObjectiveId) {
        const { data, error } = await supabase
          .from('objectives')
          .select('*')
          .eq('id', currentObj.parentObjectiveId)
          .single();
          
        if (error || !data) break;
        
        rootObj = {
          id: data.id,
          title: data.title,
          description: data.description,
          cycleId: data.cycle_id,
          ownerId: data.owner_id,
          status: data.status,
          progress: data.progress,
          visibility: data.visibility,
          parentObjectiveId: data.parent_objective_id,
          sbuId: data.sbu_id,
          approvalStatus: data.approval_status,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at)
        };
        
        currentObj = rootObj;
      }
      
      return rootObj;
    }
  });

  // Fetch all objectives in the hierarchy (all descendents of the root)
  const { data: hierarchyObjectives, isLoading: isLoadingHierarchy } = useQuery({
    queryKey: ['hierarchy-objectives', rootObjective?.id],
    queryFn: async () => {
      if (!rootObjective) return [];
      
      // Get all objectives that are descendants of the root
      const { data, error } = await supabase
        .from('okr_alignments')
        .select(`
          id,
          source_objective_id,
          aligned_objective_id,
          alignment_type,
          weight,
          source_objective:objectives!source_objective_id (
            id, title, description, cycle_id, owner_id, status, progress, visibility, 
            parent_objective_id, sbu_id, approval_status, created_at, updated_at
          ),
          aligned_objective:objectives!aligned_objective_id (
            id, title, description, cycle_id, owner_id, status, progress, visibility, 
            parent_objective_id, sbu_id, approval_status, created_at, updated_at
          )
        `)
        .eq('alignment_type', 'parent_child');
        
      if (error) {
        console.error('Error fetching hierarchy objectives:', error);
        return [];
      }
      
      return data;
    },
    enabled: !!rootObjective
  });

  // Build a map of parent to children relationships
  const buildObjectiveHierarchyMap = () => {
    if (!hierarchyObjectives) return new Map();
    
    const hierarchyMap = new Map<string, { 
      objective: Objective, 
      children: { objective: Objective, alignmentId: string }[] 
    }>();
    
    // Initialize the root
    if (rootObjective) {
      hierarchyMap.set(rootObjective.id, { 
        objective: rootObjective, 
        children: [] 
      });
    }
    
    // Add all alignments to the map
    hierarchyObjectives.forEach(alignment => {
      const parentId = alignment.source_objective_id;
      const childId = alignment.aligned_objective_id;
      
      if (alignment.source_objective && alignment.aligned_objective) {
        const parent = {
          id: alignment.source_objective.id,
          title: alignment.source_objective.title,
          description: alignment.source_objective.description,
          cycleId: alignment.source_objective.cycle_id,
          ownerId: alignment.source_objective.owner_id,
          status: alignment.source_objective.status,
          progress: alignment.source_objective.progress,
          visibility: alignment.source_objective.visibility,
          parentObjectiveId: alignment.source_objective.parent_objective_id,
          sbuId: alignment.source_objective.sbu_id,
          approvalStatus: alignment.source_objective.approval_status,
          createdAt: new Date(alignment.source_objective.created_at),
          updatedAt: new Date(alignment.source_objective.updated_at)
        };
        
        const child = {
          id: alignment.aligned_objective.id,
          title: alignment.aligned_objective.title,
          description: alignment.aligned_objective.description,
          cycleId: alignment.aligned_objective.cycle_id,
          ownerId: alignment.aligned_objective.owner_id,
          status: alignment.aligned_objective.status,
          progress: alignment.aligned_objective.progress,
          visibility: alignment.aligned_objective.visibility,
          parentObjectiveId: alignment.aligned_objective.parent_objective_id,
          sbuId: alignment.aligned_objective.sbu_id,
          approvalStatus: alignment.aligned_objective.approval_status,
          createdAt: new Date(alignment.aligned_objective.created_at),
          updatedAt: new Date(alignment.aligned_objective.updated_at)
        };
        
        // Add or update parent in the map
        if (!hierarchyMap.has(parentId)) {
          hierarchyMap.set(parentId, { objective: parent, children: [] });
        }
        
        // Add child to parent's children
        hierarchyMap.get(parentId)?.children.push({ 
          objective: child, 
          alignmentId: alignment.id 
        });
      }
    });
    
    return hierarchyMap;
  };

  // Recursive function to render the objective hierarchy
  const renderObjectiveHierarchy = (
    objectiveId: string, 
    level: number = 0, 
    hierarchyMap: Map<string, { 
      objective: Objective, 
      children: { objective: Objective, alignmentId: string }[] 
    }>,
    isLastChild: boolean = false
  ) => {
    const node = hierarchyMap.get(objectiveId);
    if (!node) return null;
    
    const { objective: obj, children } = node;
    const isCurrentObjective = obj.id === objective.id;
    
    return (
      <ObjectiveNode 
        key={obj.id}
        objective={obj}
        level={level}
        isExpanded={expandedNodes[obj.id] || false}
        onToggle={() => toggleNode(obj.id)}
        isAdmin={isAdmin}
        canEdit={canEdit}
        showDeleteButton={level > 0 && canEdit}
        onDelete={children.length === 0 && level > 0 ? 
          () => {
            const alignment = hierarchyObjectives?.find(a => 
              a.source_objective_id === obj.parentObjectiveId && 
              a.aligned_objective_id === obj.id
            );
            if (alignment) handleDeleteAlignment(alignment.id);
          } : undefined
        }
        isLastChild={isLastChild}
        isCurrentObjective={isCurrentObjective}
      >
        {children.length > 0 && (
          <>
            {children.map((child, index) => 
              renderObjectiveHierarchy(
                child.objective.id, 
                level + 1, 
                hierarchyMap, 
                index === children.length - 1
              )
            )}
          </>
        )}
      </ObjectiveNode>
    );
  };

  // Loading state
  if (isLoadingRoot || isLoadingHierarchy) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-sm font-medium text-muted-foreground mb-3">Loading objective hierarchy...</div>
        </CardContent>
      </Card>
    );
  }

  // Build the hierarchy map
  const hierarchyMap = buildObjectiveHierarchyMap();
  
  // If we have a root objective, render the tree starting from it
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="text-sm font-medium text-muted-foreground mb-3">Objective Hierarchy</div>
        <div className="tree-view-container overflow-x-auto">
          {rootObjective && renderObjectiveHierarchy(rootObjective.id, 0, hierarchyMap)}
        </div>
      </CardContent>
    </Card>
  );
};

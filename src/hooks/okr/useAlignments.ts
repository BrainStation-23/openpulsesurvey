import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ObjectiveAlignment, CreateAlignmentInput, AlignmentType } from '@/types/okr';
import { useToast } from '@/hooks/use-toast';
import { useObjectiveConstraints } from './useObjectiveConstraints';

export const useAlignments = (objectiveId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { canCreateChildAlignments } = useObjectiveConstraints(objectiveId);

  // Fetch all alignments for an objective
  const { 
    data: alignments, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['alignments', objectiveId],
    queryFn: async () => {
      if (!objectiveId) return [];
      
      // Fetch alignments where this objective is the source
      const { data: sourceAlignments, error: sourceError } = await supabase
        .from('okr_alignments')
        .select(`
          id,
          source_objective_id,
          aligned_objective_id,
          alignment_type,
          weight,
          created_by,
          created_at,
          aligned_objective:objectives!aligned_objective_id (
            id, 
            title, 
            description, 
            cycle_id, 
            owner_id,
            status,
            progress,
            visibility
          )
        `)
        .eq('source_objective_id', objectiveId)
        .eq('alignment_type', 'parent_child');
      
      if (sourceError) {
        console.error('Error fetching source alignments:', sourceError);
        throw sourceError;
      }
      
      // Fetch alignments where this objective is the target
      const { data: targetAlignments, error: targetError } = await supabase
        .from('okr_alignments')
        .select(`
          id,
          source_objective_id,
          aligned_objective_id,
          alignment_type,
          weight,
          created_by,
          created_at,
          source_objective:objectives!source_objective_id (
            id, 
            title, 
            description, 
            cycle_id, 
            owner_id,
            status,
            progress,
            visibility
          )
        `)
        .eq('aligned_objective_id', objectiveId)
        .eq('alignment_type', 'parent_child');
      
      if (targetError) {
        console.error('Error fetching target alignments:', targetError);
        throw targetError;
      }
      
      // Transform source alignments (this objective is parent, aligned objectives are children)
      const formattedSourceAlignments = sourceAlignments.map(alignment => ({
        id: alignment.id,
        sourceObjectiveId: alignment.source_objective_id,
        alignedObjectiveId: alignment.aligned_objective_id,
        alignmentType: alignment.alignment_type as AlignmentType,
        weight: alignment.weight,
        createdBy: alignment.created_by,
        createdAt: new Date(alignment.created_at),
        alignedObjective: alignment.aligned_objective ? {
          id: alignment.aligned_objective.id,
          title: alignment.aligned_objective.title,
          description: alignment.aligned_objective.description,
          cycleId: alignment.aligned_objective.cycle_id,
          ownerId: alignment.aligned_objective.owner_id,
          status: alignment.aligned_objective.status,
          progress: alignment.aligned_objective.progress,
          visibility: alignment.aligned_objective.visibility,
          createdAt: new Date(),  // These dates are not available in the joined query
          updatedAt: new Date(),  // These dates are not available in the joined query
          approvalStatus: 'pending'  // Default value since it's not in the join
        } : undefined
      }));
      
      // Transform target alignments (this objective is child, source objectives are parents)
      const formattedTargetAlignments = targetAlignments.map(alignment => ({
        id: alignment.id,
        sourceObjectiveId: alignment.source_objective_id,
        alignedObjectiveId: alignment.aligned_objective_id,
        alignmentType: alignment.alignment_type as AlignmentType,
        weight: alignment.weight,
        createdBy: alignment.created_by,
        createdAt: new Date(alignment.created_at),
        sourceObjective: alignment.source_objective ? {
          id: alignment.source_objective.id,
          title: alignment.source_objective.title,
          description: alignment.source_objective.description,
          cycleId: alignment.source_objective.cycle_id,
          ownerId: alignment.source_objective.owner_id,
          status: alignment.source_objective.status,
          progress: alignment.source_objective.progress,
          visibility: alignment.source_objective.visibility,
          createdAt: new Date(),  // These dates are not available in the joined query
          updatedAt: new Date(),  // These dates are not available in the joined query
          approvalStatus: 'pending'  // Default value since it's not in the join
        } : undefined
      }));
      
      return [...formattedSourceAlignments, ...formattedTargetAlignments] as ObjectiveAlignment[];
    },
    enabled: !!objectiveId
  });

  // Helper function to invalidate all related queries - moved inside the hook
  const invalidateRelatedQueries = (id?: string) => {
    if (id) {
      queryClient.invalidateQueries({ queryKey: ['alignments', id] });
      queryClient.invalidateQueries({ queryKey: ['objective-children', id] });
      queryClient.invalidateQueries({ queryKey: ['objective-parent', id] });
      queryClient.invalidateQueries({ queryKey: ['objective', id] });
      queryClient.invalidateQueries({ queryKey: ['objective-alignments', id] });
      queryClient.invalidateQueries({ queryKey: ['objective-with-relations', id] });
      
      // Also invalidate the objectives list to update the hierarchy everywhere
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
    }
  };

  // Create a new alignment
  const createAlignment = useMutation({
    mutationFn: async (data: CreateAlignmentInput) => {
      // First, check if the relationship would create a cycle
      if (data.alignmentType === 'parent_child') {
        const cycleCheck = await checkForCycles(data.sourceObjectiveId, data.alignedObjectiveId);
        if (cycleCheck.wouldCreateCycle) {
          throw new Error("This alignment would create a circular dependency in your objectives hierarchy.");
        }
      }
      
      // Check if we're creating a child alignment where this objective is the parent
      if (data.alignmentType === 'parent_child' && data.sourceObjectiveId === objectiveId) {
        // If this objective is the parent and has key results, we can't create child alignments
        if (!canCreateChildAlignments) {
          throw new Error("This objective has key results and cannot have child alignments.");
        }
      }
      
      const { data: newAlignment, error } = await supabase
        .from('okr_alignments')
        .insert({
          source_objective_id: data.sourceObjectiveId,
          aligned_objective_id: data.alignedObjectiveId,
          alignment_type: data.alignmentType,
          weight: data.weight || 1,
          created_by: (await supabase.auth.getSession()).data.session?.user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating alignment:', error);
        throw error;
      }

      // For parent-child relationships, also update the parent_objective_id in the child objective
      if (data.alignmentType === 'parent_child') {
        const { error: updateError } = await supabase
          .from('objectives')
          .update({ parent_objective_id: data.sourceObjectiveId })
          .eq('id', data.alignedObjectiveId);
        
        if (updateError) {
          console.error('Error updating parent reference:', updateError);
          throw updateError;
        }
      }

      return newAlignment;
    },
    onSuccess: () => {
      // Use the invalidateRelatedQueries function from the same scope
      invalidateRelatedQueries(objectiveId);
      toast({
        title: 'Alignment created',
        description: 'The objectives have been aligned successfully.',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error creating alignment',
        description: error.message,
      });
    }
  });

  // Delete an alignment
  const deleteAlignment = useMutation({
    mutationFn: async (alignmentId: string) => {
      // First, get alignment details to know what we're deleting
      const { data: alignmentDetails, error: fetchError } = await supabase
        .from('okr_alignments')
        .select('*')
        .eq('id', alignmentId)
        .single();

      if (fetchError) {
        console.error('Error fetching alignment details:', fetchError);
        throw fetchError;
      }

      // Delete the alignment
      const { error } = await supabase
        .from('okr_alignments')
        .delete()
        .eq('id', alignmentId);

      if (error) {
        console.error('Error deleting alignment:', error);
        throw error;
      }

      // If it was a parent-child relationship, also update the parent_objective_id to null
      if (alignmentDetails.alignment_type === 'parent_child') {
        const { error: updateError } = await supabase
          .from('objectives')
          .update({ parent_objective_id: null })
          .eq('id', alignmentDetails.aligned_objective_id);
        
        if (updateError) {
          console.error('Error removing parent reference:', updateError);
          throw updateError;
        }
      }

      return alignmentId;
    },
    onSuccess: () => {
      // Use the invalidateRelatedQueries function from the same scope
      invalidateRelatedQueries(objectiveId);
      toast({
        title: 'Alignment removed',
        description: 'The alignment has been removed successfully.',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error removing alignment',
        description: error.message,
      });
    }
  });

  // Helper function to check if an alignment would create a cycle
  const checkForCycles = async (parentId: string, childId: string) => {
    // Here we check if making childId a child of parentId would create a cycle
    // This happens if parentId is already a descendant of childId
    
    // Helper function to get all descendant IDs of an objective
    const getDescendantIds = async (id: string): Promise<string[]> => {
      const { data, error } = await supabase
        .from('objectives')
        .select('id')
        .eq('parent_objective_id', id);

      if (error) {
        console.error('Error fetching descendants:', error);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      const childIds = data.map(obj => obj.id);
      const nestedDescendants = await Promise.all(childIds.map(getDescendantIds));
      return [...childIds, ...nestedDescendants.flat()];
    };

    // Get all descendants of the child ID
    const descendants = await getDescendantIds(childId);
    
    // If the potential parent is among the descendants, we would create a cycle
    return { 
      wouldCreateCycle: descendants.includes(parentId) 
    };
  };

  return {
    alignments,
    isLoading,
    error,
    createAlignment,
    deleteAlignment
  };
};

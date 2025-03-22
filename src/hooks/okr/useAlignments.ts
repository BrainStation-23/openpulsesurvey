
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ObjectiveAlignment, CreateAlignmentInput, AlignmentType } from '@/types/okr';
import { useToast } from '@/hooks/use-toast';

export const useAlignments = (objectiveId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
          aligned_objective:aligned_objective_id (
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
        .eq('source_objective_id', objectiveId);
      
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
          source_objective:source_objective_id (
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
        .eq('aligned_objective_id', objectiveId);
      
      if (targetError) {
        console.error('Error fetching target alignments:', targetError);
        throw targetError;
      }
      
      // Transform source alignments
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
      
      // Transform target alignments
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

  // Create a new alignment
  const createAlignment = useMutation({
    mutationFn: async (data: CreateAlignmentInput) => {
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

      return newAlignment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alignments', objectiveId] });
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
      const { error } = await supabase
        .from('okr_alignments')
        .delete()
        .eq('id', alignmentId);

      if (error) {
        console.error('Error deleting alignment:', error);
        throw error;
      }

      return alignmentId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alignments', objectiveId] });
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

  return {
    alignments,
    isLoading,
    error,
    createAlignment,
    deleteAlignment
  };
};

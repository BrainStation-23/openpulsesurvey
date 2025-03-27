
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ObjectiveAlignment {
  id: string;
  source_objective_id: string;
  aligned_objective_id: string;
  alignment_type: 'parent_child' | 'peer' | 'strategic';
  created_at: string;
  created_by: string;
  alignment_strength?: number;
  alignment_notes?: string;
}

export interface AlignedObjective {
  id: string;
  title: string;
  description?: string;
  visibility: 'private' | 'team' | 'department' | 'organization';
  owner_id: string;
  owner_name?: string;
  owner_avatar_url?: string;
  progress: number;
  alignment_id: string;
  alignment_type: 'parent_child' | 'peer' | 'strategic';
}

export const useObjectiveAlignments = (objectiveId?: string) => {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch alignments where this objective is the source
  const {
    data: sourceAlignments = [],
    isLoading: isLoadingSourceAlignments,
    error: sourceAlignmentsError,
  } = useQuery({
    queryKey: ['objective-source-alignments', objectiveId],
    queryFn: async () => {
      if (!objectiveId) return [];
      
      const { data, error } = await supabase
        .from('okr_alignments')
        .select(`
          id,
          source_objective_id,
          aligned_objective_id,
          alignment_type,
          alignment_strength,
          alignment_notes,
          created_at,
          created_by,
          aligned_objective:objectives!aligned_objective_id(
            id,
            title,
            description,
            visibility,
            progress,
            owner_id,
            owner:profiles!owner_id(
              id,
              full_name,
              avatar_url
            )
          )
        `)
        .eq('source_objective_id', objectiveId);

      if (error) throw error;

      return data.map(item => ({
        id: item.id,
        source_objective_id: item.source_objective_id,
        aligned_objective_id: item.aligned_objective_id,
        alignment_type: item.alignment_type,
        alignment_strength: item.alignment_strength,
        alignment_notes: item.alignment_notes,
        created_at: item.created_at,
        created_by: item.created_by,
        alignedObjective: {
          id: item.aligned_objective.id,
          title: item.aligned_objective.title,
          description: item.aligned_objective.description,
          visibility: item.aligned_objective.visibility,
          progress: item.aligned_objective.progress,
          owner_id: item.aligned_objective.owner_id,
          owner_name: item.aligned_objective.owner?.full_name,
          owner_avatar_url: item.aligned_objective.owner?.avatar_url,
        }
      }));
    },
    enabled: !!objectiveId,
  });

  // Fetch alignments where this objective is the target
  const {
    data: targetAlignments = [],
    isLoading: isLoadingTargetAlignments,
    error: targetAlignmentsError,
  } = useQuery({
    queryKey: ['objective-target-alignments', objectiveId],
    queryFn: async () => {
      if (!objectiveId) return [];
      
      const { data, error } = await supabase
        .from('okr_alignments')
        .select(`
          id,
          source_objective_id,
          aligned_objective_id,
          alignment_type,
          alignment_strength,
          alignment_notes,
          created_at,
          created_by,
          source_objective:objectives!source_objective_id(
            id,
            title,
            description,
            visibility,
            progress,
            owner_id,
            owner:profiles!owner_id(
              id,
              full_name,
              avatar_url
            )
          )
        `)
        .eq('aligned_objective_id', objectiveId);

      if (error) throw error;

      return data.map(item => ({
        id: item.id,
        source_objective_id: item.source_objective_id,
        aligned_objective_id: item.aligned_objective_id,
        alignment_type: item.alignment_type,
        alignment_strength: item.alignment_strength,
        alignment_notes: item.alignment_notes,
        created_at: item.created_at,
        created_by: item.created_by,
        sourceObjective: {
          id: item.source_objective.id,
          title: item.source_objective.title,
          description: item.source_objective.description,
          visibility: item.source_objective.visibility,
          progress: item.source_objective.progress,
          owner_id: item.source_objective.owner_id,
          owner_name: item.source_objective.owner?.full_name,
          owner_avatar_url: item.source_objective.owner?.avatar_url,
        }
      }));
    },
    enabled: !!objectiveId,
  });

  // Create new alignment
  const createAlignment = useMutation({
    mutationFn: async (data: { 
      sourceObjectiveId: string; 
      alignedObjectiveId: string;
      alignmentType: 'parent_child' | 'peer' | 'strategic';
      alignmentNotes?: string;
      alignmentStrength?: number;
    }) => {
      setIsCreating(true);
      
      const { data: newAlignment, error } = await supabase
        .from('okr_alignments')
        .insert({
          source_objective_id: data.sourceObjectiveId,
          aligned_objective_id: data.alignedObjectiveId,
          alignment_type: data.alignmentType,
          alignment_notes: data.alignmentNotes,
          alignment_strength: data.alignmentStrength
        })
        .select()
        .single();

      if (error) throw error;
      
      return newAlignment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['objective-source-alignments', objectiveId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['objective-target-alignments', objectiveId]
      });
      
      toast({
        title: 'Alignment created',
        description: 'The objectives have been aligned successfully.',
      });
      
      setIsCreating(false);
    },
    onError: (error) => {
      console.error('Error creating alignment:', error);
      toast({
        variant: 'destructive',
        title: 'Error creating alignment',
        description: 'There was an error aligning the objectives. Please try again.',
      });
      
      setIsCreating(false);
    }
  });

  // Delete alignment
  const deleteAlignment = useMutation({
    mutationFn: async (alignmentId: string) => {
      const { error } = await supabase
        .from('okr_alignments')
        .delete()
        .eq('id', alignmentId);

      if (error) throw error;
      
      return alignmentId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['objective-source-alignments', objectiveId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['objective-target-alignments', objectiveId]
      });
      
      toast({
        title: 'Alignment removed',
        description: 'The alignment between objectives has been removed.',
      });
    },
    onError: (error) => {
      console.error('Error deleting alignment:', error);
      toast({
        variant: 'destructive',
        title: 'Error removing alignment',
        description: 'There was an error removing the alignment. Please try again.',
      });
    }
  });

  return {
    sourceAlignments,
    targetAlignments,
    isLoading: isLoadingSourceAlignments || isLoadingTargetAlignments,
    error: sourceAlignmentsError || targetAlignmentsError,
    createAlignment,
    deleteAlignment,
    isCreating
  };
};

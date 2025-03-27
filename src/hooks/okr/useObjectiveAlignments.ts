
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Objective {
  id: string;
  title: string;
  visibility: 'private' | 'team' | 'department' | 'organization';
  progress: number;
  status: string;
}

interface Alignment {
  id: string;
  source_objective_id: string;
  aligned_objective_id: string;
  alignment_type: string;
  created_at: string;
  created_by: string;
}

interface ProcessedAlignment {
  id: string;
  source_objective_id: string;
  aligned_objective_id: string;
  alignmentType: string;
  created_at: string;
  created_by: string;
  
  // For alignments FROM this objective
  alignedObjectiveTitle: string;
  alignedObjectiveProgress: number;
  alignedObjectiveStatus: string;
  alignedObjectiveVisibility: 'private' | 'team' | 'department' | 'organization';
  
  // For alignments TO this objective
  sourceObjectiveTitle: string;
  sourceObjectiveProgress: number;
  sourceObjectiveStatus: string;
  sourceObjectiveVisibility: 'private' | 'team' | 'department' | 'organization';
}

export function useObjectiveAlignments(objectiveId: string) {
  const fetchAlignments = async () => {
    // Fetch alignments FROM this objective (where this objective is the source)
    const { data: alignmentsFromData, error: alignmentsFromError } = await supabase
      .from('okr_alignments')
      .select(`
        id,
        source_objective_id,
        aligned_objective_id,
        alignment_type,
        created_at,
        created_by,
        aligned_objective:objectives!aligned_objective_id(
          id,
          title,
          visibility,
          progress,
          status
        )
      `)
      .eq('source_objective_id', objectiveId);
    
    if (alignmentsFromError) throw alignmentsFromError;
    
    // Fetch alignments TO this objective (where this objective is the target)
    const { data: alignmentsToData, error: alignmentsToError } = await supabase
      .from('okr_alignments')
      .select(`
        id,
        source_objective_id,
        aligned_objective_id,
        alignment_type,
        created_at,
        created_by,
        source_objective:objectives!source_objective_id(
          id,
          title,
          visibility,
          progress,
          status
        )
      `)
      .eq('aligned_objective_id', objectiveId);
    
    if (alignmentsToError) throw alignmentsToError;
    
    // Process alignments FROM this objective
    const processedAlignmentsFrom = alignmentsFromData.map(alignment => ({
      id: alignment.id,
      source_objective_id: alignment.source_objective_id,
      aligned_objective_id: alignment.aligned_objective_id,
      alignmentType: alignment.alignment_type,
      created_at: alignment.created_at,
      created_by: alignment.created_by,
      
      // Extract aligned objective data
      alignedObjectiveTitle: alignment.aligned_objective?.title || 'Unknown',
      alignedObjectiveProgress: alignment.aligned_objective?.progress || 0,
      alignedObjectiveStatus: alignment.aligned_objective?.status || 'draft',
      alignedObjectiveVisibility: alignment.aligned_objective?.visibility || 'private',
    }));
    
    // Process alignments TO this objective
    const processedAlignmentsTo = alignmentsToData.map(alignment => ({
      id: alignment.id,
      source_objective_id: alignment.source_objective_id,
      aligned_objective_id: alignment.aligned_objective_id,
      alignmentType: alignment.alignment_type,
      created_at: alignment.created_at,
      created_by: alignment.created_by,
      
      // Extract source objective data
      sourceObjectiveTitle: alignment.source_objective?.title || 'Unknown',
      sourceObjectiveProgress: alignment.source_objective?.progress || 0,
      sourceObjectiveStatus: alignment.source_objective?.status || 'draft',
      sourceObjectiveVisibility: alignment.source_objective?.visibility || 'private',
    }));
    
    return {
      alignmentsFrom: processedAlignmentsFrom,
      alignmentsTo: processedAlignmentsTo
    };
  };
  
  const { 
    data, 
    isLoading, 
    error, 
    refetch
  } = useQuery({
    queryKey: ['objective-alignments', objectiveId],
    queryFn: fetchAlignments,
    enabled: !!objectiveId,
  });
  
  async function createAlignment(alignedObjectiveId: string, alignmentType: string, notes?: string) {
    try {
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('okr_alignments')
        .insert({
          source_objective_id: objectiveId,
          aligned_objective_id: alignedObjectiveId,
          alignment_type: alignmentType,
          created_by: userData.user?.id
        })
        .select();
      
      if (error) throw error;
      
      // Refetch alignments
      refetch();
      
      return data;
    } catch (error) {
      console.error('Error creating alignment:', error);
      throw error;
    }
  }
  
  async function deleteAlignment(alignmentId: string) {
    try {
      const { error } = await supabase
        .from('okr_alignments')
        .delete()
        .eq('id', alignmentId);
      
      if (error) throw error;
      
      // Refetch alignments
      refetch();
    } catch (error) {
      console.error('Error deleting alignment:', error);
      throw error;
    }
  }
  
  return {
    alignmentsFrom: data?.alignmentsFrom || [],
    alignmentsTo: data?.alignmentsTo || [],
    isLoading,
    error,
    refetch,
    createAlignment,
    deleteAlignment
  };
}

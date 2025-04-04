
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useKeyResults } from './useKeyResults';

/**
 * Hook that provides validation for objective constraints
 * - An objective with key results cannot have child alignments
 * - An objective with child alignments cannot have key results
 */
export const useObjectiveConstraints = (objectiveId?: string) => {
  // Fetch key results for this objective
  const { data: keyResults, isLoading: isLoadingKeyResults } = useKeyResults(objectiveId);
  
  // Fetch alignments for this objective directly without using useAlignments
  const { data: alignments, isLoading: isLoadingAlignments } = useQuery({
    queryKey: ['objective-alignments', objectiveId],
    queryFn: async () => {
      if (!objectiveId) return [];
      
      // Fetch alignments where this objective is the source
      const { data: sourceAlignments, error: sourceError } = await supabase
        .from('okr_alignments')
        .select(`
          id,
          source_objective_id,
          aligned_objective_id,
          alignment_type
        `)
        .eq('source_objective_id', objectiveId)
        .eq('alignment_type', 'parent_child');
      
      if (sourceError) {
        console.error('Error fetching source alignments:', sourceError);
        throw sourceError;
      }
      
      return sourceAlignments;
    },
    enabled: !!objectiveId
  });
  
  // Check if this objective has any key results
  const hasKeyResults = keyResults && keyResults.length > 0;
  
  // Check if this objective has any child objectives (where it is the parent)
  const hasChildAlignments = alignments && alignments.some(
    alignment => alignment.source_objective_id === objectiveId && alignment.alignment_type === 'parent_child'
  );
  
  // An objective with key results can create parent alignments but not child alignments
  const canCreateChildAlignments = !hasKeyResults;
  
  // An objective with child alignments cannot create key results
  const canCreateKeyResults = !hasChildAlignments;
  
  // Loading state
  const isLoading = isLoadingKeyResults || isLoadingAlignments;
  
  return {
    hasKeyResults,
    hasChildAlignments,
    canCreateChildAlignments,
    canCreateKeyResults,
    isLoading
  };
};

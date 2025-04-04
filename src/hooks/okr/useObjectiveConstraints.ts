
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useKeyResults } from './useKeyResults';
import { useAlignments } from './useAlignments';

/**
 * Hook that provides validation for objective constraints
 * - An objective with key results cannot have child alignments
 * - An objective with child alignments cannot have key results
 */
export const useObjectiveConstraints = (objectiveId?: string) => {
  // Fetch key results for this objective
  const { data: keyResults, isLoading: isLoadingKeyResults } = useKeyResults(objectiveId);
  
  // Fetch alignments for this objective
  const { alignments, isLoading: isLoadingAlignments } = useAlignments(objectiveId);
  
  // Check if this objective has any key results
  const hasKeyResults = keyResults && keyResults.length > 0;
  
  // Check if this objective has any child objectives (where it is the parent)
  const hasChildAlignments = alignments && alignments.some(
    alignment => alignment.sourceObjectiveId === objectiveId && alignment.alignmentType === 'parent_child'
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

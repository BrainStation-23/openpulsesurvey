
import { useKeyResultsQuery } from './keyResultQueries';
import { useCreateKeyResult } from './mutations/useCreateKeyResult';
import { useUpdateKeyResult } from './mutations/useUpdateKeyResult';
import { useDeleteKeyResult } from './mutations/useDeleteKeyResult';

/**
 * Main hook for key results management
 * 
 * @param objectiveId - The ID of the objective to manage key results for
 * @returns Object with key results data and mutation functions
 */
export const useKeyResults = (objectiveId?: string) => {
  const { 
    data: keyResults, 
    isLoading, 
    error 
  } = useKeyResultsQuery(objectiveId);
  
  const createKeyResult = useCreateKeyResult(objectiveId);
  const updateKeyResult = useUpdateKeyResult(objectiveId);
  const deleteKeyResult = useDeleteKeyResult(objectiveId);

  return {
    keyResults,
    isLoading,
    error,
    createKeyResult,
    updateKeyResult,
    deleteKeyResult
  };
};

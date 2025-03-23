
import { KeyResult, KeyResultStatus, UpdateKeyResultInput, CreateKeyResultInput } from '@/types/okr';
import { useKeyResultQuery } from './useKeyResultQuery';
import { useKeyResultMutations } from './useKeyResultMutations';

/**
 * Main hook for key result operations that combines query and mutations
 */
export const useKeyResult = (id?: string) => {
  const {
    data: keyResult,
    isLoading,
    error
  } = useKeyResultQuery(id);

  const {
    updateStatus,
    updateProgress,
    updateKeyResult,
    deleteKeyResult,
    isDeleting,
    createKeyResult
  } = useKeyResultMutations(id, keyResult?.objectiveId);

  return {
    keyResult,
    isLoading,
    error,
    updateStatus,
    updateProgress,
    updateKeyResult,
    deleteKeyResult,
    isDeleting,
    createKeyResult
  };
};

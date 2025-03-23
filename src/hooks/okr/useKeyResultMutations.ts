
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { KeyResultStatus, UpdateKeyResultInput, CreateKeyResultInput } from '@/types/okr';
import { useToast } from '@/hooks/use-toast';
import { 
  updateKeyResultStatus, 
  updateKeyResultProgress, 
  updateKeyResult as updateKeyResultData,
  deleteKeyResult as deleteKeyResultData,
  createKeyResult as createKeyResultData
} from './utils/keyResultUtils';

/**
 * Hook providing mutations for key result operations
 */
export const useKeyResultMutations = (id?: string, objectiveId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  // Helper function to invalidate related queries
  const invalidateRelatedQueries = () => {
    // Invalidate the specific key result
    queryClient.invalidateQueries({ queryKey: ['key-result', id] });
    
    // Invalidate the key results list
    queryClient.invalidateQueries({ queryKey: ['key-results'] });
    
    // Invalidate related objective data
    if (objectiveId) {
      queryClient.invalidateQueries({ queryKey: ['objective', objectiveId] });
    }
    
    // Invalidate the objectives list and related queries
    queryClient.invalidateQueries({ queryKey: ['objectives'] });
    
    // Invalidate any objective with relations query that might exist
    queryClient.invalidateQueries({ queryKey: ['objective-with-relations'] });
    
    // Add more specific invalidations
    queryClient.invalidateQueries({ queryKey: ['keyResults'] });
    
    console.log('Invalidated queries after key result update');
  };

  // Update key result status
  const updateStatus = useMutation({
    mutationFn: (status: KeyResultStatus) => updateKeyResultStatus(id || '', status),
    onSuccess: () => {
      invalidateRelatedQueries();
      
      toast({
        title: 'Status updated',
        description: 'The key result status has been updated.',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error updating status',
        description: error.message,
      });
    }
  });

  // Update key result progress
  const updateProgress = useMutation({
    mutationFn: (data: { currentValue?: number; booleanValue?: boolean }) => 
      updateKeyResultProgress(id || '', data),
    onSuccess: () => {
      invalidateRelatedQueries();
      
      toast({
        title: 'Progress updated',
        description: 'The key result progress has been updated.',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error updating progress',
        description: error.message,
      });
    }
  });

  // Update key result
  const updateKeyResult = useMutation({
    mutationFn: (data: UpdateKeyResultInput) => updateKeyResultData(data),
    onSuccess: () => {
      invalidateRelatedQueries();
      
      toast({
        title: 'Key result updated',
        description: 'The key result has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error updating key result',
        description: error.message,
      });
    }
  });

  // Delete key result
  const deleteKeyResult = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error('Key Result ID is required');
      setIsDeleting(true);
      return deleteKeyResultData(id);
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['key-results'] });
      queryClient.invalidateQueries({ queryKey: ['objective'] });
      
      toast({
        title: 'Key result deleted',
        description: 'The key result has been deleted successfully.',
      });
      setIsDeleting(false);
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error deleting key result',
        description: error.message,
      });
      setIsDeleting(false);
    }
  });

  // Create key result
  const createKeyResult = useMutation({
    mutationFn: (data: CreateKeyResultInput) => createKeyResultData(data),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['key-results'] });
      queryClient.invalidateQueries({ queryKey: ['objective'] });
      
      toast({
        title: 'Key result created',
        description: 'The new key result has been created successfully.',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error creating key result',
        description: error.message,
      });
    }
  });

  return {
    updateStatus,
    updateProgress,
    updateKeyResult,
    deleteKeyResult,
    isDeleting,
    createKeyResult
  };
};

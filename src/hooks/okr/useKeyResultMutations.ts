
import { useState, useEffect } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { useCurrentUser } from '@/hooks/useCurrentUser';

/**
 * Hook providing mutations for key result operations
 */
export const useKeyResultMutations = (id?: string, objectiveId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);
  const { userId } = useCurrentUser();
  const [canCreate, setCanCreate] = useState(false);

  // Check if user can create key results
  useEffect(() => {
    const checkKeyResultPermission = async () => {
      if (!userId) return;
      
      console.log('useKeyResultMutations: Checking create permission for user:', userId);
      
      const { data, error } = await supabase.rpc('can_create_key_result', {
        p_user_id: userId
      });
      
      if (error) {
        console.error('Error checking key result permission:', error);
        return;
      }
      
      console.log('useKeyResultMutations: Permission check result:', data);
      setCanCreate(!!data);
    };
    
    if (userId) {
      checkKeyResultPermission();
    }
  }, [userId]);

  // Helper function to invalidate related queries
  const invalidateRelatedQueries = () => {
    // Invalidate the specific key result
    if (id) {
      queryClient.invalidateQueries({ queryKey: ['key-result', id] });
    }
    
    // Invalidate the key results list for this objective
    if (objectiveId) {
      queryClient.invalidateQueries({ queryKey: ['keyResults', objectiveId] });
    }
    
    // Invalidate all key results queries (broader invalidation)
    queryClient.invalidateQueries({ queryKey: ['keyResults'] });
    
    // Invalidate related objective data
    if (objectiveId) {
      queryClient.invalidateQueries({ queryKey: ['objective', objectiveId] });
      queryClient.invalidateQueries({ queryKey: ['objective-with-relations', objectiveId] });
    }
    
    // Invalidate the objectives list and related queries
    queryClient.invalidateQueries({ queryKey: ['objectives'] });
    
    // Invalidate any objective with relations query that might exist
    queryClient.invalidateQueries({ queryKey: ['objective-with-relations'] });
    
    console.log('Invalidated queries after key result update/creation/deletion:', { id, objectiveId });
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
      invalidateRelatedQueries();
      
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
    mutationFn: (data: CreateKeyResultInput) => {
      // Check if user has permission to create key results
      if (!canCreate) {
        throw new Error("You don't have permission to create key results");
      }
      
      console.log('Creating key result with permission check passed');
      return createKeyResultData(data);
    },
    onSuccess: () => {
      // Invalidate relevant queries
      invalidateRelatedQueries();
      
      toast({
        title: 'Key result created',
        description: 'The new key result has been created successfully.',
      });
    },
    onError: (error) => {
      console.error('Error creating key result:', error);
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
    createKeyResult,
    canCreate
  };
};

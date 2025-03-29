
import { useState } from 'react';
import { KeyResult } from '@/types/okr';
import { useToast } from '@/components/ui/use-toast';
import { useKeyResult } from './useKeyResult';

/**
 * Hook for displaying and managing key result details with proper progress calculations
 */
export const useKeyResultDetails = (initialKeyResult: KeyResult) => {
  const [keyResult, setKeyResult] = useState<KeyResult>(initialKeyResult);
  const { toast } = useToast();
  const { updateKeyResult, updateProgress } = useKeyResult(keyResult.id);

  // Track if progress update is in progress
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);

  /**
   * Handle updating the key result progress
   */
  const handleProgressUpdate = async (data: { currentValue?: number; booleanValue?: boolean }) => {
    setIsUpdatingProgress(true);
    
    try {
      await updateProgress.mutateAsync(data);
      
      // Update local state to reflect the changes
      if (data.currentValue !== undefined) {
        setKeyResult(prev => ({
          ...prev,
          currentValue: data.currentValue || 0
        }));
      }
      
      if (data.booleanValue !== undefined) {
        setKeyResult(prev => ({
          ...prev,
          booleanValue: data.booleanValue
        }));
      }
      
      toast({
        title: "Progress updated",
        description: "Key result progress has been successfully updated."
      });
    } catch (error) {
      console.error("Error updating key result progress:", error);
      toast({
        variant: "destructive",
        title: "Error updating progress",
        description: "There was an error updating the key result progress."
      });
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  /**
   * Calculate display percentage based on measurement type and current values
   */
  const getProgressPercentage = (): number => {
    if (keyResult.measurementType === 'boolean') {
      return keyResult.booleanValue ? 100 : 0;
    }
    
    if (keyResult.targetValue === keyResult.startValue) {
      return keyResult.currentValue >= keyResult.targetValue ? 100 : 0;
    }
    
    const progress = ((keyResult.currentValue - keyResult.startValue) / 
                     (keyResult.targetValue - keyResult.startValue)) * 100;
    
    return Math.min(Math.max(0, progress), 100);
  };

  return {
    keyResult,
    setKeyResult,
    handleProgressUpdate,
    isUpdatingProgress,
    getProgressPercentage
  };
};

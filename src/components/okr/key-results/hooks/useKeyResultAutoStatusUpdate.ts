
import { useEffect, useRef } from 'react';
import { KeyResult, KeyResultStatus } from '@/types/okr';
import { UseMutationResult } from '@tanstack/react-query';

/**
 * Custom hook to manage automatic status updates for key results
 * with debounce and state tracking to prevent excessive API calls
 */
export const useKeyResultAutoStatusUpdate = (
  keyResult: KeyResult,
  updateStatus: UseMutationResult<any, Error, KeyResultStatus, unknown>,
  updateProgress: UseMutationResult<any, Error, any, unknown>
) => {
  // Use a ref to track the last status to avoid unnecessary updates
  const lastStatusRef = useRef<KeyResultStatus>(keyResult.status);
  // Track if an update is already in progress
  const updatePendingRef = useRef(false);

  useEffect(() => {
    // Skip if an update is already in progress or if mutation is running
    if (updatePendingRef.current || updateStatus.isPending) {
      return;
    }

    // Current status is the same as the last processed status, skip processing
    if (lastStatusRef.current === keyResult.status) {
      // Only update status in these specific progress-status mismatch situations
      if (
        // Case 1: Progress is 100% but status is not completed
        (keyResult.progress === 100 && keyResult.status !== 'completed') ||
        // Case 2: Progress is > 0 but status is still not_started
        (keyResult.progress > 0 && keyResult.status === 'not_started') ||
        // Case 3: Progress dropped below 100% but status is still completed
        (keyResult.progress < 100 && keyResult.status === 'completed')
      ) {
        // Determine the appropriate status
        let newStatus: KeyResultStatus;
        
        if (keyResult.progress === 100) {
          newStatus = 'completed';
        } else if (keyResult.progress > 0) {
          newStatus = 'in_progress';
        } else {
          newStatus = 'not_started';
        }
        
        // Only update if the status needs to change
        if (newStatus !== keyResult.status) {
          console.log(`Auto-updating key result status to ${newStatus} due to progress mismatch`, {
            id: keyResult.id,
            currentProgress: keyResult.progress,
            oldStatus: keyResult.status,
            newStatus
          });
          
          updatePendingRef.current = true;
          updateStatus.mutate(newStatus, {
            onSettled: () => {
              // Update the last status reference
              lastStatusRef.current = newStatus;
              updatePendingRef.current = false;
            }
          });
        }
      }
    } else {
      // Update our reference when the status changes from an external source
      lastStatusRef.current = keyResult.status;
    }
  }, [keyResult.progress, keyResult.status, updateStatus]);
};

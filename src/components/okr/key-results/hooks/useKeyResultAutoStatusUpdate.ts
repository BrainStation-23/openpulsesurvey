
import { useEffect } from 'react';
import { KeyResult, KeyResultStatus } from '@/types/okr';
import { UseMutationResult } from '@tanstack/react-query';

export const useKeyResultAutoStatusUpdate = (
  keyResult: KeyResult,
  updateStatus: UseMutationResult<any, Error, KeyResultStatus, unknown>,
  updateProgress: UseMutationResult<any, Error, any, unknown>
) => {
  useEffect(() => {
    // Auto-update to completed when progress is 100%
    if (keyResult.progress === 100 && keyResult.status !== 'completed') {
      console.log('Auto-updating key result status to completed due to 100% progress');
      updateStatus.mutate('completed');
    } 
    // Auto-update to in_progress when progress > 0 but not yet started
    else if (keyResult.progress > 0 && keyResult.status === 'not_started') {
      console.log('Auto-updating key result status to in_progress due to progress > 0');
      updateStatus.mutate('in_progress');
    }
    // Auto-update from completed to in_progress when progress drops below 100%
    else if (keyResult.progress < 100 && keyResult.status === 'completed') {
      console.log('Auto-updating key result status from completed to in_progress due to progress < 100%');
      updateStatus.mutate('in_progress');
    }
  }, [keyResult.progress, keyResult.status, updateStatus]);
};

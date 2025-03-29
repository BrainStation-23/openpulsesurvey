
import { useEffect, useState } from 'react';
import { Objective, ObjectiveStatus } from '@/types/okr';

interface UseObjectiveStatusUpdatesProps {
  objective: Objective | null;
  canEdit: boolean;
  updateStatus: (status: { status: ObjectiveStatus }) => void;
}

/**
 * Hook to handle automatic status updates for objectives
 * based on progress and other criteria
 */
export const useObjectiveStatusUpdates = ({
  objective,
  canEdit,
  updateStatus
}: UseObjectiveStatusUpdatesProps) => {
  // Lock to prevent duplicate status update calls
  const [isUpdating, setIsUpdating] = useState(false);
  
  useEffect(() => {
    // Don't proceed if we're already updating, missing data or don't have permission
    if (isUpdating || !objective || !canEdit) return;
    
    // Auto-complete objectives at 100% progress
    if (objective.progress === 100 && objective.status !== 'completed') {
      console.log('Automatically marking objective as completed (progress is 100%)');
      setIsUpdating(true);
      updateStatus({ status: 'completed' });
      return;
    }
    
    // Auto change from draft to in_progress when progress > 0
    // and not already at_risk or on_track
    if (
      objective.status === 'draft' && 
      objective.progress > 0 && 
      !['at_risk', 'on_track'].includes(objective.status)
    ) {
      console.log('Automatically changing objective from draft to in_progress (progress > 0)');
      setIsUpdating(true);
      updateStatus({ status: 'in_progress' });
    }
  }, [objective, canEdit, updateStatus, isUpdating]);
  
  // Reset the lock when the objective status or progress changes
  useEffect(() => {
    if (objective && isUpdating) {
      setIsUpdating(false);
    }
  }, [objective?.status, objective?.progress]);
  
  // Return whether the status can be changed from UI
  const canChangeStatus = objective && objective.progress < 100;
  
  // Helper to determine if a status change is allowed
  const isStatusChangeAllowed = (status: ObjectiveStatus): boolean => {
    if (!canChangeStatus) return false;
    
    // Only allow changing to draft, at_risk, or on_track from UI
    return ['draft', 'at_risk', 'on_track'].includes(status);
  };
  
  // Safe status update handler - adds locking mechanism
  const handleStatusUpdate = (status: ObjectiveStatus): void => {
    if (!objective || !canEdit || !canChangeStatus || isUpdating) return;
    
    if (isStatusChangeAllowed(status)) {
      setIsUpdating(true);
      updateStatus({ status });
    }
  };
  
  return {
    canChangeStatus,
    isStatusChangeAllowed,
    handleStatusUpdate,
    isUpdating
  };
};

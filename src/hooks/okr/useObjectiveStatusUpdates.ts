
import { useState } from 'react';
import { ObjectiveStatus, Objective } from '@/types/okr';
import { toast } from '@/hooks/use-toast';

interface UseObjectiveStatusUpdatesProps {
  objective?: Objective;
  canEdit: boolean;
  updateStatus: (status: { status: ObjectiveStatus }) => void;
}

export const useObjectiveStatusUpdates = ({
  objective,
  canEdit,
  updateStatus
}: UseObjectiveStatusUpdatesProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Check if we can change status based on progress/completed state
  const canChangeStatus = canEdit && objective && objective.status !== 'completed';
  
  const handleStatusUpdate = async (status: ObjectiveStatus) => {
    if (!canChangeStatus) {
      toast({
        variant: 'destructive',
        title: 'Cannot update status',
        description: 'This objective cannot have its status changed.'
      });
      return;
    }
    
    // Prevent changing from completed if progress is 100%
    if (objective && objective.progress >= 99.99 && status !== 'completed') {
      toast({
        variant: 'destructive',
        title: 'Cannot change status',
        description: 'Objectives at 100% progress must remain completed.'
      });
      return;
    }
    
    setIsUpdating(true);
    
    try {
      updateStatus({ status });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error updating status',
        description: error.message || 'An error occurred while updating the objective status.'
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  return {
    canChangeStatus,
    handleStatusUpdate,
    isUpdating
  };
};

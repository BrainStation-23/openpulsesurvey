import React from 'react';
import { KeyResult } from '@/types/okr';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useKeyResult } from '@/hooks/okr/useKeyResult';
import { KeyResultStatusBadge } from './KeyResultStatusBadge';
import { KeyResultProgressControls } from './KeyResultProgressControls';
import { KeyResultStatusControls } from './KeyResultStatusControls';
import { KeyResultDialogs } from './KeyResultDialogs';
import { getProgressBarColor } from './utils/progressBarUtils';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { KeyResultHeader } from './components/KeyResultHeader';
import { KeyResultDescription } from './components/KeyResultDescription';
import { KeyResultProgressDisplay } from './components/KeyResultProgressDisplay';
import { useKeyResultAutoStatusUpdate } from './hooks/useKeyResultAutoStatusUpdate';

interface KeyResultItemProps {
  keyResult: KeyResult;
  onDelete?: () => void;
}

export const KeyResultItem: React.FC<KeyResultItemProps> = ({ keyResult, onDelete }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { userId, isAdmin } = useCurrentUser();
  const isOwner = userId === keyResult.ownerId;
  const canEdit = isOwner || isAdmin;
  
  const {
    updateStatus,
    updateProgress,
    deleteKeyResult,
    isDeleting
  } = useKeyResult(keyResult.id);

  useKeyResultAutoStatusUpdate(keyResult, updateStatus, updateProgress);

  const handleStatusUpdate = (status) => {
    if (!canEdit) return;
    
    if (status === 'completed' && keyResult.measurementType !== 'boolean') {
      console.log('Marking key result as completed and setting current value to target', {
        id: keyResult.id,
        currentValue: keyResult.targetValue
      });
      
      updateProgress.mutate({ currentValue: keyResult.targetValue }, {
        onSuccess: () => {
          updateStatus.mutate(status);
        }
      });
    } else {
      console.log('Updating key result status:', { id: keyResult.id, status });
      updateStatus.mutate(status);
    }
  };

  const handleProgressUpdate = (progressValue) => {
    if (keyResult.measurementType === 'boolean' || !canEdit) {
      return;
    }

    if (progressValue !== keyResult.currentValue) {
      console.log('Updating key result progress:', { 
        id: keyResult.id, 
        objectiveId: keyResult.objectiveId,
        oldValue: keyResult.currentValue, 
        newValue: progressValue 
      });
      updateProgress.mutate({ currentValue: progressValue });
    }
  };

  const handleBooleanChange = (checked) => {
    if (!canEdit) return;
    
    console.log('Updating boolean key result:', { 
      id: keyResult.id, 
      objectiveId: keyResult.objectiveId,
      oldValue: keyResult.booleanValue, 
      newValue: checked 
    });
    
    updateProgress.mutate({ booleanValue: checked }, {
      onSuccess: () => {
        if (checked && keyResult.status !== 'completed') {
          updateStatus.mutate('completed');
        }
      }
    });
  };

  const handleDelete = () => {
    if (!canEdit) return;
    
    deleteKeyResult.mutate(undefined, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        if (onDelete) {
          onDelete();
        }
      }
    });
  };

  return (
    <Card className="mb-4">
      <KeyResultHeader 
        keyResult={keyResult}
        canEdit={canEdit}
        onEditClick={() => setIsEditDialogOpen(true)}
        onDeleteClick={() => setIsDeleteDialogOpen(true)}
      />
      
      <CardContent className="pb-4">
        <KeyResultDescription description={keyResult.description} />
        
        <KeyResultProgressDisplay keyResult={keyResult} />

        <KeyResultProgressControls 
          keyResult={keyResult}
          onProgressUpdate={handleProgressUpdate}
          onBooleanChange={handleBooleanChange}
          isPending={updateProgress.isPending}
          isDisabled={!canEdit}
        />

        {canEdit && (
          <KeyResultStatusControls 
            status={keyResult.status}
            progress={keyResult.progress}
            onStatusUpdate={handleStatusUpdate}
          />
        )}
      </CardContent>
      
      <CardFooter className="pt-0 pb-3 px-6">
        <div className="w-full">
          <Progress 
            value={keyResult.progress} 
            className="h-4 rounded-md" 
            indicatorClassName={getProgressBarColor(keyResult.progress, keyResult.status)}
          />
        </div>
      </CardFooter>

      {canEdit && (
        <KeyResultDialogs 
          keyResult={keyResult}
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          isEditDialogOpen={isEditDialogOpen}
          setIsEditDialogOpen={setIsEditDialogOpen}
          onDelete={handleDelete}
          isDeleting={isDeleting}
        />
      )}
    </Card>
  );
};

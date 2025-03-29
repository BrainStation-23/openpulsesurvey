
import React, { useState } from 'react';
import { KeyResult } from '@/types/okr';
import { Card } from '@/components/ui/card';
import { useKeyResult } from '@/hooks/okr/useKeyResult';
import { KeyResultHeader } from './components/KeyResultHeader';
import { KeyResultDescription } from './components/KeyResultDescription';
import { KeyResultProgressDisplay } from './components/KeyResultProgressDisplay';
import { KeyResultProgressControls } from './KeyResultProgressControls';
import { KeyResultStatusControls } from './KeyResultStatusControls';
import { KeyResultDialogs } from './KeyResultDialogs';

interface KeyResultItemProps {
  keyResult: KeyResult;
  canEdit: boolean;
  onEditClick: () => void;
}

export const KeyResultItem: React.FC<KeyResultItemProps> = ({ keyResult, canEdit, onEditClick }) => {
  const { deleteKeyResult, updateProgress, updateStatus } = useKeyResult(keyResult.id);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const handleDelete = () => {
    deleteKeyResult.mutate(undefined, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
      }
    });
  };

  const handleProgressUpdate = (value: number) => {
    updateProgress.mutate({ currentValue: value });
  };

  const handleBooleanChange = (checked: boolean) => {
    updateProgress.mutate({ booleanValue: checked });
  };

  const handleStatusUpdate = (status: KeyResult['status']) => {
    updateStatus.mutate(status);
  };

  return (
    <>
      <Card className="overflow-hidden">
        <KeyResultHeader
          keyResult={keyResult}
          canEdit={canEdit}
          onEditClick={onEditClick}
          onDeleteClick={() => setIsDeleteDialogOpen(true)}
        />
        
        <KeyResultDescription description={keyResult.description} />
        
        <KeyResultProgressDisplay keyResult={keyResult} />
        
        {canEdit && (
          <div className="p-4 pt-0 space-y-4">
            <KeyResultProgressControls 
              keyResult={keyResult} 
              onProgressUpdate={handleProgressUpdate}
              onBooleanChange={handleBooleanChange}
              isPending={updateProgress.isPending}
            />
            <KeyResultStatusControls 
              status={keyResult.status}
              progress={keyResult.progress}
              onStatusUpdate={handleStatusUpdate}
            />
          </div>
        )}
      </Card>

      <KeyResultDialogs
        keyResult={keyResult}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        onDelete={handleDelete}
        isDeleting={deleteKeyResult.isPending}
      />
    </>
  );
};

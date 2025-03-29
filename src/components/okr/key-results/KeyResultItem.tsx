
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
  const { deleteKeyResult } = useKeyResult(keyResult.id);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const handleDelete = () => {
    deleteKeyResult.mutate(undefined, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
      }
    });
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
            <KeyResultProgressControls keyResult={keyResult} />
            <KeyResultStatusControls keyResult={keyResult} />
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

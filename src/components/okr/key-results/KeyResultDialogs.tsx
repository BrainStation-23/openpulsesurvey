
import React from 'react';
import { KeyResult, UpdateKeyResultInput } from '@/types/okr';
import { KeyResultCheckInDialog } from './KeyResultCheckInDialog';
import { KeyResultEditDialog } from './KeyResultEditDialog';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';

interface KeyResultDialogsProps {
  selectedKeyResult: KeyResult | null;
  isCheckInDialogOpen: boolean;
  setIsCheckInDialogOpen: (isOpen: boolean) => void;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (isOpen: boolean) => void;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (isOpen: boolean) => void;
  onSaveCheckIn: (data: UpdateKeyResultInput, id: string) => void;
  onSaveEdit: (data: UpdateKeyResultInput, id: string) => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export const KeyResultDialogs = ({
  selectedKeyResult,
  isCheckInDialogOpen,
  setIsCheckInDialogOpen,
  isEditDialogOpen,
  setIsEditDialogOpen,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  onSaveCheckIn,
  onSaveEdit,
  onDelete,
  isDeleting
}: KeyResultDialogsProps) => {
  if (!selectedKeyResult) return null;
  
  return (
    <>
      <KeyResultCheckInDialog 
        keyResult={selectedKeyResult}
        open={isCheckInDialogOpen}
        onOpenChange={setIsCheckInDialogOpen}
        onSave={onSaveCheckIn}
      />
      
      <KeyResultEditDialog 
        keyResult={selectedKeyResult}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={onSaveEdit}
      />

      <DeleteConfirmationDialog
        keyResult={selectedKeyResult}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={onDelete}
        isDeleting={isDeleting}
      />
    </>
  );
};

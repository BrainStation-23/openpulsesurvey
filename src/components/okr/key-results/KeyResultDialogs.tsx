
import React from 'react';
import { KeyResult } from '@/types/okr';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { KeyResultForm } from './KeyResultForm';

interface KeyResultDialogsProps {
  keyResult: KeyResult;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export const KeyResultDialogs: React.FC<KeyResultDialogsProps> = ({
  keyResult,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  isEditDialogOpen,
  setIsEditDialogOpen,
  onDelete,
  isDeleting
}) => {
  return (
    <>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this key result?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this key result
              and may affect the objective's progress.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={onDelete} 
              className="bg-destructive text-destructive-foreground"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Key Result</DialogTitle>
          </DialogHeader>
          <KeyResultForm
            keyResult={keyResult}
            objectiveId={keyResult.objectiveId}
            onClose={() => setIsEditDialogOpen(false)}
            mode="edit"
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

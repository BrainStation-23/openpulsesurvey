
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

interface KeyResultDialogsProps {
  keyResult: KeyResult;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export const KeyResultDialogs: React.FC<KeyResultDialogsProps> = ({
  keyResult,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  onDelete,
  isDeleting
}) => {
  return (
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
  );
};


import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PermissionForm } from './PermissionForm';
import { PermissionFormValues } from '@/hooks/okr/useObjectivePermissions';

interface PermissionDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: PermissionFormValues) => void;
  initialValues?: PermissionFormValues;
  isSubmitting?: boolean;
  title?: string;
}

export const PermissionDialog = ({
  open,
  onClose,
  onSubmit,
  initialValues,
  isSubmitting = false,
  title = 'Edit Permission'
}: PermissionDialogProps) => {
  const handleSubmit = (values: PermissionFormValues) => {
    onSubmit(values);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <PermissionForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

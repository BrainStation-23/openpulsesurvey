
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AlignmentForm, AlignmentFormValues } from './create-alignment/AlignmentForm';
import { useObjectiveData } from './hooks/useObjectiveData';
import { useAlignments } from '@/hooks/okr/useAlignments';
import { useToast } from '@/hooks/use-toast';

interface CreateAlignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceObjectiveId: string;
  onSuccess?: () => void; // Add success callback
}

export const CreateAlignmentDialog: React.FC<CreateAlignmentDialogProps> = ({
  open,
  onOpenChange,
  sourceObjectiveId,
  onSuccess
}) => {
  const { toast } = useToast();
  const { createAlignment } = useAlignments(sourceObjectiveId);

  const {
    sourceObjective,
    isLoading,
    error
  } = useObjectiveData(sourceObjectiveId);

  const handleCreateAlignment = async (alignmentData: AlignmentFormValues) => {
    try {
      await createAlignment.mutateAsync({
        sourceObjectiveId,
        alignedObjectiveId: alignmentData.alignedObjectiveId,
        alignmentType: 'parent_child',
        weight: alignmentData.weight
      });

      toast({
        title: 'Alignment created',
        description: 'The objective alignment has been created successfully.',
      });

      // Close dialog and call success callback
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error creating alignment',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Objective Alignment</DialogTitle>
          <DialogDescription>
            Link this objective to another one to show their relationships and dependencies.
          </DialogDescription>
        </DialogHeader>

        <AlignmentForm
          sourceObjectiveId={sourceObjectiveId}
          onSubmit={handleCreateAlignment}
          isSubmitting={createAlignment.isPending}
          onCancel={() => onOpenChange(false)}
          sourceObjective={sourceObjective}
        />
      </DialogContent>
    </Dialog>
  );
};

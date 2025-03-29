
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EditObjectiveForm } from './EditObjectiveForm';
import { Objective, UpdateObjectiveInput } from '@/types/okr';
import { useObjective } from '@/hooks/okr/useObjective';
import { useToast } from '@/hooks/use-toast';

interface EditObjectiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  objective: Objective;
}

export const EditObjectiveDialog: React.FC<EditObjectiveDialogProps> = ({
  open,
  onOpenChange,
  objective
}) => {
  const { toast } = useToast();
  const { updateObjective } = useObjective(objective.id);

  const handleEditObjective = async (data: UpdateObjectiveInput) => {
    updateObjective.mutate(data, {
      onSuccess: () => {
        onOpenChange(false);
        toast({
          title: "Objective updated",
          description: "The objective has been successfully updated.",
        });
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Error updating objective",
          description: error.message || "Failed to update objective. Please try again.",
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Edit Objective</DialogTitle>
        </DialogHeader>
        <EditObjectiveForm
          objective={objective}
          onSubmit={handleEditObjective}
          isSubmitting={updateObjective.isPending}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

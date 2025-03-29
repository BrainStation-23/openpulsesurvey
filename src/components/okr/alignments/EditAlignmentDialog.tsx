
import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ObjectiveAlignment, CreateAlignmentInput } from '@/types/okr';
import { useAlignments } from '@/hooks/okr/useAlignments';
import { AlignmentForm, AlignmentFormValues, alignmentFormSchema } from './create-alignment/AlignmentForm';
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";

interface EditAlignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alignment: ObjectiveAlignment | null;
  onSuccess?: () => void;
}

export const EditAlignmentDialog: React.FC<EditAlignmentDialogProps> = ({
  open,
  onOpenChange,
  alignment,
  onSuccess
}) => {
  const { toast } = useToast();
  const sourceObjectiveId = alignment?.sourceObjectiveId || '';
  const { updateAlignment } = useAlignments(sourceObjectiveId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<AlignmentFormValues>({
    resolver: zodResolver(alignmentFormSchema),
    defaultValues: {
      weight: alignment?.weight || 1,
    },
  });
  
  // Reset form when alignment changes
  React.useEffect(() => {
    if (alignment) {
      form.reset({
        weight: alignment.weight,
      });
    }
  }, [alignment, form]);

  const onSubmit = async (values: z.infer<typeof alignmentFormSchema>) => {
    if (!alignment) return;
    
    setIsSubmitting(true);
    
    try {
      const updatedData = {
        id: alignment.id,
        weight: values.weight,
      };
      
      await updateAlignment.mutateAsync(updatedData);
      
      form.reset();
      onOpenChange(false);
      toast({
        title: "Alignment updated",
        description: "The alignment weight has been updated successfully."
      });
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error updating alignment:', error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error instanceof Error ? error.message : "An unknown error occurred"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  // Calculate the objective that should be displayed in the form
  const selectedObjective = alignment?.sourceObjectiveId === sourceObjectiveId 
    ? alignment?.alignedObjective 
    : alignment?.sourceObjective;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Edit Alignment</DialogTitle>
          <DialogDescription>
            Update the weight of this alignment relationship.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mb-4">
          <div className="text-sm font-medium text-muted-foreground mb-2">Connected Objective:</div>
          <div className="p-3 border rounded-md bg-muted/30">
            {selectedObjective?.title || 'Loading...'}
          </div>
        </div>
        
        <AlignmentForm
          form={form}
          onSubmit={form.handleSubmit(onSubmit)}
          isSubmitting={isSubmitting}
          onCancel={handleCancel}
          selectedObjective={selectedObjective || null}
          isEditMode={true}
        />
      </DialogContent>
    </Dialog>
  );
};

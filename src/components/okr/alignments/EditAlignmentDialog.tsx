
import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ObjectiveAlignment } from '@/types/okr';
import { useAlignments } from '@/hooks/okr/useAlignments';
import { AlignmentForm, AlignmentFormValues, alignmentFormSchema } from './create-alignment/AlignmentForm';
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from '@/hooks/use-toast';

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
  const { updateAlignment } = useAlignments(alignment?.sourceObjectiveId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<AlignmentFormValues>({
    resolver: zodResolver(alignmentFormSchema),
    defaultValues: {
      alignedObjectiveId: alignment?.alignedObjectiveId || '',
      weight: alignment?.weight || 1,
    },
    values: {
      alignedObjectiveId: alignment?.alignedObjectiveId || '',
      weight: alignment?.weight || 1,
    }
  });
  
  // Reset form when alignment changes
  React.useEffect(() => {
    if (alignment) {
      form.reset({
        alignedObjectiveId: alignment.alignedObjectiveId || '',
        weight: alignment.weight || 1,
      });
    }
  }, [alignment, form]);

  const onSubmit = async (values: AlignmentFormValues) => {
    if (!alignment?.id) return;
    
    setIsSubmitting(true);
    
    try {
      await updateAlignment.mutateAsync({
        id: alignment.id,
        weight: values.weight,
      });
      
      toast({
        title: 'Alignment updated',
        description: 'The objective alignment has been updated successfully.',
      });
      
      form.reset();
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error updating alignment',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
      console.error('Error updating alignment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Edit Alignment</DialogTitle>
          <DialogDescription>
            Update the weight of this objective alignment.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <h3 className="font-medium mb-2">Alignment details</h3>
          <div className="bg-muted/50 p-3 rounded-md mb-4">
            <p className="text-sm mb-1"><span className="font-medium">Source:</span> {alignment?.sourceObjective?.title}</p>
            <p className="text-sm mb-1"><span className="font-medium">Aligned to:</span> {alignment?.alignedObjective?.title}</p>
            <p className="text-sm"><span className="font-medium">Type:</span> {alignment?.alignmentType.replace('_', ' ')}</p>
          </div>
        </div>
        
        <AlignmentForm
          form={form}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          onCancel={handleCancel}
          selectedObjective={alignment?.alignedObjective || null}
        />
      </DialogContent>
    </Dialog>
  );
};


import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Objective, AlignmentType, CreateAlignmentInput } from '@/types/okr';
import { useObjectives } from '@/hooks/okr/useObjectives';
import { useAlignments } from '@/hooks/okr/useAlignments';

const alignmentFormSchema = z.object({
  alignedObjectiveId: z.string().min(1, "Please select an objective"),
  alignmentType: z.enum(['parent_child', 'supporting', 'related']),
  weight: z.number().min(1).max(10).default(1),
});

interface CreateAlignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceObjectiveId: string;
  onSuccess?: () => void;
}

export const CreateAlignmentDialog: React.FC<CreateAlignmentDialogProps> = ({
  open,
  onOpenChange,
  sourceObjectiveId,
  onSuccess
}) => {
  const { objectives, isLoading } = useObjectives();
  const { createAlignment } = useAlignments(sourceObjectiveId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof alignmentFormSchema>>({
    resolver: zodResolver(alignmentFormSchema),
    defaultValues: {
      alignmentType: 'supporting',
      weight: 1,
    },
  });
  
  // Filter out the current objective from the list
  const availableObjectives = (objectives || []).filter(obj => 
    obj.id !== sourceObjectiveId
  );

  const onSubmit = async (values: z.infer<typeof alignmentFormSchema>) => {
    if (!sourceObjectiveId) return;
    
    setIsSubmitting(true);
    
    try {
      const alignmentData: CreateAlignmentInput = {
        sourceObjectiveId,
        alignedObjectiveId: values.alignedObjectiveId,
        alignmentType: values.alignmentType as AlignmentType,
        weight: values.weight,
      };
      
      await createAlignment.mutateAsync(alignmentData);
      
      form.reset();
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error creating alignment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Alignment</DialogTitle>
          <DialogDescription>
            Connect this objective with another one to establish alignment.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="alignedObjectiveId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Objective to Align With</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading || isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an objective" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableObjectives.map((objective) => (
                          <SelectItem key={objective.id} value={objective.id}>
                            {objective.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="alignmentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alignment Type</FormLabel>
                  <FormControl>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select alignment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="parent_child">Parent/Child</SelectItem>
                        <SelectItem value="supporting">Supporting</SelectItem>
                        <SelectItem value="related">Related</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight</FormLabel>
                  <FormControl>
                    <Select 
                      onValueChange={(val) => field.onChange(parseInt(val))} 
                      defaultValue={field.value.toString()}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select weight" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((weight) => (
                          <SelectItem key={weight} value={weight.toString()}>
                            {weight}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting ? "Creating..." : "Create Alignment"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};


import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Objective, CreateAlignmentInput } from '@/types/okr';

// Schema for alignment form validation
export const alignmentFormSchema = z.object({
  alignmentType: z.enum(['parent_child']),
  weight: z.number().min(0, { message: "Weight must be a non-negative number" }).default(1),
});

export type AlignmentFormValues = z.infer<typeof alignmentFormSchema>;

interface AlignmentFormProps {
  onSubmit: (values: AlignmentFormValues) => void;
  isSubmitting: boolean;
  onCancel: () => void;
  selectedObjective: Objective | null;
}

export const AlignmentForm = ({ 
  onSubmit, 
  isSubmitting, 
  onCancel, 
  selectedObjective 
}: AlignmentFormProps) => {
  const form = useForm<AlignmentFormValues>({
    resolver: zodResolver(alignmentFormSchema),
    defaultValues: {
      alignmentType: 'parent_child',
      weight: 1,
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormField
        control={form.control}
        name="weight"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Weight</FormLabel>
            <FormControl>
              <Input 
                type="number"
                step="any"
                min="0"
                disabled={isSubmitting}
                placeholder="Enter weight value"
                {...field}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  field.onChange(isNaN(value) ? 1 : value);
                }}
              />
            </FormControl>
            <FormDescription>
              Enter a non-negative value to represent the alignment weight
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <DialogFooter>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || !selectedObjective}
        >
          {isSubmitting ? "Creating..." : "Create Alignment"}
        </Button>
      </DialogFooter>
    </form>
  );
};

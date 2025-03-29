
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage, Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { Objective } from '@/types/okr';

// Schema for alignment form validation
export const alignmentFormSchema = z.object({
  alignmentType: z.enum(['parent_child']),
  weight: z.number().min(0.000001, { message: "Weight must be greater than 0" }).default(1),
});

export type AlignmentFormValues = z.infer<typeof alignmentFormSchema>;

interface AlignmentFormProps {
  form: UseFormReturn<AlignmentFormValues>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
  selectedObjective: Objective | null;
}

export const AlignmentForm = ({ 
  form,
  onSubmit, 
  isSubmitting, 
  onCancel, 
  selectedObjective 
}: AlignmentFormProps) => {
  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
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
                  min="0.000001"
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
                Enter a value between 0 and 1 to represent the contribution percentage to parent progress.
                For example, 0.05 means this objective contributes 5% to the parent's overall progress.
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
    </Form>
  );
};


import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage, Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { Objective } from '@/types/okr';
import { Slider } from "@/components/ui/slider";

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
  // Convert the weight value for display purposes
  const displayPercentage = (value: number) => `${(value * 100).toFixed(2)}%`;
  
  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="weight"
          render={({ field }) => (
            <FormItem className="space-y-6">
              <FormLabel>Weight ({displayPercentage(field.value)})</FormLabel>
              <div className="flex flex-col space-y-4">
                <FormControl>
                  <div className="flex items-center space-x-4">
                    <Slider 
                      defaultValue={[field.value * 100]} 
                      min={0.01} 
                      max={100} 
                      step={0.01}
                      disabled={isSubmitting}
                      onValueChange={(values) => {
                        // Convert percentage back to decimal for the form
                        field.onChange(values[0] / 100);
                      }}
                      className="flex-grow"
                    />
                  </div>
                </FormControl>

                <FormControl>
                  <Input 
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="100"
                    disabled={isSubmitting}
                    placeholder="Enter weight percentage"
                    value={(field.value * 100).toFixed(2)}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      // Convert percentage to decimal for the form
                      field.onChange(isNaN(value) ? 1 : value / 100);
                    }}
                    className="w-full"
                  />
                </FormControl>
              </div>
              <FormDescription>
                Enter a value between 0.01% and 100% to represent the contribution percentage to parent progress.
                For example, 5% means this objective contributes 5% to the parent's overall progress.
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

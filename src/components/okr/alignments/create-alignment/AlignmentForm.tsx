
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage, Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { Objective } from '@/types/okr';
import { Slider } from "@/components/ui/slider";
import { Card } from '@/components/ui/card';

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
  relationDirection: 'parent' | 'child';
}

export const AlignmentForm = ({ 
  form,
  onSubmit, 
  isSubmitting, 
  onCancel, 
  selectedObjective,
  relationDirection
}: AlignmentFormProps) => {
  // Convert the weight value for display purposes
  const displayPercentage = (value: number) => `${(value * 100).toFixed(2)}%`;
  
  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <h3 className="text-sm font-medium">Alignment Weight</h3>
        
        {selectedObjective ? (
          <Card className="p-3 bg-muted/50">
            <p className="text-sm">
              {relationDirection === 'parent' ? (
                <>This determines how much <strong className="font-semibold">your objective</strong> contributes to the progress of <strong className="font-semibold">{selectedObjective.title}</strong></>
              ) : (
                <>This determines how much <strong className="font-semibold">{selectedObjective.title}</strong> contributes to the progress of <strong className="font-semibold">your objective</strong></>
              )}
            </p>
          </Card>
        ) : (
          <div className="text-sm text-muted-foreground italic">
            Select an objective to create an alignment.
          </div>
        )}
        
        <FormField
          control={form.control}
          name="weight"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Weight ({displayPercentage(field.value)})</FormLabel>
              <div className="space-y-3">
                <FormControl>
                  <Slider 
                    defaultValue={[field.value * 100]} 
                    min={0.01} 
                    max={100} 
                    step={0.01}
                    disabled={isSubmitting || !selectedObjective}
                    onValueChange={(values) => {
                      // Convert percentage back to decimal for the form
                      field.onChange(values[0] / 100);
                    }}
                  />
                </FormControl>

                <FormControl>
                  <Input 
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="100"
                    disabled={isSubmitting || !selectedObjective}
                    placeholder="Enter weight percentage"
                    value={(field.value * 100).toFixed(2)}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      // Convert percentage to decimal for the form
                      field.onChange(isNaN(value) ? 1 : value / 100);
                    }}
                  />
                </FormControl>
              </div>
              <FormDescription>
                Enter a value between 0.01% and 100% to represent the contribution percentage.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2 pt-4">
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
        </div>
      </form>
    </Form>
  );
};

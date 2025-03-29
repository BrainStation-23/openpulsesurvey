
import React, { useState } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage, Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from "zod";
import { Objective, ObjectiveWithRelations } from '@/types/okr';
import { ObjectiveSelection } from './ObjectiveSelection';

// Schema for alignment form validation
export const alignmentFormSchema = z.object({
  alignedObjectiveId: z.string().min(1, { message: "Please select an objective" }),
  weight: z.number().min(0.000001, { message: "Weight must be greater than 0" }).default(1),
});

export type AlignmentFormValues = z.infer<typeof alignmentFormSchema>;

interface AlignmentFormProps {
  sourceObjectiveId?: string;
  onSubmit: (data: AlignmentFormValues) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
  sourceObjective?: ObjectiveWithRelations | null;
  form?: any; // For controlled form in edit mode
  selectedObjective?: Objective | null;
}

export const AlignmentForm = ({ 
  sourceObjectiveId, 
  onSubmit, 
  isSubmitting, 
  onCancel,
  sourceObjective,
  form: externalForm,
  selectedObjective: initialSelectedObjective
}: AlignmentFormProps) => {
  const [selectedObjective, setSelectedObjective] = useState<Objective | null>(initialSelectedObjective || null);
  
  const form = externalForm || useForm<AlignmentFormValues>({
    resolver: zodResolver(alignmentFormSchema),
    defaultValues: {
      alignedObjectiveId: initialSelectedObjective?.id || '',
      weight: 1,
    }
  });

  const handleObjectiveSelect = (objective: Objective | null) => {
    setSelectedObjective(objective);
    if (objective) {
      form.setValue('alignedObjectiveId', objective.id);
    } else {
      form.setValue('alignedObjectiveId', '');
    }
  };

  const handleSubmitForm = async (data: AlignmentFormValues) => {
    await onSubmit(data);
  };

  // For edit mode, we don't need to show the objective selection section
  const showObjectiveSelection = sourceObjectiveId && !initialSelectedObjective;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmitForm)} className="space-y-4">
        {showObjectiveSelection && (
          <div className="mb-4">
            <ObjectiveSelection
              relationDirection="parent"
              toggleRelationDirection={() => {}}
              selectedObjective={selectedObjective}
              setSelectedObjective={handleObjectiveSelect}
              sourceObjectiveId={sourceObjectiveId || ''}
            />
          </div>
        )}
        
        <FormField
          control={form.control}
          name="alignedObjectiveId"
          render={({ field }) => (
            <FormItem className="hidden">
              <FormControl>
                <Input type="hidden" {...field} />
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
                Enter a positive value to represent the alignment weight
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
            disabled={isSubmitting || (!initialSelectedObjective && !selectedObjective)}
          >
            {isSubmitting ? "Creating..." : initialSelectedObjective ? "Update Alignment" : "Create Alignment"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

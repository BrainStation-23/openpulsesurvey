
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
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Objective, AlignmentType, CreateAlignmentInput } from '@/types/okr';
import { useAlignments } from '@/hooks/okr/useAlignments';
import { ObjectiveSearchInput } from './ObjectiveSearchInput';

const alignmentFormSchema = z.object({
  alignmentType: z.enum(['parent_child']),
  weight: z.number().min(0).default(1),
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
  const { createAlignment } = useAlignments(sourceObjectiveId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState<Objective | null>(null);
  const [relationDirection, setRelationDirection] = useState<'parent' | 'child'>('parent');
  
  const form = useForm<z.infer<typeof alignmentFormSchema>>({
    resolver: zodResolver(alignmentFormSchema),
    defaultValues: {
      alignmentType: 'parent_child',
      weight: 1,
    },
  });
  
  const handleSelectObjective = (objective: Objective) => {
    setSelectedObjective(objective);
  };

  const toggleRelationDirection = () => {
    setRelationDirection(prev => prev === 'parent' ? 'child' : 'parent');
  };

  const onSubmit = async (values: z.infer<typeof alignmentFormSchema>) => {
    if (!sourceObjectiveId || !selectedObjective) return;
    
    setIsSubmitting(true);
    
    try {
      let alignmentData: CreateAlignmentInput;
      
      if (relationDirection === 'parent') {
        // Current objective will be the child, selected objective will be the parent
        alignmentData = {
          sourceObjectiveId: selectedObjective.id,
          alignedObjectiveId: sourceObjectiveId,
          alignmentType: 'parent_child',
          weight: values.weight,
        };
      } else {
        // Current objective will be the parent, selected objective will be the child
        alignmentData = {
          sourceObjectiveId: sourceObjectiveId,
          alignedObjectiveId: selectedObjective.id,
          alignmentType: 'parent_child',
          weight: values.weight,
        };
      }
      
      await createAlignment.mutateAsync(alignmentData);
      
      form.reset();
      setSelectedObjective(null);
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
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Create Alignment</DialogTitle>
          <DialogDescription>
            Connect this objective with another to establish a parent-child relationship.
          </DialogDescription>
        </DialogHeader>
        
        <Alert variant="default" className="bg-blue-50">
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            {relationDirection === 'parent' 
              ? "The selected objective will be the parent of your current objective."
              : "Your current objective will be the parent of the selected objective."
            }
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Relationship Direction:</span>
            <Button 
              type="button" 
              variant="outline" 
              onClick={toggleRelationDirection}
            >
              {relationDirection === 'parent' 
                ? "Selected objective is parent" 
                : "Selected objective is child"
              }
            </Button>
          </div>
          
          {selectedObjective && (
            <div className="bg-accent/50 p-3 rounded-md">
              <p className="text-sm font-medium">Selected objective:</p>
              <p className="text-base">{selectedObjective.title}</p>
              {selectedObjective.description && (
                <p className="text-sm text-muted-foreground mt-1 truncate">
                  {selectedObjective.description}
                </p>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2" 
                onClick={() => setSelectedObjective(null)}
              >
                Clear selection
              </Button>
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Select an objective:</label>
            <ObjectiveSearchInput 
              currentObjectiveId={sourceObjectiveId}
              onSelect={handleSelectObjective}
              placeholder="Search for objectives..."
            />
          </div>
        </div>
        
        <Form {...form}>
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
                      step="0.1"
                      min="0.1"
                      max="10"
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
                    Enter a value between 0.1 and 10 to represent the alignment weight
                  </FormDescription>
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
                disabled={isSubmitting || !selectedObjective}
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

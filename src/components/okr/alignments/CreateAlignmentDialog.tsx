
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useObjectiveAlignments } from '@/hooks/okr/useObjectiveAlignments';
import { ObjectiveSearchInput } from './ObjectiveSearchInput';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const formSchema = z.object({
  alignedObjectiveId: z.string().min(1, 'Please select an objective'),
  alignmentType: z.enum(['parent_child', 'peer', 'strategic']),
  alignmentNotes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CreateAlignmentDialogProps {
  objectiveId: string;
  onSuccess?: () => void;
}

export const CreateAlignmentDialog: React.FC<CreateAlignmentDialogProps> = ({
  objectiveId,
  onSuccess,
}) => {
  const [selectedObjectiveTitle, setSelectedObjectiveTitle] = useState<string>('');
  const { createAlignment } = useObjectiveAlignments(objectiveId);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      alignedObjectiveId: '',
      alignmentType: 'parent_child',
      alignmentNotes: '',
    },
  });

  const onSubmit = (data: FormData) => {
    createAlignment.mutate(
      {
        sourceObjectiveId: objectiveId,
        alignedObjectiveId: data.alignedObjectiveId,
        alignmentType: data.alignmentType,
        alignmentNotes: data.alignmentNotes,
      },
      {
        onSuccess: () => {
          if (onSuccess) onSuccess();
          form.reset();
        },
      }
    );
  };

  const handleObjectiveSelected = (id: string, title: string) => {
    form.setValue('alignedObjectiveId', id);
    setSelectedObjectiveTitle(title);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="alignedObjectiveId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Align with Objective</FormLabel>
              <FormControl>
                <ObjectiveSearchInput
                  onObjectiveSelected={handleObjectiveSelected}
                  excludeObjectiveId={objectiveId}
                  selectedObjectiveId={field.value}
                  selectedObjectiveTitle={selectedObjectiveTitle}
                />
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
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select alignment type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="parent_child">Parent-Child</SelectItem>
                  <SelectItem value="peer">Peer</SelectItem>
                  <SelectItem value="strategic">Strategic</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="alignmentNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add notes about this alignment..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={createAlignment.isPending}>
            {createAlignment.isPending ? (
              <>
                <LoadingSpinner size={16} className="mr-2" />
                Creating...
              </>
            ) : (
              'Create Alignment'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

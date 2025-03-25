
import React from 'react';
import { useForm } from 'react-hook-form';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  CreateObjectiveInput, 
  Objective, 
  ObjectiveVisibility, 
  UpdateObjectiveInput 
} from '@/types/okr';
import { useOKRCycles } from '@/hooks/okr/useOKRCycles';

interface ObjectiveFormProps {
  objective?: Objective;
  onSubmit: (data: CreateObjectiveInput | UpdateObjectiveInput) => void;
  isSubmitting: boolean;
  onCancel?: () => void;
  initialCycleId?: string;
}

export const ObjectiveForm = ({ 
  objective, 
  onSubmit, 
  isSubmitting, 
  onCancel,
  initialCycleId 
}: ObjectiveFormProps) => {
  const { cycles, isLoading: cyclesLoading } = useOKRCycles();
  const isEditMode = !!objective;
  
  const form = useForm<CreateObjectiveInput | UpdateObjectiveInput>({
    defaultValues: isEditMode ? {
      title: objective.title,
      description: objective.description || '',
      visibility: objective.visibility,
      cycleId: objective.cycleId
    } : {
      title: '',
      description: '',
      cycleId: initialCycleId || '',
      visibility: 'team' as ObjectiveVisibility,
    },
  });

  // Find the active cycle if cycleId is not provided
  React.useEffect(() => {
    if (!isEditMode && !initialCycleId && cycles && cycles.length > 0 && !form.getValues('cycleId')) {
      // Find an active cycle or take the first one
      const activeCycle = cycles.find(c => c.status === 'active') || cycles[0];
      if (activeCycle) {
        form.setValue('cycleId', activeCycle.id);
      }
    }
  }, [initialCycleId, cycles, form, isEditMode]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter objective title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your objective" 
                  {...field} 
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cycleId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>OKR Cycle</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value || ''}
                disabled={cyclesLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select OKR cycle" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {cycles?.map(cycle => (
                    <SelectItem key={cycle.id} value={cycle.id}>
                      {cycle.name} {cycle.status === 'active' ? '(Active)' : `(${cycle.status})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="visibility"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visibility</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                  <SelectItem value="department">Department</SelectItem>
                  <SelectItem value="organization">Organization</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (isEditMode ? 'Saving...' : 'Creating...') : (isEditMode ? 'Save Changes' : 'Create Objective')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

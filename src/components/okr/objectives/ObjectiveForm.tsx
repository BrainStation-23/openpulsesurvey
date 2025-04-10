import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form } from "@/components/ui/form";
import { supabase } from '@/integrations/supabase/client';
import { CreateObjectiveInput, Objective, UpdateObjectiveInput, ProgressCalculationMethod, OKRDefaultSettings } from '@/types/okr';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { ObjectiveFormFields } from './form/ObjectiveFormFields';
import { ObjectiveVisibilityField } from './form/ObjectiveVisibilityField';
import { ObjectiveFormActions } from './form/ObjectiveFormActions';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().optional(),
  cycleId: z.string().uuid({ message: "Please select a valid OKR cycle" }),
  visibility: z.enum(['private', 'team', 'department', 'organization']),
  parentObjectiveId: z.string().uuid().optional().nullable(),
  sbuId: z.string().uuid().optional().nullable(),
  ownerId: z.string().uuid(),
  progressCalculationMethod: z.enum(['weighted_sum', 'weighted_avg']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ObjectiveFormProps {
  onSubmit: (data: CreateObjectiveInput | UpdateObjectiveInput) => void;
  isSubmitting: boolean;
  objective?: Objective;
  initialCycleId?: string;
  onCancel?: () => void;
  hideParentObjective?: boolean;
}

export const ObjectiveForm: React.FC<ObjectiveFormProps> = ({
  onSubmit,
  isSubmitting,
  objective,
  initialCycleId,
  onCancel,
  hideParentObjective = false
}) => {
  const { userId } = useCurrentUser();
  const { toast } = useToast();
  const [parentObjectiveOptions, setParentObjectiveOptions] = useState<{ id: string; title: string }[]>([]);
  const [selectedOwner, setSelectedOwner] = useState<string | null>(null);

  const { data: defaultSettings } = useQuery<OKRDefaultSettings | null>({
    queryKey: ['okr_default_settings'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('okr_default_settings')
          .select('*')
          .limit(1)
          .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        return data as OKRDefaultSettings || { id: null, default_progress_calculation_method: 'weighted_sum' };
      } catch (error) {
        console.error('Error fetching default settings:', error);
        return { id: null, default_progress_calculation_method: 'weighted_sum' } as OKRDefaultSettings;
      }
    }
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: objective?.title || '',
      description: objective?.description || '',
      cycleId: objective?.cycleId || initialCycleId || '',
      visibility: objective?.visibility || 'private',
      parentObjectiveId: objective?.parentObjectiveId || null,
      sbuId: objective?.sbuId || null,
      ownerId: objective?.ownerId || userId || '',
      progressCalculationMethod: objective?.progressCalculationMethod as ProgressCalculationMethod || 
                               defaultSettings?.default_progress_calculation_method || 
                               'weighted_sum',
    },
  });

  useEffect(() => {
    const currentOwner = form.watch('ownerId');
    if (currentOwner) {
      setSelectedOwner(currentOwner);
    }
  }, [form.watch('ownerId')]);

  useEffect(() => {
    const cycleId = form.watch('cycleId');
    
    if (cycleId && !hideParentObjective) {
      const fetchParentObjectives = async () => {
        const { data, error } = await supabase
          .from('objectives')
          .select('id, title')
          .eq('cycle_id', cycleId)
          .is('parent_objective_id', null);
        
        if (error) {
          console.error('Error fetching parent objectives:', error);
          toast({
            title: "Error",
            description: "Failed to load parent objectives",
            variant: "destructive"
          });
          return;
        }
        
        const filteredOptions = objective ? data.filter(item => item.id !== objective.id) : data;
        setParentObjectiveOptions(filteredOptions);
      };
      
      fetchParentObjectives();
    }
  }, [form.watch('cycleId'), objective, hideParentObjective, toast]);

  const handleSubmit = (values: FormValues) => {
    onSubmit({
      ...values,
      parentObjectiveId: values.parentObjectiveId || undefined
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <ObjectiveFormFields
          form={form}
          parentObjectiveOptions={parentObjectiveOptions}
          selectedOwner={selectedOwner}
          setSelectedOwner={setSelectedOwner}
          hideParentObjective={hideParentObjective}
          defaultCalcMethod={defaultSettings?.default_progress_calculation_method as ProgressCalculationMethod}
        />
        
        <ObjectiveVisibilityField form={form} />
        
        <ObjectiveFormActions
          isSubmitting={isSubmitting}
          onCancel={onCancel}
          isEditing={!!objective}
        />
      </form>
    </Form>
  );
};

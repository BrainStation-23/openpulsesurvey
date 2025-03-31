
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CreateObjectiveInput, Objective, ObjectiveVisibility, UpdateObjectiveInput } from '@/types/okr';
import { UserSelector } from '@/components/okr/permissions/UserSelector';
import { useCurrentUser } from '@/hooks/useCurrentUser';

// Define the form schema
const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().optional(),
  cycleId: z.string().uuid({ message: "Please select a valid OKR cycle" }),
  visibility: z.enum(['private', 'team', 'department', 'organization']),
  parentObjectiveId: z.string().uuid().optional().nullable(),
  sbuId: z.string().uuid().optional().nullable(),
  ownerId: z.string().uuid(),
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
  const { userId, isAdmin } = useCurrentUser();
  const [parentObjectiveOptions, setParentObjectiveOptions] = useState<{ id: string; title: string }[]>([]);
  const [selectedOwner, setSelectedOwner] = useState<string | null>(null);

  // Get OKR cycles
  const { data: cycles } = useQuery({
    queryKey: ['okrCycles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('okr_cycles')
        .select('id, name')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Get SBU options
  const { data: sbus } = useQuery({
    queryKey: ['sbus'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sbus')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Initialize form with objective data if editing, otherwise use defaults
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
    },
  });

  // Set selectedOwner based on form value
  useEffect(() => {
    const currentOwner = form.watch('ownerId');
    if (currentOwner) {
      setSelectedOwner(currentOwner);
    }
  }, [form.watch('ownerId')]);

  // Fetch parent objective options when cycleId changes
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
          return;
        }
        
        // Filter out the current objective if it exists
        const filteredOptions = objective ? data.filter(item => item.id !== objective.id) : data;
        setParentObjectiveOptions(filteredOptions);
      };
      
      fetchParentObjectives();
    }
  }, [form.watch('cycleId'), objective, hideParentObjective]);

  // Handle form submission
  const handleSubmit = (values: FormValues) => {
    // Transform values to match API expectations if needed
    onSubmit({
      ...values,
      parentObjectiveId: values.parentObjectiveId || undefined
    });
  };

  // Handle owner change - now accepts a single userId
  const handleOwnerChange = (userId: string | null) => {
    if (userId) {
      form.setValue('ownerId', userId);
    }
    setSelectedOwner(userId);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Use grid layout for better horizontal space usage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6 md:col-span-2">
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
                      placeholder="Describe the objective" 
                      className="min-h-[100px]"
                      {...field} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="cycleId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>OKR Cycle</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value} 
                  disabled={!!objective}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select OKR cycle" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cycles?.map(cycle => (
                      <SelectItem key={cycle.id} value={cycle.id}>
                        {cycle.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Only show parent objective field if not hidden */}
          {!hideParentObjective && (
            <FormField
              control={form.control}
              name="parentObjectiveId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Objective (Optional)</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent objective" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem key="none" value="none">None</SelectItem>
                      {parentObjectiveOptions.map(obj => (
                        <SelectItem key={obj.id} value={obj.id}>
                          {obj.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          <FormField
            control={form.control}
            name="sbuId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Unit (Optional)</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select business unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem key="none" value="none">None</SelectItem>
                    {sbus?.map(sbu => (
                      <SelectItem key={sbu.id} value={sbu.id}>
                        {sbu.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Owner field is always included but hidden for regular users creating their own objectives */}
          <FormField
            control={form.control}
            name="ownerId"
            render={({ field }) => (
              <FormItem className={!isAdmin && !objective ? "hidden" : ""}>
                <FormLabel>Owner</FormLabel>
                <FormControl>
                  <UserSelector
                    selectedUsers={selectedOwner ? [selectedOwner] : []}
                    onChange={handleOwnerChange}
                    placeholder="Search for objective owner..."
                    singleSelect={true}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="visibility"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Visibility</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid grid-cols-1 md:grid-cols-2 gap-2"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="private" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Private - Only visible to you and those you specifically share with
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="team" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Team - Visible to your team members
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="department" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Department - Visible to your entire department
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="organization" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Organization - Visible to the entire organization
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : (objective ? 'Update Objective' : 'Create Objective')}
          </Button>
        </div>
      </form>
    </Form>
  );
};


import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UserSelector } from '@/components/okr/permissions/UserSelector';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

// Use the same form schema from the original component
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

interface ObjectiveFormFieldsProps {
  form: UseFormReturn<FormValues>;
  parentObjectiveOptions: { id: string; title: string }[];
  selectedOwner: string | null;
  setSelectedOwner: (userId: string | null) => void;
  hideParentObjective?: boolean;
}

export const ObjectiveFormFields: React.FC<ObjectiveFormFieldsProps> = ({
  form,
  parentObjectiveOptions,
  selectedOwner,
  setSelectedOwner,
  hideParentObjective = false
}) => {
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

  // Handle owner change
  const handleOwnerChange = (userId: string | null) => {
    if (userId) {
      form.setValue('ownerId', userId);
    }
    setSelectedOwner(userId);
  };

  return (
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

      <FormField
        control={form.control}
        name="ownerId"
        render={({ field }) => (
          <FormItem>
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
  );
};

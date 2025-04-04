
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserSelector } from '@/components/okr/permissions/UserSelector';
import { SBUSelector } from '@/components/okr/permissions/SBUSelector';

interface ObjectiveFormFieldsProps {
  form: UseFormReturn<any>;
  parentObjectiveOptions: Array<{ id: string; title: string }>;
  selectedOwner: string | null;
  setSelectedOwner: (id: string | null) => void;
  hideParentObjective?: boolean;
}

export const ObjectiveFormFields: React.FC<ObjectiveFormFieldsProps> = ({
  form,
  parentObjectiveOptions,
  selectedOwner,
  setSelectedOwner,
  hideParentObjective = false
}) => {
  const { data: cycles } = useQuery({
    queryKey: ['okr_cycles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('okr_cycles')
        .select('id, name, status')
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: defaultSettings } = useQuery({
    queryKey: ['okr_default_settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('okr_default_settings')
        .select('*')
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || { default_progress_calculation_method: 'weighted_sum' };
    }
  });

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input placeholder="Objective title" {...field} />
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
                placeholder="Describe the objective in detail" 
                className="resize-none min-h-[100px]" 
                {...field} 
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
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select an OKR cycle" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {cycles?.map((cycle) => (
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

      {!hideParentObjective && (
        <FormField
          control={form.control}
          name="parentObjectiveId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent Objective</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value || undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a parent objective (optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {parentObjectiveOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.title}
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
            <FormLabel>Business Unit</FormLabel>
            <SBUSelector 
              value={field.value || undefined} 
              onChange={field.onChange} 
            />
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
            <UserSelector 
              value={selectedOwner || undefined} 
              onChange={(value) => {
                setSelectedOwner(value);
                field.onChange(value);
              }} 
            />
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="progressCalculationMethod"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Progress Calculation Method</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value || defaultSettings?.default_progress_calculation_method || 'weighted_sum'}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select calculation method" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="weighted_sum">Weighted Sum</SelectItem>
                <SelectItem value="weighted_avg">Weighted Average</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

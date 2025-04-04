
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProgressCalculationMethod } from '@/types/okr';

const formSchema = z.object({
  defaultProgressCalculationMethod: z.enum(['weighted_sum', 'weighted_avg']),
});

type FormValues = z.infer<typeof formSchema>;

export const DefaultSettingsForm = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: settings, isLoading } = useQuery({
    queryKey: ['okr_default_settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('okr_default_settings')
        .select('*')
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || { default_progress_calculation_method: 'weighted_sum', id: null };
    },
  });
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      defaultProgressCalculationMethod: (settings?.default_progress_calculation_method as ProgressCalculationMethod) || 'weighted_sum',
    },
    values: {
      defaultProgressCalculationMethod: (settings?.default_progress_calculation_method as ProgressCalculationMethod) || 'weighted_sum',
    }
  });
  
  const saveSettings = useMutation({
    mutationFn: async (values: FormValues) => {
      if (settings?.id) {
        // Update existing settings
        const { data, error } = await supabase
          .from('okr_default_settings')
          .update({
            default_progress_calculation_method: values.defaultProgressCalculationMethod,
          })
          .eq('id', settings.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Insert new settings
        const { data, error } = await supabase
          .from('okr_default_settings')
          .insert({
            default_progress_calculation_method: values.defaultProgressCalculationMethod,
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['okr_default_settings'] });
      toast({
        title: 'Success',
        description: 'Default settings updated successfully',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to update settings: ${error.message}`,
      });
    },
  });
  
  const onSubmit = (values: FormValues) => {
    saveSettings.mutate(values);
  };
  
  if (isLoading) {
    return <div>Loading settings...</div>;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Default OKR Settings</CardTitle>
        <CardDescription>
          Configure default settings for new objectives
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="defaultProgressCalculationMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Progress Calculation Method</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  <FormDescription>
                    This method will be used for calculating progress on new objectives.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={saveSettings.isPending}>
              {saveSettings.isPending ? 'Saving...' : 'Save Settings'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};


import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { OKRTemplate } from '@/types/okr';

export const useTemplates = () => {
  const queryClient = useQueryClient();

  // Fetch all templates
  const { data: templates, isLoading, error } = useQuery({
    queryKey: ['okr-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('okr_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as OKRTemplate[];
    }
  });

  // Get a specific template
  const getTemplate = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from('okr_templates')
      .select(`
        *,
        objectives:template_objectives(
          id,
          title,
          description,
          key_results:template_key_results(
            id,
            title,
            description,
            measurement_type,
            start_value,
            target_value,
            weight
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as OKRTemplate;
  }, []);

  // Create a new template
  const createTemplate = useMutation({
    mutationFn: async (newTemplate: Omit<OKRTemplate, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('okr_templates')
        .insert(newTemplate)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['okr-templates'] });
    }
  }).mutateAsync;

  // Update a template
  const updateTemplate = useMutation({
    mutationFn: async ({ id, ...template }: { id: string } & Partial<OKRTemplate>) => {
      const { data, error } = await supabase
        .from('okr_templates')
        .update(template)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['okr-templates'] });
    }
  }).mutateAsync;

  // Delete a template
  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('okr_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['okr-templates'] });
    }
  }).mutateAsync;

  return {
    templates,
    isLoading, 
    error,
    getTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
};


import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { OKRTemplate, TemplateObjective, TemplateKeyResult } from '@/types/okr';

// Type for data coming from Supabase
interface TemplateData {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  owner_id?: string;
  is_public?: boolean;
  objectives?: TemplateObjective[];
}

// Input type for creating a template
export interface CreateTemplateInput {
  name: string;
  description?: string;
  is_public?: boolean;
  owner_id: string;
}

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
    try {
      // First fetch the basic template info
      const { data: templateData, error: templateError } = await supabase
        .from('okr_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (templateError) throw templateError;

      // Return just the basic template if there's no full data needed
      return templateData as OKRTemplate;
    } catch (error) {
      console.error('Error fetching template:', error);
      throw error;
    }
  }, []);

  // Create a new template
  const createTemplate = useMutation({
    mutationFn: async (newTemplate: CreateTemplateInput) => {
      const { data, error } = await supabase
        .from('okr_templates')
        .insert({
          name: newTemplate.name,
          description: newTemplate.description,
          is_public: newTemplate.is_public,
          owner_id: newTemplate.owner_id
        })
        .select()
        .single();

      if (error) throw error;
      return data as OKRTemplate;
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
      return data as OKRTemplate;
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

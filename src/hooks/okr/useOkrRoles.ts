
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { OkrRoleSettings } from '@/types/okr-settings';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useOkrRoles() {
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch settings using React Query
  const { 
    data: settings, 
    isLoading: loading,
    refetch
  } = useQuery({
    queryKey: ['okr-role-settings'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('okr_role_settings')
          .select('*')
          .limit(1)
          .single();
          
        if (error) {
          // If no settings found, create default settings
          if (error.code === 'PGRST116') {
            const newSettings: Partial<OkrRoleSettings> = {
              can_create_objectives: [],
              can_create_org_objectives: [],
              can_create_dept_objectives: [],
              can_create_team_objectives: [],
              can_create_key_results: [],
              can_create_alignments: [],
              can_align_with_org_objectives: [],
              can_align_with_dept_objectives: [],
              can_align_with_team_objectives: [],
            };
            
            const { data: createdData, error: createError } = await supabase
              .from('okr_role_settings')
              .insert(newSettings)
              .select('*')
              .single();
              
            if (createError) {
              throw createError;
            }
            
            return createdData as OkrRoleSettings;
          } else {
            throw error;
          }
        } else {
          return data as OkrRoleSettings;
        }
      } catch (err: any) {
        setError(err);
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to fetch OKR role settings: ${err.message}`
        });
        throw err;
      }
    }
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (updatedSettings: Partial<OkrRoleSettings>) => {
      const { error } = await supabase
        .from('okr_role_settings')
        .update(updatedSettings)
        .eq('id', settings?.id);
      
      if (error) throw error;
      
      return { ...settings, ...updatedSettings } as OkrRoleSettings;
    },
    onSuccess: (newSettings) => {
      // Update the cache with the new settings
      queryClient.setQueryData(['okr-role-settings'], newSettings);
      
      toast({
        title: "Settings updated",
        description: "OKR role settings have been updated successfully."
      });
    },
    onError: (err: any) => {
      setError(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to update OKR role settings: ${err.message}`
      });
    }
  });

  const updateSettings = async (updatedSettings: Partial<OkrRoleSettings>) => {
    try {
      await updateSettingsMutation.mutateAsync(updatedSettings);
      return true;
    } catch (error) {
      return false;
    }
  };

  return {
    settings,
    loading,
    error,
    fetchSettings: refetch,
    updateSettings,
  };
}

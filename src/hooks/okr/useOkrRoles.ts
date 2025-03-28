
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { OkrRoleSettings } from '@/types/okr-settings';

export function useOkrRoles() {
  const [settings, setSettings] = useState<OkrRoleSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
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
          
          setSettings(createdData);
        } else {
          throw error;
        }
      } else {
        setSettings(data);
      }
    } catch (err: any) {
      setError(err);
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to fetch OKR role settings: ${err.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updatedSettings: Partial<OkrRoleSettings>) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('okr_role_settings')
        .update(updatedSettings)
        .eq('id', settings?.id);
      
      if (error) throw error;
      
      setSettings(prev => prev ? { ...prev, ...updatedSettings } : null);
      
      toast({
        title: "Settings updated",
        description: "OKR role settings have been updated successfully."
      });
      
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err);
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to update OKR role settings: ${err.message}`
      });
      return false;
    }
  };

  return {
    settings,
    loading,
    error,
    fetchSettings,
    updateSettings,
  };
}

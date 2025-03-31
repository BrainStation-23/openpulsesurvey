
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SBU {
  id: string;
  name: string;
}

export const useSBUs = () => {
  const { data: sbus, isLoading, error } = useQuery({
    queryKey: ['sbus'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sbus')
        .select('id, name')
        .order('name');
      
      if (error) {
        console.error('Error fetching SBUs:', error);
        throw error;
      }
      
      return data as SBU[];
    }
  });

  return {
    sbus,
    isLoading,
    error
  };
};

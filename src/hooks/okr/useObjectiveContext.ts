
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useObjectiveContext = (id: string | undefined) => {
  const { data } = useQuery({
    queryKey: ['objective-context', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('objectives')
        .select('progress, status')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching objective context:', error);
        return null;
      }
      
      return {
        progress: data.progress,
        status: data.status
      };
    },
    enabled: !!id
  });

  return {
    objectiveProgress: data?.progress,
    objectiveStatus: data?.status
  };
};

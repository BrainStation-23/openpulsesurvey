
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useOwnerInfo = (ownerId: string) => {
  const { data: ownerInfo } = useQuery({
    queryKey: ['user', ownerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', ownerId)
        .single();
        
      if (error) throw error;
      return data;
    }
  });

  const ownerName = ownerInfo 
    ? `${ownerInfo.first_name || ''} ${ownerInfo.last_name || ''}`.trim() 
    : 'Loading...';

  return { ownerInfo, ownerName };
};

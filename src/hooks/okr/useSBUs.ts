
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SBU {
  id: string;
  name: string;
  profileImageUrl?: string;
  headId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const useSBUs = () => {
  const { data: sbus, isLoading, error } = useQuery({
    queryKey: ['sbus'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sbus')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching SBUs:', error);
        throw error;
      }
      
      return data.map(sbu => ({
        id: sbu.id,
        name: sbu.name,
        profileImageUrl: sbu.profile_image_url,
        headId: sbu.head_id,
        createdAt: new Date(sbu.created_at),
        updatedAt: new Date(sbu.updated_at)
      })) as SBU[];
    }
  });

  return {
    sbus: sbus || [],
    isLoading,
    error
  };
};

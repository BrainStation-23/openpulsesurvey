
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { OKRCycle, OKRCycleStatus } from '@/types/okr';
import { useToast } from '@/hooks/use-toast';

export const useOKRCycle = (id: string | undefined) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { 
    data: cycle, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['okrCycle', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('okr_cycles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching OKR cycle:', error);
        throw error;
      }
      
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        startDate: new Date(data.start_date),
        endDate: new Date(data.end_date),
        status: data.status,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        createdBy: data.created_by
      } as OKRCycle;
    },
    enabled: !!id
  });

  const updateStatus = useMutation({
    mutationFn: async (status: OKRCycleStatus) => {
      if (!id) throw new Error('Cycle ID is required');
      
      const { data, error } = await supabase
        .from('okr_cycles')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating OKR cycle status:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['okrCycle', id] });
      queryClient.invalidateQueries({ queryKey: ['okrCycles'] });
      toast({
        title: 'Success',
        description: 'OKR cycle status updated successfully',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error updating cycle status',
        description: error.message,
      });
    }
  });

  return {
    cycle,
    isLoading,
    error,
    updateStatus
  };
};

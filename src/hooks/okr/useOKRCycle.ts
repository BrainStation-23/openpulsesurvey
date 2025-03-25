
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { OKRCycle, OKRCycleStatus, UpdateOKRCycleInput } from '@/types/okr';
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

  const updateCycle = useMutation({
    mutationFn: async (cycleData: UpdateOKRCycleInput & { id: string }) => {
      const { id, ...updateData } = cycleData;
      
      const updateFields: any = {};
      
      if (updateData.name) updateFields.name = updateData.name;
      if (updateData.description !== undefined) updateFields.description = updateData.description;
      if (updateData.startDate) updateFields.start_date = updateData.startDate.toISOString();
      if (updateData.endDate) updateFields.end_date = updateData.endDate.toISOString();
      if (updateData.status) updateFields.status = updateData.status;
      
      const { data, error } = await supabase
        .from('okr_cycles')
        .update(updateFields)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating OKR cycle:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['okrCycle', id] });
      queryClient.invalidateQueries({ queryKey: ['okrCycles'] });
      toast({
        title: 'Success',
        description: 'OKR cycle updated successfully',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error updating cycle',
        description: error.message,
      });
    }
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
  
  const checkCycleObjectives = async (cycleId: string) => {
    const { count, error } = await supabase
      .from('objectives')
      .select('id', { count: 'exact', head: true })
      .eq('cycle_id', cycleId);
      
    if (error) {
      console.error('Error checking objectives:', error);
      throw error;
    }
    
    return count || 0;
  };
  
  const getAvailableCycles = async () => {
    if (!id) return [];
    
    const { data, error } = await supabase
      .from('okr_cycles')
      .select('id, name, status')
      .neq('id', id);
      
    if (error) {
      console.error('Error fetching available cycles:', error);
      throw error;
    }
    
    return data;
  };
  
  const moveObjectivesToCycle = useMutation({
    mutationFn: async ({ sourceCycleId, targetCycleId }: { sourceCycleId: string, targetCycleId: string }) => {
      const { data, error } = await supabase
        .from('objectives')
        .update({ cycle_id: targetCycleId })
        .eq('cycle_id', sourceCycleId)
        .select('id');
        
      if (error) {
        console.error('Error moving objectives:', error);
        throw error;
      }
      
      return data.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      toast({
        title: 'Success',
        description: `${count} objectives moved successfully`,
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error moving objectives',
        description: error.message,
      });
    }
  });
  
  const deleteObjectivesInCycle = useMutation({
    mutationFn: async (cycleId: string) => {
      const { data, error } = await supabase
        .from('objectives')
        .delete()
        .eq('cycle_id', cycleId)
        .select('id');
        
      if (error) {
        console.error('Error deleting objectives:', error);
        throw error;
      }
      
      return data.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      toast({
        title: 'Success',
        description: `${count} objectives deleted successfully`,
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error deleting objectives',
        description: error.message,
      });
    }
  });
  
  const deleteCycle = useMutation({
    mutationFn: async (cycleId: string) => {
      const { error } = await supabase
        .from('okr_cycles')
        .delete()
        .eq('id', cycleId);

      if (error) {
        console.error('Error deleting OKR cycle:', error);
        throw error;
      }
      
      return cycleId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['okrCycles'] });
      toast({
        title: 'Success',
        description: 'OKR cycle deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error deleting cycle',
        description: error.message,
      });
    }
  });

  return {
    cycle,
    isLoading,
    error,
    updateStatus,
    updateCycle,
    deleteCycle,
    checkCycleObjectives,
    getAvailableCycles,
    moveObjectivesToCycle,
    deleteObjectivesInCycle
  };
};

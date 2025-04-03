
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { OKRCycle, OKRCycleStatus, UpdateOKRCycleInput } from '@/types/okr';
import { useToast } from '@/hooks/use-toast';

export const useCycle = (cycleId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch single cycle
  const { 
    data: cycle, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['okrCycle', cycleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('okr_cycles')
        .select('*')
        .eq('id', cycleId)
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        startDate: new Date(data.start_date),
        endDate: new Date(data.end_date),
        status: data.status as OKRCycleStatus,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        createdBy: data.created_by
      } as OKRCycle;
    },
    enabled: !!cycleId
  });

  // Fetch cycle objectives statistics
  const { data: objectiveStats } = useQuery({
    queryKey: ['cycleObjectives', cycleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('objectives')
        .select('id, status')
        .eq('cycle_id', cycleId);
      
      if (error) throw error;
      
      const totalCount = data.length;
      const completedCount = data.filter(obj => obj.status === 'completed').length;
      
      return {
        total: totalCount,
        completed: completedCount
      };
    },
    enabled: !!cycleId
  });

  // Update cycle status
  const updateCycleStatus = useMutation({
    mutationFn: async (status: OKRCycleStatus) => {
      const { data, error } = await supabase
        .from('okr_cycles')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', cycleId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['okrCycle', cycleId] });
      queryClient.invalidateQueries({ queryKey: ['okrCycles'] });
      toast({
        title: 'Success',
        description: 'Cycle status updated successfully',
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

  // Update cycle details
  const updateCycle = useMutation({
    mutationFn: async (data: UpdateOKRCycleInput) => {
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.startDate) updateData.start_date = data.startDate.toISOString();
      if (data.endDate) updateData.end_date = data.endDate.toISOString();
      if (data.status) updateData.status = data.status;
      
      const { data: updatedCycle, error } = await supabase
        .from('okr_cycles')
        .update(updateData)
        .eq('id', cycleId)
        .select()
        .single();
      
      if (error) throw error;
      return updatedCycle;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['okrCycle', cycleId] });
      queryClient.invalidateQueries({ queryKey: ['okrCycles'] });
      toast({
        title: 'Success',
        description: 'Cycle updated successfully',
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

  // Activate cycle
  const activateCycle = useMutation({
    mutationFn: async () => {
      // First set all other active cycles to completed
      const { error: updateError } = await supabase
        .from('okr_cycles')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('status', 'active');
      
      if (updateError) throw updateError;
      
      // Then set this cycle to active
      return updateCycleStatus.mutateAsync('active');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['okrCycles'] });
      toast({
        title: 'Success',
        description: 'Cycle activated successfully',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error activating cycle',
        description: error.message,
      });
    }
  });

  // Archive cycle
  const archiveCycle = () => {
    return updateCycleStatus.mutate('archived');
  };

  return {
    cycle,
    objectiveStats: objectiveStats || { total: 0, completed: 0 },
    isLoading,
    error,
    updateCycle,
    updateCycleStatus,
    activateCycle,
    archiveCycle
  };
};

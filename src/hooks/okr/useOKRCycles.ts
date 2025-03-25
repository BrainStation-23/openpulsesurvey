
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { OKRCycle, CreateOKRCycleInput, UpdateOKRCycleInput } from '@/types/okr';
import { useToast } from '@/hooks/use-toast';

export const useOKRCycles = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch all OKR cycles
  const { 
    data: cycles, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['okrCycles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('okr_cycles')
        .select('*')
        .order('start_date', { ascending: false });
      
      if (error) {
        console.error('Error fetching OKR cycles:', error);
        throw error;
      }
      
      return data.map(cycle => ({
        id: cycle.id,
        name: cycle.name,
        description: cycle.description,
        startDate: new Date(cycle.start_date),
        endDate: new Date(cycle.end_date),
        status: cycle.status,
        createdAt: new Date(cycle.created_at),
        updatedAt: new Date(cycle.updated_at),
        createdBy: cycle.created_by
      })) as OKRCycle[];
    }
  });

  // Create a new OKR cycle
  const createCycle = useMutation({
    mutationFn: async (cycleData: CreateOKRCycleInput) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('okr_cycles')
        .insert([{
          name: cycleData.name,
          description: cycleData.description,
          start_date: cycleData.startDate.toISOString(),
          end_date: cycleData.endDate.toISOString(),
          created_by: session.session.user.id,
          status: 'upcoming'
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating OKR cycle:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['okrCycles'] });
      toast({
        title: 'Success',
        description: 'OKR cycle created successfully',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error creating OKR cycle',
        description: error.message,
      });
    }
  });

  // Update an existing OKR cycle
  const updateCycle = useMutation({
    mutationFn: async ({ id, ...cycleData }: UpdateOKRCycleInput & { id: string }) => {
      const updateData: any = {};
      
      if (cycleData.name) updateData.name = cycleData.name;
      if (cycleData.description !== undefined) updateData.description = cycleData.description;
      if (cycleData.startDate) updateData.start_date = cycleData.startDate.toISOString();
      if (cycleData.endDate) updateData.end_date = cycleData.endDate.toISOString();
      if (cycleData.status) updateData.status = cycleData.status;
      
      const { data, error } = await supabase
        .from('okr_cycles')
        .update(updateData)
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
      queryClient.invalidateQueries({ queryKey: ['okrCycles'] });
      toast({
        title: 'Success',
        description: 'OKR cycle updated successfully',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error updating OKR cycle',
        description: error.message,
      });
    }
  });

  // Delete an OKR cycle
  const deleteCycle = useMutation({
    mutationFn: async (id: string) => {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('okr_cycles')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting OKR cycle:', error);
        throw error;
      }
      
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['okrCycles'] });
      toast({
        title: 'Success',
        description: 'OKR cycle deleted successfully',
      });
      setIsDeleting(false);
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error deleting OKR cycle',
        description: error.message,
      });
      setIsDeleting(false);
    }
  });

  return {
    cycles,
    isLoading,
    error,
    refetch,
    createCycle,
    updateCycle,
    deleteCycle,
    isDeleting
  };
};

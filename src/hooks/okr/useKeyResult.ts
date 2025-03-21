
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { KeyResult, CreateKeyResultInput, UpdateKeyResultInput, KeyResultStatus } from '@/types/okr';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const convertKeyResult = (data: any): KeyResult => {
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    objectiveId: data.objective_id,
    ownerId: data.owner_id,
    krType: data.kr_type,
    measurementType: data.measurement_type,
    unit: data.unit,
    startValue: data.start_value,
    currentValue: data.current_value,
    targetValue: data.target_value,
    booleanValue: data.boolean_value,
    weight: data.weight,
    status: data.status,
    progress: data.progress,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
};

export const useKeyResult = (id?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { 
    data: keyResult, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['keyResult', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('key_results')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching key result:', error);
        throw error;
      }
      
      return convertKeyResult(data);
    },
    enabled: !!id
  });

  const createKeyResult = useMutation({
    mutationFn: async (keyResultData: CreateKeyResultInput) => {
      const { data, error } = await supabase
        .from('key_results')
        .insert({
          title: keyResultData.title,
          description: keyResultData.description,
          kr_type: keyResultData.krType,
          measurement_type: keyResultData.measurementType,
          unit: keyResultData.unit,
          start_value: keyResultData.startValue,
          current_value: keyResultData.currentValue,
          target_value: keyResultData.targetValue,
          boolean_value: keyResultData.booleanValue,
          weight: keyResultData.weight,
          status: keyResultData.status,
          objective_id: keyResultData.objectiveId,
          owner_id: keyResultData.ownerId
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating key result:', error);
        throw error;
      }

      return convertKeyResult(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keyResults'] });
      queryClient.invalidateQueries({ queryKey: ['objective'] });
      toast({
        title: 'Success',
        description: 'Key result created successfully',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error creating key result',
        description: error.message,
      });
    }
  });

  const updateStatus = useMutation({
    mutationFn: async ({ status }: { status: KeyResultStatus }) => {
      if (!id) throw new Error('Key Result ID is required');
      
      const { data, error } = await supabase
        .from('key_results')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating key result status:', error);
        throw error;
      }

      return convertKeyResult(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keyResult', id] });
      queryClient.invalidateQueries({ queryKey: ['keyResults'] });
      queryClient.invalidateQueries({ queryKey: ['objective'] });
      toast({
        title: 'Success',
        description: 'Key result status updated successfully',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error updating key result status',
        description: error.message,
      });
    }
  });

  const updateKeyResult = useMutation({
    mutationFn: async (keyResultData: UpdateKeyResultInput) => {
      if (!id) throw new Error('Key Result ID is required');
      
      const updateData: any = {};
      
      if (keyResultData.title) updateData.title = keyResultData.title;
      if (keyResultData.description !== undefined) updateData.description = keyResultData.description;
      if (keyResultData.krType) updateData.kr_type = keyResultData.krType;
      if (keyResultData.measurementType) updateData.measurement_type = keyResultData.measurementType;
      if (keyResultData.unit !== undefined) updateData.unit = keyResultData.unit;
      if (keyResultData.startValue !== undefined) updateData.start_value = keyResultData.startValue;
      if (keyResultData.currentValue !== undefined) updateData.current_value = keyResultData.currentValue;
      if (keyResultData.targetValue !== undefined) updateData.target_value = keyResultData.targetValue;
      if (keyResultData.booleanValue !== undefined) updateData.boolean_value = keyResultData.booleanValue;
      if (keyResultData.weight !== undefined) updateData.weight = keyResultData.weight;
      if (keyResultData.status) updateData.status = keyResultData.status;
      
      // Log update attempt for debugging
      console.log('Updating key result with values:', updateData);
      
      const { data, error } = await supabase
        .from('key_results')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating key result:', error);
        throw error;
      }

      // Manually recalculate objective progress in case triggers fail
      try {
        const { error: recalcError } = await supabase.rpc('recalculate_all_objective_progress');
        if (recalcError) {
          console.error('Error recalculating objective progress:', recalcError);
        } else {
          console.log('Successfully recalculated all objective progress');
        }
      } catch (recalcErr) {
        console.error('Failed to call recalculate_all_objective_progress:', recalcErr);
      }

      return convertKeyResult(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keyResult', id] });
      queryClient.invalidateQueries({ queryKey: ['keyResults'] });
      queryClient.invalidateQueries({ queryKey: ['objective'] });
      toast({
        title: 'Success',
        description: 'Key result updated successfully',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error updating key result',
        description: error.message,
      });
    }
  });

  const updateProgress = useMutation({
    mutationFn: async ({ currentValue, booleanValue, progress }: { currentValue?: number, booleanValue?: boolean, progress?: number }) => {
      if (!id) throw new Error('Key Result ID is required');
      
      const updateData: any = {};
      
      if (currentValue !== undefined) updateData.current_value = currentValue;
      if (booleanValue !== undefined) {
        updateData.boolean_value = booleanValue;
        // For boolean type, progress is handled by the database trigger
      } else if (progress !== undefined) {
        // For explicit progress updates
        updateData.progress = progress;
      }
      
      console.log('Updating key result in DB:', { id, updateData });
      
      const { data, error } = await supabase
        .from('key_results')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating key result progress:', error);
        throw error;
      }

      // Get the objective ID to manually refresh it
      const keyResult = convertKeyResult(data);
      
      // Log the key result after update
      console.log('Key result after update:', keyResult);
      
      // Manually update the objective progress
      try {
        const { error: recalcError } = await supabase.rpc('recalculate_all_objective_progress');
        if (recalcError) {
          console.error('Error recalculating objective progress:', recalcError);
        } else {
          console.log('Successfully recalculated all objective progress');
        }
      } catch (recalcErr) {
        console.error('Failed to call recalculate_all_objective_progress:', recalcErr);
      }

      return convertKeyResult(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keyResult', id] });
      queryClient.invalidateQueries({ queryKey: ['keyResults'] });
      queryClient.invalidateQueries({ queryKey: ['objective'] });
      toast({
        title: 'Success',
        description: 'Progress updated successfully',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error updating progress',
        description: error.message,
      });
    }
  });

  const deleteKeyResult = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error('Key Result ID is required');
      
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('key_results')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting key result:', error);
        throw error;
      }
      
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keyResults'] });
      queryClient.invalidateQueries({ queryKey: ['objective'] });
      toast({
        title: 'Success',
        description: 'Key result deleted successfully',
      });
      setIsDeleting(false);
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error deleting key result',
        description: error.message,
      });
      setIsDeleting(false);
    }
  });

  return {
    keyResult,
    isLoading,
    error,
    createKeyResult,
    updateStatus,
    updateKeyResult,
    updateProgress,
    deleteKeyResult,
    isDeleting
  };
};


import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { KeyResult, CreateKeyResultInput, UpdateKeyResultInput } from '@/types/okr';
import { useToast } from '@/hooks/use-toast';

export const useKeyResults = (objectiveId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { 
    data: keyResults, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['key-results', objectiveId],
    queryFn: async () => {
      if (!objectiveId) return [];
      
      const { data, error } = await supabase
        .from('key_results')
        .select('*')
        .eq('objective_id', objectiveId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching key results:', error);
        throw error;
      }
      
      // Map the snake_case database fields to camelCase interface properties
      return data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        objectiveId: item.objective_id,
        ownerId: item.owner_id,
        krType: item.kr_type,
        unit: item.unit,
        startValue: item.start_value,
        currentValue: item.current_value,
        targetValue: item.target_value,
        progress: item.progress,
        status: item.status,
        weight: item.weight,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      })) as KeyResult[];
    },
    enabled: !!objectiveId
  });

  // Helper function to check if user has permissions for an objective
  const checkObjectivePermission = async (objectiveId: string) => {
    // First, fetch the current user's session
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUserId = sessionData.session?.user?.id;
    
    if (!currentUserId) {
      throw new Error('You must be logged in to perform this action.');
    }
    
    // Check if user is an admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', currentUserId)
      .eq('role', 'admin')
      .single();
      
    if (roleData) {
      // Admin has all permissions
      return true;
    }
    
    // Check if user is the owner of the objective
    const { data: objectiveData, error: objectiveError } = await supabase
      .from('objectives')
      .select('owner_id')
      .eq('id', objectiveId)
      .single();
      
    if (objectiveError) {
      console.error('Error checking objective ownership:', objectiveError);
      throw new Error('Could not verify permissions for this objective');
    }
    
    if (objectiveData.owner_id !== currentUserId) {
      throw new Error('You do not have permission to modify key results for this objective');
    }
    
    return true;
  };

  // Create a new key result
  const createKeyResult = useMutation({
    mutationFn: async (keyResultData: CreateKeyResultInput) => {
      // Check permissions first
      await checkObjectivePermission(keyResultData.objectiveId);
      
      const { data, error } = await supabase
        .from('key_results')
        .insert({
          title: keyResultData.title,
          description: keyResultData.description,
          kr_type: keyResultData.krType,
          unit: keyResultData.unit,
          start_value: keyResultData.startValue,
          current_value: keyResultData.currentValue,
          target_value: keyResultData.targetValue,
          weight: keyResultData.weight,
          objective_id: keyResultData.objectiveId,
          owner_id: keyResultData.ownerId,
          status: 'not_started'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating key result:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['key-results', objectiveId] });
      // Since key results affect the objective's progress, also invalidate the objective
      queryClient.invalidateQueries({ queryKey: ['objective', objectiveId] });
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

  // Update an existing key result
  const updateKeyResult = useMutation({
    mutationFn: async (updateData: UpdateKeyResultInput & { id: string }) => {
      const { id, ...rest } = updateData;
      
      // First, get the key result to check the objective it belongs to
      const { data: keyResultData, error: fetchError } = await supabase
        .from('key_results')
        .select('objective_id')
        .eq('id', id)
        .single();
        
      if (fetchError) {
        console.error('Error fetching key result:', fetchError);
        throw fetchError;
      }
      
      // Check permissions
      await checkObjectivePermission(keyResultData.objective_id);
      
      // Convert camelCase to snake_case for Supabase
      const mappedData: any = {};
      if (rest.title) mappedData.title = rest.title;
      if (rest.description !== undefined) mappedData.description = rest.description;
      if (rest.krType) mappedData.kr_type = rest.krType;
      if (rest.unit !== undefined) mappedData.unit = rest.unit;
      if (rest.startValue !== undefined) mappedData.start_value = rest.startValue;
      if (rest.currentValue !== undefined) mappedData.current_value = rest.currentValue;
      if (rest.targetValue !== undefined) mappedData.target_value = rest.targetValue;
      if (rest.weight !== undefined) mappedData.weight = rest.weight;
      if (rest.status) mappedData.status = rest.status;
      
      const { data, error } = await supabase
        .from('key_results')
        .update(mappedData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating key result:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['key-results', objectiveId] });
      queryClient.invalidateQueries({ queryKey: ['objective', objectiveId] });
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

  // Delete a key result
  const deleteKeyResult = useMutation({
    mutationFn: async (id: string) => {
      // First, get the key result to check the objective it belongs to
      const { data: keyResultData, error: fetchError } = await supabase
        .from('key_results')
        .select('objective_id')
        .eq('id', id)
        .single();
        
      if (fetchError) {
        console.error('Error fetching key result:', fetchError);
        throw fetchError;
      }
      
      // Check permissions
      await checkObjectivePermission(keyResultData.objective_id);
      
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
      queryClient.invalidateQueries({ queryKey: ['key-results', objectiveId] });
      queryClient.invalidateQueries({ queryKey: ['objective', objectiveId] });
      toast({
        title: 'Success',
        description: 'Key result deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error deleting key result',
        description: error.message,
      });
    }
  });

  return {
    keyResults,
    isLoading,
    error,
    createKeyResult,
    updateKeyResult,
    deleteKeyResult
  };
};

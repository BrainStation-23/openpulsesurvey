
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type InstanceStatus = 'upcoming' | 'active' | 'completed' | 'inactive';

export interface Instance {
  id: string;
  campaign_id: string;
  starts_at: string;
  ends_at: string;
  status: InstanceStatus;
  period_number: number;
  created_at: string;
  updated_at: string;
  completion_rate?: number;
}

export function useInstanceManagement(campaignId: string) {
  const queryClient = useQueryClient();

  // Fetch campaign details
  const { data: campaign, isLoading: isCampaignLoading } = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('survey_campaigns')
        .select(`
          *,
          survey:surveys(name)
        `)
        .eq('id', campaignId)
        .single();
        
      if (error) throw error;
      return data;
    },
  });

  // Fetch campaign instances
  const { 
    data: instances = [], 
    isLoading: isInstancesLoading,
    refetch: refreshInstances
  } = useQuery({
    queryKey: ['campaign-instances', campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_instances')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('period_number', { ascending: true });
        
      if (error) throw error;
      
      // Handle the status mapping here in the frontend
      // Map the database statuses to our internal statuses
      return data.map(instance => ({
        ...instance,
        // Convert 'upcoming' to 'inactive' for instances that should be inactive
        status: instance.status === 'upcoming' && new Date(instance.starts_at) > new Date() ? 
          'inactive' as InstanceStatus : instance.status as InstanceStatus
      }));
    },
  });

  // Update instance mutation
  const updateInstanceMutation = useMutation({
    mutationFn: async (updatedInstance: Partial<Instance> & { id: string }) => {
      const { id, ...updateData } = updatedInstance;
      
      // Convert 'inactive' status to 'upcoming' for database compatibility
      // This is a temporary solution until the database enum is updated
      const finalUpdateData = {
        ...updateData,
        status: updateData.status === 'inactive' ? 'upcoming' : updateData.status
      };
      
      const { data, error } = await supabase
        .from('campaign_instances')
        .update(finalUpdateData)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-instances', campaignId] });
    },
  });

  // Check for status conflicts
  const validateStatusChange = (
    instance: Instance, 
    newStatus: InstanceStatus
  ): string | null => {
    // Prevent completed instances from being changed to other statuses
    if (instance.status === 'completed' && newStatus !== 'completed') {
      return "Completed instances cannot be changed to other statuses";
    }

    const now = new Date();
    const startDate = new Date(instance.starts_at);
    const endDate = new Date(instance.ends_at);

    // Validate status against dates
    if (newStatus === 'active' && endDate < now) {
      return "Cannot set an instance to active if its end date has passed";
    }

    if (newStatus === 'upcoming' && startDate < now) {
      return "Cannot set an instance to upcoming if its start date has passed";
    }

    return null;
  };

  const updateInstance = async (updatedInstance: Partial<Instance> & { id: string }) => {
    // If status is being updated, validate it
    if (updatedInstance.status) {
      const instance = instances.find(i => i.id === updatedInstance.id);
      if (instance) {
        const validationError = validateStatusChange(
          instance, 
          updatedInstance.status as InstanceStatus
        );
        
        if (validationError) {
          throw new Error(validationError);
        }
      }
    }

    return updateInstanceMutation.mutateAsync(updatedInstance);
  };

  // Manual function to calculate completion rate
  const calculateCompletionRate = async (instanceId: string) => {
    try {
      // This would typically call a database function, but since we're removing those,
      // we'll implement the calculation logic here
      
      // Get total assignments for this campaign
      const { data: assignments, error: assignmentError } = await supabase
        .from('survey_assignments')
        .select('id')
        .eq('campaign_id', campaignId);
        
      if (assignmentError) throw assignmentError;
      
      // Get completed responses for this instance
      const { data: responses, error: responseError } = await supabase
        .from('survey_responses')
        .select('id')
        .eq('campaign_instance_id', instanceId)
        .eq('status', 'submitted');
        
      if (responseError) throw responseError;
      
      // Calculate completion rate
      const totalAssignments = assignments?.length || 0;
      const completedResponses = responses?.length || 0;
      const completionRate = totalAssignments > 0 
        ? (completedResponses / totalAssignments) * 100 
        : 0;
      
      // Update the instance with the calculated completion rate
      const { error: updateError } = await supabase
        .from('campaign_instances')
        .update({ completion_rate: completionRate })
        .eq('id', instanceId);
        
      if (updateError) throw updateError;
      
      // Refresh instances data
      refreshInstances();
      
      return completionRate;
    } catch (error) {
      console.error("Error calculating completion rate:", error);
      throw error;
    }
  };

  return {
    campaign,
    instances,
    isLoading: isCampaignLoading || isInstancesLoading,
    updateInstance,
    refreshInstances,
    calculateCompletionRate,
  };
}

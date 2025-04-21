import { useState } from "react";
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

export interface CreateInstanceData {
  campaign_id: string;
  starts_at: string;
  ends_at: string;
  status: InstanceStatus;
  period_number: number;
}

export interface InstanceSortOptions {
  sortBy: 'period_number' | 'starts_at' | 'ends_at' | 'status' | 'completion_rate';
  sortDirection: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
}

export function useInstanceManagement(campaignId: string) {
  const queryClient = useQueryClient();
  const [sort, setSort] = useState<InstanceSortOptions>({
    sortBy: 'period_number',
    sortDirection: 'asc'
  });
  const [pagination, setPagination] = useState<PaginationOptions>({
    page: 1,
    pageSize: 10
  });

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

  const { 
    data: instancesData = { data: [], totalCount: 0 }, 
    isLoading: isInstancesLoading,
    refetch: refreshInstances
  } = useQuery({
    queryKey: ['campaign-instances', campaignId, sort, pagination],
    queryFn: async () => {
      const { sortBy, sortDirection } = sort;
      const { page, pageSize } = pagination;
      
      const { data, error } = await supabase
        .rpc('get_campaign_instances', {
          p_campaign_id: campaignId,
          p_start_date_min: null,
          p_start_date_max: null,
          p_end_date_min: null,
          p_end_date_max: null,
          p_status: null,
          p_sort_by: sortBy,
          p_sort_direction: sortDirection,
          p_page: page,
          p_page_size: pageSize
        });
        
      if (error) throw error;
      
      const totalCount = data.length > 0 ? Number(data[0].total_count) : 0;
      
      const processedData = data.map(instance => ({
        ...instance,
        status: instance.status === 'upcoming' && new Date(instance.starts_at) > new Date() ? 
          'inactive' as InstanceStatus : instance.status as InstanceStatus
      }));
      
      return { 
        data: processedData,
        totalCount
      };
    },
  });

  const updateInstanceMutation = useMutation({
    mutationFn: async (updatedInstance: Partial<Instance> & { id: string }) => {
      const { id, starts_at, ends_at, status } = updatedInstance;

      if (!starts_at || !ends_at || !status) throw new Error("Start/end date and status are required");

      const updateStatus = status === 'inactive' ? 'upcoming' : status;

      const { data, error } = await supabase.rpc('update_campaign_instance', {
        p_instance_id: id,
        p_new_starts_at: starts_at,
        p_new_ends_at: ends_at,
        p_new_status: updateStatus
      });

      if (error) throw error;
      if (!data || !Array.isArray(data) || data.length === 0)
        throw new Error("No data returned from update operation");

      const updatedResult = data[0];
      if (updatedResult?.error_message) {
        throw new Error(updatedResult.error_message);
      }
      return updatedResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-instances', campaignId] });
    },
  });

  const createNextInstanceMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await (supabase.rpc as any)('create_next_campaign_instance', { 
        p_campaign_id: campaignId 
      });
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-instances', campaignId] });
    },
  });

  const deleteInstanceMutation = useMutation({
    mutationFn: async (instanceId: string) => {
      const { error } = await supabase
        .from('campaign_instances')
        .delete()
        .eq('id', instanceId);
        
      if (error) throw error;
      return instanceId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-instances', campaignId] });
    },
  });

  const hasActiveInstance = (currentInstanceId?: string): boolean => {
    return instancesData.data.some(instance => 
      instance.status === 'active' && instance.id !== currentInstanceId
    );
  };

  const validateStatusChange = (
    instance: Instance, 
    newStatus: InstanceStatus
  ): string | null => {
    if (newStatus === 'active' && hasActiveInstance(instance.id)) {
      return "There is already an active instance for this campaign. Please mark it as completed or inactive first.";
    }

    return null;
  };

  const updateInstance = async (updatedInstance: Partial<Instance> & { id: string }) => {
    if (updatedInstance.status) {
      const instance = instancesData.data.find(i => i.id === updatedInstance.id);
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

  const createInstance = async () => {
    return createNextInstanceMutation.mutateAsync();
  };

  const deleteInstance = async (instanceId: string) => {
    return deleteInstanceMutation.mutateAsync(instanceId);
  };

  const calculateCompletionRate = async (instanceId: string) => {
    try {
      const { data: assignments, error: assignmentError } = await supabase
        .from('survey_assignments')
        .select('id')
        .eq('campaign_id', campaignId);
        
      if (assignmentError) throw assignmentError;
      
      const { data: responses, error: responseError } = await supabase
        .from('survey_responses')
        .select('id')
        .eq('campaign_instance_id', instanceId)
        .eq('status', 'submitted');
        
      if (responseError) throw responseError;
      
      const totalAssignments = assignments?.length || 0;
      const completedResponses = responses?.length || 0;
      const completionRate = totalAssignments > 0 
        ? (completedResponses / totalAssignments) * 100 
        : 0;
      
      const { error: updateError } = await supabase
        .from('campaign_instances')
        .update({ completion_rate: completionRate })
        .eq('id', instanceId);
        
      if (updateError) throw updateError;
      
      refreshInstances();
      
      return completionRate;
    } catch (error) {
      console.error("Error calculating completion rate:", error);
      throw error;
    }
  };

  const updateSort = (newSort: Partial<InstanceSortOptions>) => {
    setSort(prev => ({ ...prev, ...newSort }));
  };

  const updatePagination = (newPagination: Partial<PaginationOptions>) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  };

  return {
    campaign,
    instances: instancesData.data,
    totalCount: instancesData.totalCount,
    isLoading: isCampaignLoading || isInstancesLoading,
    updateInstance,
    refreshInstances,
    calculateCompletionRate,
    createInstance,
    deleteInstance,
    hasActiveInstance,
    sort,
    pagination,
    updateSort,
    updatePagination,
  };
}

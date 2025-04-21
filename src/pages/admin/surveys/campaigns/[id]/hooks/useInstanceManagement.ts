
// Refactored to use: instanceTypes.ts, statusValidation.ts, completionRate.ts
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Instance, 
  InstanceStatus,
  InstanceSortOptions, 
  PaginationOptions 
} from "./instanceTypes";
import { validateStatusChange } from "./statusValidation";
import { calculateCompletionRateForInstance } from "./completionRate";

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
      
      const totalCount = data.length > 0 && data[0].hasOwnProperty('total_count') 
        ? Number(data[0].total_count) : 0;
      
      const processedData = data.map((instance: any) => ({
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

      const { data, error } = await supabase.rpc("update_campaign_instance", {
        p_instance_id: id,
        p_new_starts_at: starts_at,
        p_new_ends_at: ends_at,
        p_new_status: status === 'inactive' ? 'upcoming' : status,
      });

      if (error) {
        console.error("Update instance error:", error);
        throw new Error(error.message);
      }
      
      if (data && data.length > 0 && data[0].error_message) {
        throw new Error(data[0].error_message);
      }
      
      return data;
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
    return instancesData.data.some((instance: Instance) => 
      instance.status === 'active' && instance.id !== currentInstanceId
    );
  };

  const updateInstance = async (updatedInstance: Partial<Instance> & { id: string }) => {
    if (updatedInstance.status) {
      const instance = instancesData.data.find((i: Instance) => i.id === updatedInstance.id);
      if (instance) {
        const validationError = validateStatusChange(
          instance, 
          updatedInstance.status as InstanceStatus,
          hasActiveInstance
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
    return calculateCompletionRateForInstance(campaignId, instanceId, refreshInstances);
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


import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface CampaignInstance {
  id: string;
  period_number: number;
  starts_at: string;
  ends_at: string;
  status: 'active' | 'completed' | 'upcoming';
}

interface UseInstancesForComparisonResult {
  instances: CampaignInstance[];
  suggestedBase?: CampaignInstance;
  suggestedComparison?: CampaignInstance;
  isLoading: boolean;
  error?: Error;
}

export function useInstancesForComparison(campaignId: string): UseInstancesForComparisonResult {
  const [suggestedBase, setSuggestedBase] = useState<CampaignInstance>();
  const [suggestedComparison, setSuggestedComparison] = useState<CampaignInstance>();

  // Fetch all campaign instances
  const { data: instances, isLoading, error } = useQuery({
    queryKey: ["campaign-instances-for-comparison", campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaign_instances")
        .select("*")
        .eq("campaign_id", campaignId)
        .order("period_number", { ascending: false });

      if (error) {
        throw error;
      }
      
      return data as CampaignInstance[];
    },
    enabled: !!campaignId,
  });

  // Determine suggested instances for comparison
  useEffect(() => {
    if (instances && instances.length > 0) {
      // Find active instance for base
      const activeInstance = instances.find(
        (instance) => instance.status === "active"
      );
      
      // If there's an active instance, use it as base
      if (activeInstance) {
        setSuggestedBase(activeInstance);
        
        // Find the most recent completed instance
        const completedInstances = instances.filter(
          (instance) => instance.status === "completed" && instance.id !== activeInstance.id
        );
        
        if (completedInstances.length > 0) {
          // Sort by period number descending (most recent first)
          completedInstances.sort((a, b) => b.period_number - a.period_number);
          setSuggestedComparison(completedInstances[0]);
        } else {
          // If no completed instances, use the next most suitable instance
          const otherInstances = instances.filter(
            (instance) => instance.id !== activeInstance.id
          );
          
          if (otherInstances.length > 0) {
            // Use the most recent non-active instance
            setSuggestedComparison(otherInstances[0]);
          }
        }
      } else if (instances.length >= 2) {
        // If no active instance but we have at least 2 instances
        setSuggestedBase(instances[0]); // Most recent
        setSuggestedComparison(instances[1]); // Second most recent
      } else if (instances.length === 1) {
        // If only one instance, use it as base but can't suggest comparison
        setSuggestedBase(instances[0]);
      }
    }
  }, [instances]);

  return {
    instances: instances || [],
    suggestedBase,
    suggestedComparison,
    isLoading,
    error: error as Error | undefined,
  };
}

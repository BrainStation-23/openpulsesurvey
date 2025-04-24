
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSupervisorPerformance(campaignId: string, instanceIds: string[]) {
  return useQuery({
    queryKey: ["supervisor-performance", campaignId, instanceIds],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_campaign_supervisor_performance', {
          p_campaign_id: campaignId,
          p_instance_ids: instanceIds
        });

      if (error) throw error;
      return data;
    },
    enabled: instanceIds.length > 0
  });
}

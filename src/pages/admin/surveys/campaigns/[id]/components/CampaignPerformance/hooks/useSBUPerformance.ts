
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSBUPerformance(campaignId: string, instanceIds: string[]) {
  return useQuery({
    queryKey: ["sbu-performance", campaignId, instanceIds],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_campaign_sbu_performance', {
          p_campaign_id: campaignId,
          p_instance_id: instanceIds.length > 0 ? instanceIds[0] : null
        });

      if (error) throw error;
      return data;
    },
    enabled: instanceIds.length > 0
  });
}

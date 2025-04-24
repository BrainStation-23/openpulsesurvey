
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
// Update the import path to the correct location of nps types
import { NpsComparisonData } from "../../../ReportsTab/types/nps";

interface SupervisorSatisfactionData {
  dimension: string;
  unsatisfied: number;
  neutral: number;
  satisfied: number;
  total: number;
  avg_score: number;
}

export function useSupervisorData(
  campaignId: string | undefined,
  instanceId: string | undefined,
  questionName: string,
  isNps: boolean
) {
  return useQuery({
    queryKey: ["supervisor-data", campaignId, instanceId, questionName, isNps],
    queryFn: async () => {
      if (!campaignId || !instanceId) {
        throw new Error("Campaign or instance ID not provided");
      }

      const rpcName = isNps ? "get_supervisor_enps" : "get_supervisor_satisfaction";
      const { data, error } = await supabase.rpc(rpcName, {
        p_campaign_id: campaignId,
        p_instance_id: instanceId,
        p_question_name: questionName,
      });

      if (error) throw error;

      return isNps 
        ? data as NpsComparisonData[]
        : data as SupervisorSatisfactionData[];
    },
    enabled: !!campaignId && !!instanceId && !!questionName,
  });
}

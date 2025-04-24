
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NpsComparisonData } from "@/pages/admin/surveys/campaigns/[id]/components/ReportsTab/types/nps";

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

      if (isNps) {
        // For NPS questions, use get_supervisor_enps
        const { data, error } = await supabase.rpc("get_supervisor_enps", {
          p_campaign_id: campaignId,
          p_instance_id: instanceId,
          p_question_name: questionName,
        });

        if (error) throw error;
        return data as NpsComparisonData[];
      } else {
        // For satisfaction questions, use get_dimension_satisfaction with 'supervisor' dimension
        const { data, error } = await supabase.rpc("get_dimension_satisfaction", {
          p_campaign_id: campaignId,
          p_instance_id: instanceId,
          p_question_name: questionName,
          p_dimension: 'supervisor'
        });

        if (error) throw error;
        return data as SupervisorSatisfactionData[];
      }
    },
    enabled: !!campaignId && !!instanceId && !!questionName,
  });
}

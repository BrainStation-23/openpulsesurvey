
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

// Define valid dimensions for type safety
export type ValidDimension = 'supervisor' | 'gender' | 'sbu' | 'location' | 'employment_type' | 'level' | 'employee_type' | 'employee_role';

export function useSupervisorData(
  campaignId: string | undefined,
  instanceId: string | undefined,
  questionName: string,
  isNps: boolean,
  dimension: ValidDimension = 'supervisor'
) {
  return useQuery({
    queryKey: ["supervisor-data", campaignId, instanceId, questionName, isNps, dimension],
    queryFn: async () => {
      if (!campaignId || !instanceId) {
        throw new Error("Campaign or instance ID not provided");
      }

      if (isNps) {
        // For NPS questions, use get_dimension_nps
        const { data, error } = await supabase.rpc("get_dimension_nps", {
          p_campaign_id: campaignId,
          p_instance_id: instanceId,
          p_question_name: questionName,
          p_dimension: dimension
        });

        if (error) throw error;
        return data as NpsComparisonData[];
      } else {
        // For satisfaction questions, use get_dimension_satisfaction with dimension
        const { data, error } = await supabase.rpc("get_dimension_satisfaction", {
          p_campaign_id: campaignId,
          p_instance_id: instanceId,
          p_question_name: questionName,
          p_dimension: dimension
        });

        if (error) throw error;
        return data as SupervisorSatisfactionData[];
      }
    },
    enabled: !!campaignId && !!instanceId && !!questionName,
  });
}


import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ComparisonDimension } from "../types/comparison";
import { NpsComparisonData } from "../types/nps";

interface DimensionComparisonData {
  dimension: string;
  unsatisfied: number;
  neutral: number;
  satisfied: number;
  total: number;
  avg_score: number;
}

export function useDimensionComparison(
  campaignId: string | undefined,
  instanceId: string | undefined,
  questionName: string,
  dimension: ComparisonDimension,
  isNps: boolean
) {
  return useQuery({
    queryKey: ["dimension-comparison", campaignId, instanceId, questionName, dimension, isNps],
    queryFn: async () => {
      if (!campaignId || !instanceId) {
        throw new Error("Campaign or instance ID not provided");
      }

      if (isNps) {
        const { data, error } = await supabase.rpc(
          'get_dimension_nps',
          {
            p_campaign_id: campaignId,
            p_instance_id: instanceId,
            p_question_name: questionName,
            p_dimension: dimension
          }
        );

        if (error) throw error;
        return data as NpsComparisonData[];
      } else {
        const { data, error } = await supabase.rpc(
          'get_dimension_satisfaction',
          {
            p_campaign_id: campaignId,
            p_instance_id: instanceId,
            p_question_name: questionName,
            p_dimension: dimension
          }
        );

        if (error) throw error;
        return data as DimensionComparisonData[];
      }
    },
    enabled: !!campaignId && !!instanceId && !!questionName && dimension !== 'none',
  });
}

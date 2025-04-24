
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ComparisonDimension } from "../types/comparison";

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
  dimension: ComparisonDimension
) {
  return useQuery({
    queryKey: ["dimension-comparison", campaignId, instanceId, questionName, dimension],
    queryFn: async () => {
      if (!campaignId || !instanceId) {
        throw new Error("Campaign or instance ID not provided");
      }

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
    },
    enabled: !!campaignId && !!instanceId && !!questionName && dimension !== 'none',
  });
}

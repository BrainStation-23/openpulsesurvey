
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ComparisonDimension } from "../types/comparison";

interface ComparisonDataParams {
  campaignId: string;
  instanceId?: string;
  questionName: string;
  dimension: ComparisonDimension;
}

export function useComparisonData({
  campaignId,
  instanceId,
  questionName,
  dimension
}: ComparisonDataParams) {
  return useQuery({
    // Only fetch if a meaningful dimension is selected
    enabled: dimension !== "none",
    queryKey: ["comparison-data", campaignId, instanceId, questionName, dimension],
    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        'get_comparison_data',
        {
          p_campaign_id: campaignId,
          p_instance_id: instanceId || null,
          p_question_name: questionName,
          p_dimension: dimension
        }
      );
      
      if (error) throw error;
      return data;
    },
  });
}

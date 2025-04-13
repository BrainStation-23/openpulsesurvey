
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
      // Use fetch directly to call our RPC function
      const { data, error } = await supabase
        .from('get_comparison_data')
        .select()
        .eq('p_campaign_id', campaignId)
        .eq('p_instance_id', instanceId || null)
        .eq('p_question_name', questionName)
        .eq('p_dimension', dimension);
      
      if (error) throw error;
      return data || [];
    },
  });
}

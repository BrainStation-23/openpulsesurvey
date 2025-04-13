
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ComparisonDimension } from "../types/comparison";
import { ComparisonDataItem } from "../types/rpc";

interface ComparisonData {
  dimension: string;
  yes_count: number;
  no_count: number;
  avg_rating: number;
  detractors: number;
  passives: number;
  promoters: number;
  text_response_count: number;
  total: number;
  text_samples: string[];
}

export function useComparisonData(
  campaignId: string,
  instanceId: string | undefined,
  questionName: string,
  dimension: ComparisonDimension
) {
  return useQuery<ComparisonDataItem[]>({
    queryKey: ["comparison", campaignId, instanceId, questionName, dimension],
    queryFn: async () => {
      if (dimension === 'none') {
        return [];
      }
      
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
      return data as ComparisonDataItem[];
    },
    enabled: dimension !== 'none',
  });
}

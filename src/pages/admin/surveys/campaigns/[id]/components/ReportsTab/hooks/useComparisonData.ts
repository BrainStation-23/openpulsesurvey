
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ComparisonDimension } from "../types/comparison";
import { ComparisonDataItem } from "../types/rpc";

type ComparisonParams = {
  campaignId: string;
  instanceId?: string; 
  questionName: string;
  dimension: ComparisonDimension;
}

export function useComparisonData(
  params: ComparisonParams | null
) {
  return useQuery<ComparisonDataItem[]>({
    queryKey: params ? ["comparison", params.campaignId, params.instanceId, params.questionName, params.dimension] : [],
    queryFn: async () => {
      if (!params || params.dimension === 'none') {
        return [];
      }
      
      const { data, error } = await supabase.rpc(
        'get_comparison_data',
        {
          p_campaign_id: params.campaignId,
          p_instance_id: params.instanceId || null,
          p_question_name: params.questionName,
          p_dimension: params.dimension
        }
      );

      if (error) throw error;
      
      // Transform the raw data to match our expected interface
      return (data || []).map(item => ({
        dimension: item.dimension,
        yes_count: item.yes_count,
        no_count: item.no_count,
        avg_rating: item.avg_rating,
        detractors: item.detractors,
        passives: item.passives,
        promoters: item.promoters,
        text_response_count: item.text_response_count,
        total: item.total,
        text_samples: item.text_samples
      }));
    },
    enabled: !!params && params.dimension !== 'none',
  });
}

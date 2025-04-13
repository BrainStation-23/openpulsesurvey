
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
      
      // Select the appropriate function based on the dimension
      let functionName: string;
      
      switch (params.dimension) {
        case 'gender':
          functionName = 'get_gender_comparison_data';
          break;
        case 'sbu':
          functionName = 'get_sbu_comparison_data';
          break;
        case 'location':
          functionName = 'get_location_comparison_data';
          break;
        case 'employment_type':
          functionName = 'get_employment_type_comparison_data';
          break;
        case 'level':
          functionName = 'get_level_comparison_data';
          break;
        case 'employee_type':
          functionName = 'get_employee_type_comparison_data';
          break;
        case 'employee_role':
          functionName = 'get_employee_role_comparison_data';
          break;
        default:
          return [];
      }
      
      const { data, error } = await supabase.rpc(
        functionName,
        {
          p_campaign_id: params.campaignId,
          p_instance_id: params.instanceId || null,
          p_question_name: params.questionName
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

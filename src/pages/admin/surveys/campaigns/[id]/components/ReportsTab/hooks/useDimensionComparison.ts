
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ComparisonDimension, DimensionComparisonData, BooleanComparisonData, NpsComparisonData, RadioGroupComparisonData } from "../types/comparison";

export function useDimensionComparison(
  campaignId: string | undefined,
  instanceId: string | undefined,
  questionName: string,
  dimension: ComparisonDimension,
  isNps: boolean,
  isBoolean?: boolean,
  isRadioGroup?: boolean
) {
  return useQuery({
    queryKey: ["dimension-comparison", campaignId, instanceId, questionName, dimension, isNps, isBoolean, isRadioGroup],
    queryFn: async () => {
      if (!campaignId || !instanceId) {
        throw new Error("Campaign or instance ID not provided");
      }

      if (isBoolean) {
        const { data, error } = await supabase.rpc(
          'get_dimension_bool',
          {
            p_campaign_id: campaignId,
            p_instance_id: instanceId,
            p_question_name: questionName,
            p_dimension: dimension
          }
        );

        if (error) throw error;
        return data as BooleanComparisonData[];
      }

      if (isRadioGroup) {
        const { data, error } = await supabase.rpc(
          'get_dimension_radiogroup',
          {
            p_campaign_id: campaignId,
            p_instance_id: instanceId,
            p_question_name: questionName,
            p_dimension: dimension
          }
        );

        if (error) throw error;
        return data as RadioGroupComparisonData[];
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

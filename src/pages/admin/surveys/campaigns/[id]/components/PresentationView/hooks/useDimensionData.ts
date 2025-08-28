
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NpsComparisonData } from "@/pages/admin/surveys/campaigns/[id]/components/ReportsTab/types/nps";
import { RadioGroupComparisonData } from "../types/comparison";

interface SupervisorSatisfactionData {
  dimension: string;
  unsatisfied: number;
  neutral: number;
  satisfied: number;
  total: number;
  avg_score: number;
}

interface BooleanComparisonData {
  dimension: string;
  yes_count: number;
  no_count: number;
  total_count: number;
}

// Define valid dimensions for type safety
export type ValidDimension = 'supervisor' | 'gender' | 'sbu' | 'location' | 'employment_type' | 'level' | 'employee_type' | 'employee_role' | 'generation' | 'none';

export function useDimensionData(
  campaignId: string | undefined,
  instanceId: string | undefined,
  questionName: string,
  isNps: boolean,
  isBoolean: boolean,
  isRadioGroup: boolean = false,
  dimension: ValidDimension = 'supervisor'
) {
  return useQuery({
    queryKey: ["supervisor-data", campaignId, instanceId, questionName, isNps, isBoolean, isRadioGroup, dimension],
    queryFn: async () => {
      if (!campaignId || !instanceId) {
        throw new Error("Campaign or instance ID not provided");
      }

      // For 'none' dimension, pass empty string to get overall data
      const dimensionParam = dimension === 'none' ? '' : dimension;

      if (isRadioGroup) {
        // For radiogroup questions, use get_dimension_radiogroup
        const { data, error } = await supabase.rpc("get_dimension_radiogroup", {
          p_campaign_id: campaignId,
          p_instance_id: instanceId,
          p_question_name: questionName,
          p_dimension: dimensionParam
        });

        if (error) throw error;
        return data as RadioGroupComparisonData[];
      } else if (isNps) {
        // For NPS questions, use get_dimension_nps
        const { data, error } = await supabase.rpc("get_dimension_nps", {
          p_campaign_id: campaignId,
          p_instance_id: instanceId,
          p_question_name: questionName,
          p_dimension: dimensionParam
        });

        if (error) throw error;
        return data as NpsComparisonData[];
      } else if (isBoolean) {
        // For boolean questions, use get_dimension_bool
        const { data, error } = await supabase.rpc("get_dimension_bool", {
          p_campaign_id: campaignId,
          p_instance_id: instanceId,
          p_question_name: questionName,
          p_dimension: dimensionParam
        });

        if (error) throw error;
        return data as BooleanComparisonData[];
      } else {
        // For satisfaction questions, use get_dimension_satisfaction
        const { data, error } = await supabase.rpc("get_dimension_satisfaction", {
          p_campaign_id: campaignId,
          p_instance_id: instanceId,
          p_question_name: questionName,
          p_dimension: dimensionParam
        });

        if (error) throw error;
        return data as SupervisorSatisfactionData[];
      }
    },
    enabled: !!campaignId && !!instanceId && !!questionName,
  });
}

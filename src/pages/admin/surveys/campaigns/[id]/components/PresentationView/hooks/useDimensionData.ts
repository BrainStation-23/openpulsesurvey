
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ComparisonDimension } from '../types/comparison';

export function useDimensionData(
  campaignId?: string,
  instanceId?: string,
  questionName?: string,
  isNps?: boolean,
  isBoolean?: boolean,
  dimension: ComparisonDimension = 'supervisor'
) {
  return useQuery({
    queryKey: ['dimension-data', campaignId, instanceId, questionName, dimension],
    queryFn: async () => {
      if (!campaignId || !questionName) return null;
      
      if (isNps) {
        // Call RPC function for NPS data by dimension
        const { data, error } = await supabase.rpc('get_nps_by_dimension', {
          p_campaign_id: campaignId,
          p_instance_id: instanceId || null,
          p_question_name: questionName,
          p_dimension: dimension
        });
        
        if (error) throw error;
        return data;
      } 
      
      if (isBoolean) {
        // Call RPC function for boolean data by dimension
        const { data, error } = await supabase.rpc('get_boolean_by_dimension', {
          p_campaign_id: campaignId,
          p_instance_id: instanceId || null,
          p_question_name: questionName,
          p_dimension: dimension
        });
        
        if (error) throw error;
        return data;
      }
      
      // Default case: satisfaction data by dimension
      const { data, error } = await supabase.rpc('get_satisfaction_by_dimension', {
        p_campaign_id: campaignId,
        p_instance_id: instanceId || null,
        p_question_name: questionName,
        p_dimension: dimension
      });
      
      if (error) throw error;
      return data;
    },
    enabled: !!campaignId && !!questionName,
    refetchOnWindowFocus: false
  });
}

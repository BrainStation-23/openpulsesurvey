
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TextAnalysisParams {
  campaignId: string;
  instanceId?: string;
  questionName: string;
}

export function useTextAnalysis({
  campaignId,
  instanceId,
  questionName
}: TextAnalysisParams) {
  return useQuery({
    queryKey: ["text-analysis", campaignId, instanceId, questionName],
    queryFn: async () => {
      // Use fetch directly to call our RPC function
      const { data, error } = await supabase
        .from('get_text_analysis')
        .select()
        .eq('p_campaign_id', campaignId)
        .eq('p_instance_id', instanceId || null)
        .eq('p_question_name', questionName);
      
      if (error) throw error;
      return data || [];
    },
  });
}

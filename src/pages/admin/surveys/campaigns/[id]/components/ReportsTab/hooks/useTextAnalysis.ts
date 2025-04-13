
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
      const { data, error } = await supabase.rpc(
        'get_text_analysis',
        {
          p_campaign_id: campaignId,
          p_instance_id: instanceId || null,
          p_question_name: questionName
        }
      );
      
      if (error) throw error;
      return data;
    },
  });
}

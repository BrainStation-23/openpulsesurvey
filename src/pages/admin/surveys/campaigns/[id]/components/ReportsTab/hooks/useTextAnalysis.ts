
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TextAnalysisItem } from "../types/rpc";

export function useTextAnalysis(
  campaignId: string,
  instanceId: string | undefined,
  questionName: string
) {
  return useQuery<TextAnalysisItem[]>({
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
      
      // Cast the data to the correct type using type assertion
      return (data as unknown) as TextAnalysisItem[];
    },
  });
}


import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TextAnalysisItem } from "../types/rpc";

interface WordFrequency {
  text: string;
  value: number;
}

export function useTextAnalysis(
  campaignId: string,
  instanceId: string | undefined,
  questionName: string
) {
  return useQuery<WordFrequency[]>({
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
      return data as TextAnalysisItem[];
    },
  });
}

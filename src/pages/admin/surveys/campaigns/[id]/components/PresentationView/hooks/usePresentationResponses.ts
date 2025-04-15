import { useQuery } from "@tanstack/react-query";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { ProcessedData } from "../types/responses";

export function usePresentationResponses(campaignId: string, instanceId?: string) {
  const supabase = useSupabaseClient();

  return useQuery({
    queryKey: ['presentation-responses', campaignId, instanceId],
    queryFn: async (): Promise<ProcessedData> => {
      const { data: questions, error: questionsError } = await supabase
        .from('survey_questions')
        .select('name, title, type, rateCount')
        .eq('campaign_id', campaignId);

      if (questionsError) {
        console.error("Error fetching questions:", questionsError);
        throw new Error(questionsError.message);
      }

      const { data: responses, error: responsesError } = await supabase
        .from('get_processed_survey_responses')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('campaign_instance_id', instanceId);

      if (responsesError) {
        console.error("Error fetching responses:", responsesError);
        throw new Error(responsesError.message);
      }

      return {
        questions: questions || [],
        responses: responses || [],
        campaignId,
        instanceId: instanceId || ''
      };
    },
    enabled: !!campaignId && !!instanceId
  });
}
